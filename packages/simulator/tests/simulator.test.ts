import { describe, it, expect } from 'vitest';
import { Simulator } from '../src/index.js';

describe('Simulator', () => {
  it('executes addi and reads register', () => {
    const sim = new Simulator();
    sim.load(`
      .text
      addi a0, zero, 42
    `);
    sim.step();
    const regs = sim.registers;
    const a0 = regs.find(r => r.alias === 'a0')!;
    expect(a0.value).toBe(42);
  });

  it('executes add instruction', () => {
    const sim = new Simulator();
    sim.load(`
      .text
      addi t0, zero, 10
      addi t1, zero, 20
      add  t2, t0, t1
    `);
    sim.step(); sim.step(); sim.step();
    const regs = sim.registers;
    expect(regs.find(r => r.alias === 't2')!.value).toBe(30);
  });

  it('executes sub instruction', () => {
    const sim = new Simulator();
    sim.load(`addi t0, zero, 15\naddi t1, zero, 5\nsub t2, t0, t1`);
    sim.run();
    expect(sim.registers.find(r => r.alias === 't2')!.value).toBe(10);
  });

  it('handles branch (beq) taken', () => {
    const sim = new Simulator();
    sim.load(`
      .text
      addi t0, zero, 0
      beq  t0, zero, done
      addi t1, zero, 99
    done:
      addi t2, zero, 1
    `);
    sim.run();
    // t1 should NOT be 99 (branch was taken, skipped addi t1)
    expect(sim.registers.find(r => r.alias === 't1')!.value).toBe(0);
    expect(sim.registers.find(r => r.alias === 't2')!.value).toBe(1);
  });

  it('handles loop with bne', () => {
    const sim = new Simulator();
    sim.load(`
      .text
      addi t0, zero, 0
      addi t1, zero, 5
    loop:
      addi t0, t0, 1
      bne  t0, t1, loop
    `);
    sim.run();
    expect(sim.registers.find(r => r.alias === 't0')!.value).toBe(5);
  });

  it('lw/sw round-trip', () => {
    const sim = new Simulator();
    sim.load(`
      .text
      addi t0, zero, 42
      addi t1, zero, 4096
      sw   t0, 0(t1)
      lw   t2, 0(t1)
    `);
    sim.run();
    expect(sim.registers.find(r => r.alias === 't2')!.value).toBe(42);
  });

  it('lui loads upper immediate', () => {
    const sim = new Simulator();
    sim.load(`lui t0, 1`);
    sim.run();
    expect(sim.registers.find(r => r.alias === 't0')!.value).toBe(4096);
  });

  it('syscall print_int outputs number', () => {
    const sim = new Simulator();
    sim.load(`
      .text
      addi a0, zero, 123
      addi a7, zero, 1
      ecall
    `);
    sim.run();
    expect(sim.output).toBe('123');
  });

  it('syscall exit halts simulator', () => {
    const sim = new Simulator();
    sim.load(`
      .text
      addi a7, zero, 10
      ecall
      addi t0, zero, 99
    `);
    sim.run();
    // t0 should be 0 since ecall exit halted before addi
    expect(sim.registers.find(r => r.alias === 't0')!.value).toBe(0);
    expect(sim.state.halted).toBe(true);
  });

  it('halts at end of program', () => {
    const sim = new Simulator();
    sim.load(`addi a0, zero, 1`);
    sim.run();
    expect(sim.state.halted).toBe(true);
  });

  it('x0 is always zero', () => {
    const sim = new Simulator();
    sim.load(`addi x0, zero, 99`);
    sim.run();
    expect(sim.registers[0].value).toBe(0);
  });

  it('handles jal and ret', () => {
    const sim = new Simulator();
    sim.load(`
      .text
      jal ra, myfunc
      addi t1, zero, 2
      addi a7, zero, 10
      ecall
    myfunc:
      addi t0, zero, 1
      ret
    `);
    sim.run();
    expect(sim.registers.find(r => r.alias === 't0')!.value).toBe(1);
    expect(sim.registers.find(r => r.alias === 't1')!.value).toBe(2);
  });

  it('handles .data section string', () => {
    const sim = new Simulator();
    sim.load(`
      .data
    msg:
      .asciz "hello"
      .text
      la a0, msg
      addi a7, zero, 4
      ecall
    `);
    sim.run();
    expect(sim.output).toBe('hello');
  });
});
