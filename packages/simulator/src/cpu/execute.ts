import { type RegisterFile } from './registers.js';
import { type Memory } from '../memory/memory.js';
import * as ALU from './alu.js';
import { type AssembledProgram } from '../assembler/assembler.js';
import { type Instruction } from '../assembler/parser.js';

export type SyscallHandler = (regs: RegisterFile, mem: Memory) => SyscallResult;

export interface SyscallResult {
  output?: string;
  exit?: boolean;
  exitCode?: number;
  waitForInput?: boolean;
  inputCallback?: (value: number) => void;
}

export interface ExecuteContext {
  regs: RegisterFile;
  mem: Memory;
  assembled: AssembledProgram;
  instructions: Instruction[];
  pc: number; // index into instructions array
  syscall?: SyscallHandler;
}

export interface ExecuteResult {
  nextPc: number; // next instruction index
  output?: string;
  exit?: boolean;
  exitCode?: number;
  waitForInput?: boolean;
  inputCallback?: (value: number) => void;
}

/**
 * Execute one instruction at the given PC (instruction index).
 * Returns the next PC and any side-effect results.
 */
export function executeInstruction(ctx: ExecuteContext): ExecuteResult {
  const { regs, mem, assembled, instructions, pc } = ctx;
  const instr = instructions[pc];
  if (!instr) return { nextPc: pc }; // safety

  const op = instr.op;
  const ops = instr.operands;
  let nextPc = pc + 1;

  /**
   * Resolve an operand that can be a register name, label, or number.
   */
  function resolveImm(s: string): number {
    if (assembled.labelAddrs.has(s)) {
      return assembled.labelAddrs.get(s)!;
    }
    if (/^-?\d+$/.test(s)) return parseInt(s, 10);
    if (/^0x[0-9a-fA-F]+$/i.test(s)) return parseInt(s, 16);
    if (/^0b[01]+$/i.test(s)) return parseInt(s.slice(2), 2);
    return 0;
  }

  function reg(s: string): number { return regs.read(regs.indexOf(s)); }
  function setReg(s: string, v: number): void { regs.write(regs.indexOf(s), v); }

  /** Parse "imm(reg)" format, returns { imm, base } */
  function parseMemOp(s: string): { imm: number; base: number } {
    const m = s.match(/^(-?\w+)\((\w+)\)$/);
    if (!m) return { imm: 0, base: 0 };
    return { imm: resolveImm(m[1]), base: reg(m[2]) };
  }

  /** Get current instruction's PC address */
  const pcAddr = assembled.instrAddrs[pc];

  switch (op) {
    // --- R-type arithmetic ---
    case 'add': setReg(ops[0], ALU.add(reg(ops[1]), reg(ops[2]))); break;
    case 'sub': setReg(ops[0], ALU.sub(reg(ops[1]), reg(ops[2]))); break;
    case 'and': setReg(ops[0], ALU.and(reg(ops[1]), reg(ops[2]))); break;
    case 'or':  setReg(ops[0], ALU.or(reg(ops[1]), reg(ops[2]))); break;
    case 'xor': setReg(ops[0], ALU.xor(reg(ops[1]), reg(ops[2]))); break;
    case 'sll': setReg(ops[0], ALU.sll(reg(ops[1]), reg(ops[2]))); break;
    case 'srl': setReg(ops[0], ALU.srl(reg(ops[1]), reg(ops[2]))); break;
    case 'sra': setReg(ops[0], ALU.sra(reg(ops[1]), reg(ops[2]))); break;
    case 'slt': setReg(ops[0], ALU.slt(reg(ops[1]), reg(ops[2]))); break;
    case 'sltu': setReg(ops[0], ALU.sltu(reg(ops[1]), reg(ops[2]))); break;

    // --- MUL/DIV (RV32M, basic support) ---
    case 'mul': setReg(ops[0], Math.imul(reg(ops[1]), reg(ops[2])) | 0); break;
    case 'div': {
      const a = reg(ops[1]) | 0, b = reg(ops[2]) | 0;
      setReg(ops[0], b === 0 ? -1 : (a / b) | 0);
      break;
    }
    case 'rem': {
      const a = reg(ops[1]) | 0, b = reg(ops[2]) | 0;
      setReg(ops[0], b === 0 ? a : a % b);
      break;
    }

    // --- I-type arithmetic ---
    case 'addi': setReg(ops[0], ALU.add(reg(ops[1]), resolveImm(ops[2]))); break;
    case 'andi': setReg(ops[0], ALU.and(reg(ops[1]), resolveImm(ops[2]))); break;
    case 'ori':  setReg(ops[0], ALU.or(reg(ops[1]), resolveImm(ops[2]))); break;
    case 'xori': setReg(ops[0], ALU.xor(reg(ops[1]), resolveImm(ops[2]))); break;
    case 'slli': setReg(ops[0], ALU.sll(reg(ops[1]), resolveImm(ops[2]))); break;
    case 'srli': setReg(ops[0], ALU.srl(reg(ops[1]), resolveImm(ops[2]))); break;
    case 'srai': setReg(ops[0], ALU.sra(reg(ops[1]), resolveImm(ops[2]))); break;
    case 'slti': setReg(ops[0], ALU.slt(reg(ops[1]), resolveImm(ops[2]))); break;
    case 'sltiu': setReg(ops[0], ALU.sltu(reg(ops[1]) >>> 0, resolveImm(ops[2]) >>> 0)); break;

    // --- Load instructions ---
    case 'lw': { const { imm, base } = parseMemOp(ops[1]); setReg(ops[0], mem.readWord(base + imm)); break; }
    case 'lh': { const { imm, base } = parseMemOp(ops[1]); setReg(ops[0], ALU.signExtend(mem.readHalf(base + imm), 16)); break; }
    case 'lhu': { const { imm, base } = parseMemOp(ops[1]); setReg(ops[0], mem.readHalf(base + imm)); break; }
    case 'lb': { const { imm, base } = parseMemOp(ops[1]); setReg(ops[0], ALU.signExtend(mem.readByte(base + imm), 8)); break; }
    case 'lbu': { const { imm, base } = parseMemOp(ops[1]); setReg(ops[0], mem.readByte(base + imm)); break; }

    // --- Store instructions ---
    case 'sw': { const { imm, base } = parseMemOp(ops[1]); mem.writeWord(base + imm, reg(ops[0])); break; }
    case 'sh': { const { imm, base } = parseMemOp(ops[1]); mem.writeHalf(base + imm, reg(ops[0])); break; }
    case 'sb': { const { imm, base } = parseMemOp(ops[1]); mem.writeByte(base + imm, reg(ops[0])); break; }

    // --- U-type ---
    case 'lui': setReg(ops[0], (resolveImm(ops[1]) & 0xfffff) << 12); break;
    case 'auipc': setReg(ops[0], ((resolveImm(ops[1]) & 0xfffff) << 12) + pcAddr); break;

    // --- Branch instructions ---
    case 'beq': if (reg(ops[0]) === reg(ops[1])) nextPc = resolveLabel(ops[2], assembled, pc); break;
    case 'bne': if (reg(ops[0]) !== reg(ops[1])) nextPc = resolveLabel(ops[2], assembled, pc); break;
    case 'blt': if ((reg(ops[0]) | 0) < (reg(ops[1]) | 0)) nextPc = resolveLabel(ops[2], assembled, pc); break;
    case 'bge': if ((reg(ops[0]) | 0) >= (reg(ops[1]) | 0)) nextPc = resolveLabel(ops[2], assembled, pc); break;
    case 'bltu': if ((reg(ops[0]) >>> 0) < (reg(ops[1]) >>> 0)) nextPc = resolveLabel(ops[2], assembled, pc); break;
    case 'bgeu': if ((reg(ops[0]) >>> 0) >= (reg(ops[1]) >>> 0)) nextPc = resolveLabel(ops[2], assembled, pc); break;

    // --- Jump instructions ---
    case 'jal': {
      const target = resolveLabel(ops[1], assembled, pc);
      setReg(ops[0], pcAddr + 4);
      nextPc = target;
      break;
    }
    case 'jalr': {
      // jalr rd, imm(rs1) or jalr rd, rs1, imm
      let base2: number, imm2: number;
      if (ops[1].includes('(')) {
        const p = parseMemOp(ops[1]);
        base2 = p.base; imm2 = p.imm;
      } else {
        base2 = reg(ops[1]); imm2 = ops[2] ? resolveImm(ops[2]) : 0;
      }
      const targetAddr = (base2 + imm2) & ~1;
      setReg(ops[0], pcAddr + 4);
      // convert address to instruction index
      const tIdx = (targetAddr - assembled.instrAddrs[0]) / 4;
      nextPc = Number.isInteger(tIdx) && tIdx >= 0 ? tIdx : pc + 1;
      break;
    }

    // --- System ---
    case 'ecall': {
      if (ctx.syscall) {
        const result = ctx.syscall(regs, mem);
        return { nextPc, ...result };
      }
      break;
    }
    case 'ebreak': {
      // treated as a breakpoint / halt
      return { nextPc, exit: true, exitCode: 0 };
    }

    // --- Pseudo-instructions ---
    case 'nop': break;
    case 'mv': setReg(ops[0], reg(ops[1])); break;
    case 'li': setReg(ops[0], resolveImm(ops[1])); break;
    case 'la': setReg(ops[0], resolveImm(ops[1])); break;
    case 'not': setReg(ops[0], ~reg(ops[1])); break;
    case 'neg': setReg(ops[0], ALU.sub(0, reg(ops[1]))); break;
    case 'seqz': setReg(ops[0], reg(ops[1]) === 0 ? 1 : 0); break;
    case 'snez': setReg(ops[0], reg(ops[1]) !== 0 ? 1 : 0); break;
    case 'sltz': setReg(ops[0], (reg(ops[1]) | 0) < 0 ? 1 : 0); break;
    case 'sgtz': setReg(ops[0], (reg(ops[1]) | 0) > 0 ? 1 : 0); break;
    case 'beqz': if (reg(ops[0]) === 0) nextPc = resolveLabel(ops[1], assembled, pc); break;
    case 'bnez': if (reg(ops[0]) !== 0) nextPc = resolveLabel(ops[1], assembled, pc); break;
    case 'blez': if ((reg(ops[0]) | 0) <= 0) nextPc = resolveLabel(ops[1], assembled, pc); break;
    case 'bgez': if ((reg(ops[0]) | 0) >= 0) nextPc = resolveLabel(ops[1], assembled, pc); break;
    case 'bltz': if ((reg(ops[0]) | 0) < 0) nextPc = resolveLabel(ops[1], assembled, pc); break;
    case 'bgtz': if ((reg(ops[0]) | 0) > 0) nextPc = resolveLabel(ops[1], assembled, pc); break;
    case 'j': nextPc = resolveLabel(ops[0], assembled, pc); break;
    case 'jr': {
      const targetAddr2 = reg(ops[0]) & ~1;
      const tIdx2 = (targetAddr2 - assembled.instrAddrs[0]) / 4;
      nextPc = Number.isInteger(tIdx2) && tIdx2 >= 0 ? tIdx2 : pc + 1;
      break;
    }
    case 'ret': {
      const raVal = regs.read(1); // ra = x1
      const tIdx3 = (raVal - assembled.instrAddrs[0]) / 4;
      nextPc = Number.isInteger(tIdx3) && tIdx3 >= 0 ? tIdx3 : instructions.length;
      break;
    }
    case 'call': {
      const callTarget = resolveLabel(ops[0], assembled, pc);
      regs.write(1, pcAddr + 4); // ra = return address
      nextPc = callTarget;
      break;
    }

    default:
      // Unknown instruction — treat as no-op but don't crash
      break;
  }

  return { nextPc };
}

/** Resolve a branch/jump target label to an instruction index. */
function resolveLabel(
  target: string,
  assembled: AssembledProgram,
  currentPc: number,
): number {
  if (assembled.labelAddrs.has(target)) {
    const addr = assembled.labelAddrs.get(target)!;
    const base = assembled.instrAddrs[0];
    const idx = (addr - base) / 4;
    return Number.isInteger(idx) && idx >= 0 ? idx : currentPc + 1;
  }
  // numeric offset
  if (/^-?\d+$/.test(target)) {
    return currentPc + parseInt(target, 10) / 4;
  }
  return currentPc + 1;
}
