import { describe, it, expect } from 'vitest';
import { RegisterFile } from '../src/cpu/registers.js';

describe('RegisterFile', () => {
  it('x0 is always 0', () => {
    const rf = new RegisterFile();
    rf.write(0, 99);
    expect(rf.read(0)).toBe(0);
  });

  it('write and read round-trip', () => {
    const rf = new RegisterFile();
    rf.write(5, 42);
    expect(rf.read(5)).toBe(42);
  });

  it('resolves alias sp -> x2', () => {
    const rf = new RegisterFile();
    rf.writeByName('sp', 0x7fffeffc);
    expect(rf.readByName('sp')).toBe(0x7fffeffc | 0);
  });

  it('resolves fp alias', () => {
    const rf = new RegisterFile();
    expect(rf.indexOf('fp')).toBe(8);
  });

  it('snapshot returns 32 entries', () => {
    const rf = new RegisterFile();
    expect(rf.snapshot()).toHaveLength(32);
  });

  it('coerces value to 32-bit signed', () => {
    const rf = new RegisterFile();
    rf.write(1, 0x80000000);
    expect(rf.read(1)).toBe(-0x80000000);
  });
});
