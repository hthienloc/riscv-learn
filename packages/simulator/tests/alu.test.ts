import { describe, it, expect } from 'vitest';
import * as ALU from '../src/cpu/alu.js';

describe('ALU', () => {
  it('add wraps on overflow', () => {
    expect(ALU.add(0x7fffffff, 1)).toBe(-0x80000000);
  });
  it('sub', () => { expect(ALU.sub(10, 3)).toBe(7); });
  it('and', () => { expect(ALU.and(0b1100, 0b1010)).toBe(0b1000); });
  it('or',  () => { expect(ALU.or(0b1100, 0b1010)).toBe(0b1110); });
  it('xor', () => { expect(ALU.xor(0b1100, 0b1010)).toBe(0b0110); });
  it('sll', () => { expect(ALU.sll(1, 4)).toBe(16); });
  it('srl logical', () => { expect(ALU.srl(-1, 4)).toBe(0x0fffffff); });
  it('sra arithmetic', () => { expect(ALU.sra(-16, 2)).toBe(-4); });
  it('slt signed', () => { expect(ALU.slt(-1, 0)).toBe(1); });
  it('sltu unsigned', () => { expect(ALU.sltu(-1 >>> 0, 0)).toBe(0); });
  it('signExtend 8-bit', () => { expect(ALU.signExtend(0x80, 8)).toBe(-128); });
});
