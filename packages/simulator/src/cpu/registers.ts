/** ABI names for the 32 RISC-V integer registers */
export const REGISTER_ALIASES: readonly string[] = [
  'zero', 'ra', 'sp', 'gp', 'tp', 't0', 't1', 't2',
  's0', 's1', 'a0', 'a1', 'a2', 'a3', 'a4', 'a5',
  'a6', 'a7', 's2', 's3', 's4', 's5', 's6', 's7',
  's8', 's9', 's10', 's11', 't3', 't4', 't5', 't6',
];

export interface RegisterEntry {
  name: string;
  alias: string;
  value: number;
}

/**
 * RISC-V RV32I register file containing 32 general-purpose 32-bit registers.
 * x0 is hardwired to zero.
 */
export class RegisterFile {
  private readonly _regs: Int32Array = new Int32Array(32);

  /** Read a register by index (0–31). x0 always returns 0. */
  read(index: number): number {
    if (index < 0 || index > 31) throw new RangeError(`Invalid register index: ${index}`);
    return this._regs[index];
  }

  /** Write a register by index. Writes to x0 are silently ignored. */
  write(index: number, value: number): void {
    if (index < 0 || index > 31) throw new RangeError(`Invalid register index: ${index}`);
    if (index === 0) return; // x0 hardwired to zero
    this._regs[index] = value | 0; // coerce to 32-bit signed
  }

  /** Read by ABI alias (e.g. 'sp', 'a0') or canonical name ('x2'). */
  readByName(name: string): number {
    return this.read(this.indexOf(name));
  }

  /** Write by ABI alias or canonical name. */
  writeByName(name: string, value: number): void {
    this.write(this.indexOf(name), value);
  }

  /** Resolve a register name or alias to its numeric index. */
  indexOf(name: string): number {
    // canonical x0–x31
    const xMatch = name.match(/^x(\d+)$/);
    if (xMatch) {
      const idx = parseInt(xMatch[1], 10);
      if (idx >= 0 && idx <= 31) return idx;
    }
    const aliasIdx = REGISTER_ALIASES.indexOf(name);
    if (aliasIdx !== -1) return aliasIdx;
    // fp is alias for s0 (x8)
    if (name === 'fp') return 8;
    throw new Error(`Unknown register: ${name}`);
  }

  /** Reset all registers to zero. */
  reset(): void {
    this._regs.fill(0);
  }

  /** Return a snapshot of all registers as an array of RegisterEntry. */
  snapshot(): RegisterEntry[] {
    return Array.from({ length: 32 }, (_, i) => ({
      name: `x${i}`,
      alias: REGISTER_ALIASES[i],
      value: this._regs[i],
    }));
  }
}
