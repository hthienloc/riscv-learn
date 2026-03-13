import { describe, it, expect } from 'vitest';
import { Memory } from '../src/memory/memory.js';

describe('Memory', () => {
  it('writeByte/readByte round-trip', () => {
    const mem = new Memory();
    mem.writeByte(0, 0xab);
    expect(mem.readByte(0)).toBe(0xab);
  });

  it('writeWord/readWord little-endian', () => {
    const mem = new Memory();
    mem.writeWord(0, 0x12345678);
    expect(mem.readByte(0)).toBe(0x78);
    expect(mem.readByte(1)).toBe(0x56);
    expect(mem.readByte(2)).toBe(0x34);
    expect(mem.readByte(3)).toBe(0x12);
    expect(mem.readWord(0)).toBe(0x12345678);
  });

  it('readByteS sign extends', () => {
    const mem = new Memory();
    mem.writeByte(0, 0xff);
    expect(mem.readByteS(0)).toBe(-1);
  });

  it('writeString/readString round-trip', () => {
    const mem = new Memory();
    mem.writeString(100, 'hello');
    expect(mem.readString(100)).toBe('hello');
  });

  it('throws on out-of-bounds access', () => {
    const mem = new Memory(16);
    expect(() => mem.readByte(16)).toThrow();
  });

  it('reset clears memory', () => {
    const mem = new Memory();
    mem.writeByte(0, 42);
    mem.reset();
    expect(mem.readByte(0)).toBe(0);
  });
});
