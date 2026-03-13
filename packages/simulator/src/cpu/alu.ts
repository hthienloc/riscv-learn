/**
 * RISC-V RV32I Arithmetic Logic Unit.
 * All operations work on 32-bit signed integers.
 */

/** Signed 32-bit addition with wrap-around. */
export function add(a: number, b: number): number { return (a + b) | 0; }

/** Signed 32-bit subtraction. */
export function sub(a: number, b: number): number { return (a - b) | 0; }

/** Bitwise AND. */
export function and(a: number, b: number): number { return a & b; }

/** Bitwise OR. */
export function or(a: number, b: number): number { return a | b; }

/** Bitwise XOR. */
export function xor(a: number, b: number): number { return a ^ b; }

/** Logical left shift (32-bit). */
export function sll(a: number, shamt: number): number { return (a << (shamt & 0x1f)) | 0; }

/** Logical right shift (unsigned). */
export function srl(a: number, shamt: number): number { return (a >>> (shamt & 0x1f)) | 0; }

/** Arithmetic right shift (signed). */
export function sra(a: number, shamt: number): number { return (a >> (shamt & 0x1f)) | 0; }

/** Set less than (signed comparison). Returns 1 if a < b, else 0. */
export function slt(a: number, b: number): number { return (a | 0) < (b | 0) ? 1 : 0; }

/** Set less than unsigned. Returns 1 if a < b (unsigned), else 0. */
export function sltu(a: number, b: number): number { return (a >>> 0) < (b >>> 0) ? 1 : 0; }

/** Sign-extend an n-bit value to 32 bits. */
export function signExtend(value: number, bits: number): number {
  const shift = 32 - bits;
  return (value << shift) >> shift;
}
