import { parse } from './assembler/parser.js';
import { assemble, TEXT_BASE, DATA_BASE, STACK_TOP } from './assembler/assembler.js';
import { RegisterFile } from './cpu/registers.js';
import { Memory } from './memory/memory.js';
import { executeInstruction } from './cpu/execute.js';
import { handleSyscall } from './cpu/syscalls.js';
import type { Instruction } from './assembler/parser.js';
import type { AssembledProgram } from './assembler/assembler.js';

export type { RegisterEntry } from './cpu/registers.js';
export { Memory } from './memory/memory.js';
export { TEXT_BASE, DATA_BASE, STACK_TOP } from './assembler/assembler.js';

export type SimulatorEvent = 'step' | 'halt' | 'error' | 'breakpoint' | 'output';

export interface SimulatorState {
  pc: number; // current instruction index
  pcAddress: number; // current PC address
  running: boolean;
  halted: boolean;
  output: string;
  currentLine: number; // 1-based source line number
  error?: string;
}

export interface StepResult {
  state: SimulatorState;
  output?: string;
  halted: boolean;
  error?: string;
  waitForInput?: boolean;
  inputCallback?: (value: number) => void;
}

type EventCallback<T = unknown> = (data: T) => void;

/**
 * RISC-V RV32I Simulator.
 *
 * Usage:
 * ```ts
 * const sim = new Simulator();
 * sim.load(sourceCode);
 * while (!sim.state.halted) {
 *   const result = sim.step();
 *   if (result.output) console.log(result.output);
 * }
 * ```
 */
export class Simulator {
  private readonly _regs: RegisterFile = new RegisterFile();
  private readonly _mem: Memory = new Memory();
  private _instructions: Instruction[] = [];
  private _assembled: AssembledProgram | null = null;
  private _pc = 0;
  private _halted = false;
  private _running = false;
  private _output = '';
  private _breakpoints = new Set<number>(); // instruction indices
  private _listeners = new Map<SimulatorEvent, EventCallback[]>();
  private _waitingForInput = false;
  private _inputCallback: ((v: number) => void) | null = null;

  // ---- Public API ----

  /**
   * Load and assemble a RISC-V assembly program.
   * Resets state before loading.
   */
  load(source: string): void {
    this.reset();
    try {
      const program = parse(source);
      this._instructions = program.instructions;
      this._assembled = assemble(program, this._mem);
      // Set stack pointer (sp = x2) to top of stack
      this._regs.write(2, STACK_TOP);
      this._halted = this._instructions.length === 0;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      this._halted = true;
      this._emit('error', msg);
    }
  }

  /**
   * Execute one instruction.
   * @returns StepResult with updated state.
   */
  step(): StepResult {
    if (this._halted || this._waitingForInput) {
      return { state: this._getState(), halted: this._halted };
    }
    if (this._pc >= this._instructions.length) {
      this._halted = true;
      this._emit('halt', undefined);
      return { state: this._getState(), halted: true };
    }

    // Breakpoint check
    if (this._breakpoints.has(this._pc)) {
      this._emit('breakpoint', this._pc);
    }

    try {
      const result = executeInstruction({
        regs: this._regs,
        mem: this._mem,
        assembled: this._assembled!,
        instructions: this._instructions,
        pc: this._pc,
        syscall: handleSyscall,
      });

      let output: string | undefined;
      if (result.output !== undefined) {
        this._output += result.output;
        output = result.output;
        this._emit('output', output);
      }

      if (result.exit) {
        this._pc = result.nextPc;
        this._halted = true;
        this._emit('halt', result.exitCode ?? 0);
        return { state: this._getState(), halted: true, output };
      }

      if (result.waitForInput) {
        this._waitingForInput = true;
        this._inputCallback = result.inputCallback ?? null;
        return {
          state: this._getState(),
          halted: false,
          waitForInput: true,
          inputCallback: (v: number) => {
            result.inputCallback?.(v);
            this._waitingForInput = false;
            this._inputCallback = null;
            this._pc = result.nextPc;
          },
        };
      }

      this._pc = result.nextPc;
      this._emit('step', this._pc);

      return {
        state: this._getState(),
        halted: false,
        output,
      };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      this._halted = true;
      this._emit('error', msg);
      return { state: this._getState(), halted: true, error: msg };
    }
  }

  /**
   * Run to completion (or until halted/breakpoint).
   * @param maxSteps Safety limit to prevent infinite loops.
   */
  run(maxSteps = 1_000_000): StepResult {
    let last: StepResult = { state: this._getState(), halted: this._halted };
    let steps = 0;
    while (!this._halted && !this._waitingForInput && steps < maxSteps) {
      last = this.step();
      if (last.waitForInput) return last;
      steps++;
    }
    if (steps >= maxSteps) {
      this._halted = true;
      const msg = 'Maximum step count exceeded (possible infinite loop)';
      this._emit('error', msg);
      return { state: this._getState(), halted: true, error: msg };
    }
    return last;
  }

  /** Reset simulator state. Does not clear loaded program. */
  reset(): void {
    this._regs.reset();
    this._mem.reset();
    this._pc = 0;
    this._halted = false;
    this._running = false;
    this._output = '';
    this._waitingForInput = false;
    this._inputCallback = null;
    this._instructions = [];
    this._assembled = null;
  }

  /** Add a breakpoint at an instruction index. */
  addBreakpoint(instrIndex: number): void { this._breakpoints.add(instrIndex); }

  /** Remove a breakpoint. */
  removeBreakpoint(instrIndex: number): void { this._breakpoints.delete(instrIndex); }

  /** Clear all breakpoints. */
  clearBreakpoints(): void { this._breakpoints.clear(); }

  /** Register an event listener. */
  on(event: SimulatorEvent, callback: EventCallback): void {
    const list = this._listeners.get(event) ?? [];
    list.push(callback);
    this._listeners.set(event, list);
  }

  /** Remove an event listener. */
  off(event: SimulatorEvent, callback: EventCallback): void {
    const list = this._listeners.get(event) ?? [];
    this._listeners.set(event, list.filter(cb => cb !== callback));
  }

  /** Get current snapshot of all registers. */
  get registers() { return this._regs.snapshot(); }

  /** Get current memory (read-only view). */
  get memory() { return this._mem; }

  /** Get current simulator state. */
  get state(): SimulatorState { return this._getState(); }

  /** Get collected output string. */
  get output(): string { return this._output; }

  // ---- Private helpers ----

  private _getState(): SimulatorState {
    const instr = this._instructions[this._pc];
    return {
      pc: this._pc,
      pcAddress: this._assembled?.instrAddrs[this._pc] ?? TEXT_BASE,
      running: this._running,
      halted: this._halted,
      output: this._output,
      currentLine: instr?.line ?? 0,
    };
  }

  private _emit(event: SimulatorEvent, data: unknown): void {
    const cbs = this._listeners.get(event) ?? [];
    for (const cb of cbs) cb(data);
  }
}
