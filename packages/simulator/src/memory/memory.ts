/** Default memory size: 4 MiB */
const DEFAULT_SIZE = 4 * 1024 * 1024;

/**
 * Byte-addressable memory model for the RISC-V simulator.
 * Stores data in a Uint8Array and supports byte/half-word/word accesses.
 */
export class Memory {
  private readonly _data: Uint8Array;
  readonly size: number;

  constructor(sizeBytes: number = DEFAULT_SIZE) {
    this.size = sizeBytes;
    this._data = new Uint8Array(sizeBytes);
  }

  private checkAddr(addr: number, bytes: number): void {
    if (addr < 0 || addr + bytes > this.size) {
      throw new RangeError(`Memory access out of bounds: 0x${addr.toString(16)}`);
    }
  }

  /** Read an unsigned byte at address. */
  readByte(addr: number): number {
    this.checkAddr(addr, 1);
    return this._data[addr];
  }

  /** Read a signed byte at address. */
  readByteS(addr: number): number {
    const v = this.readByte(addr);
    return v >= 0x80 ? v - 0x100 : v;
  }

  /** Read an unsigned 16-bit half-word (little-endian). */
  readHalf(addr: number): number {
    this.checkAddr(addr, 2);
    return this._data[addr] | (this._data[addr + 1] << 8);
  }

  /** Read a signed 16-bit half-word (little-endian). */
  readHalfS(addr: number): number {
    const v = this.readHalf(addr);
    return v >= 0x8000 ? v - 0x10000 : v;
  }

  /** Read a 32-bit word (little-endian). */
  readWord(addr: number): number {
    this.checkAddr(addr, 4);
    return (
      this._data[addr] |
      (this._data[addr + 1] << 8) |
      (this._data[addr + 2] << 16) |
      (this._data[addr + 3] << 24)
    );
  }

  /** Write a byte at address. */
  writeByte(addr: number, value: number): void {
    this.checkAddr(addr, 1);
    this._data[addr] = value & 0xff;
  }

  /** Write a 16-bit half-word (little-endian). */
  writeHalf(addr: number, value: number): void {
    this.checkAddr(addr, 2);
    this._data[addr] = value & 0xff;
    this._data[addr + 1] = (value >> 8) & 0xff;
  }

  /** Write a 32-bit word (little-endian). */
  writeWord(addr: number, value: number): void {
    this.checkAddr(addr, 4);
    this._data[addr] = value & 0xff;
    this._data[addr + 1] = (value >> 8) & 0xff;
    this._data[addr + 2] = (value >> 16) & 0xff;
    this._data[addr + 3] = (value >> 24) & 0xff;
  }

  /**
   * Write a null-terminated ASCII string into memory.
   * @returns The address just past the null terminator.
   */
  writeString(addr: number, str: string): number {
    for (let i = 0; i < str.length; i++) {
      this.writeByte(addr + i, str.charCodeAt(i));
    }
    this.writeByte(addr + str.length, 0);
    return addr + str.length + 1;
  }

  /** Read a null-terminated ASCII string from memory. */
  readString(addr: number): string {
    const chars: number[] = [];
    let i = 0;
    while (true) {
      const b = this.readByte(addr + i);
      if (b === 0) break;
      chars.push(b);
      i++;
      if (i > 65536) throw new Error('String too long or missing null terminator');
    }
    return String.fromCharCode(...chars);
  }

  /** Reset all memory to zero. */
  reset(): void {
    this._data.fill(0);
  }

  /** Get a view of the underlying data (read-only). */
  get raw(): Uint8Array {
    return this._data;
  }

  /** Return hex dump of a region (for debugging/display). */
  hexDump(startAddr: number, length: number): string {
    const lines: string[] = [];
    for (let offset = 0; offset < length; offset += 16) {
      const addr = startAddr + offset;
      const bytes: string[] = [];
      for (let b = 0; b < 16 && offset + b < length; b++) {
        bytes.push(this.readByte(addr + b).toString(16).padStart(2, '0'));
      }
      lines.push(`0x${addr.toString(16).padStart(8, '0')}: ${bytes.join(' ')}`);
    }
    return lines.join('\n');
  }
}
