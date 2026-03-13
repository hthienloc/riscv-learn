import { type ParsedProgram, type Instruction, type DataEntry } from './parser.js';
import { type Memory } from '../memory/memory.js';

export const TEXT_BASE = 0x00010000;
export const DATA_BASE = 0x00080000;
export const STACK_TOP = 0x001ffff0;

export interface AssembledProgram {
  /** Instruction address map: index -> address */
  instrAddrs: number[];
  /** Resolved label -> address map */
  labelAddrs: Map<string, number>;
  /** Data section: label -> address */
  dataAddrs: Map<string, number>;
}

/**
 * Lays out the parsed program in memory and resolves all labels.
 * Text section: each instruction occupies 4 bytes starting at TEXT_BASE.
 * Data section: laid out starting at DATA_BASE.
 */
export function assemble(
  program: ParsedProgram,
  memory: Memory,
): AssembledProgram {
  const instrAddrs: number[] = [];
  const labelAddrs = new Map<string, number>();
  const dataAddrs = new Map<string, number>();

  // Lay out text section
  for (let i = 0; i < program.instructions.length; i++) {
    instrAddrs.push(TEXT_BASE + i * 4);
  }

  // Resolve text labels
  for (const [label, idx] of program.labels) {
    if (!label.startsWith('__data_')) {
      const addr = TEXT_BASE + idx * 4;
      labelAddrs.set(label, addr);
    }
  }

  // Lay out data section
  let dataPtr = DATA_BASE;
  const dataIdxToLabel = new Map<number, string>();
  for (const [label, idx] of program.labels) {
    if (label.startsWith('__data_')) {
      const realLabel = label.slice('__data_'.length);
      dataIdxToLabel.set(idx, realLabel);
    }
  }

  for (let i = 0; i < program.data.length; i++) {
    const realLabel = dataIdxToLabel.get(i) ?? program.data[i].label;
    if (realLabel) {
      dataAddrs.set(realLabel, dataPtr);
      labelAddrs.set(realLabel, dataPtr);
    }
    dataPtr = writeDataEntry(program.data[i], dataPtr, memory);
  }

  return { instrAddrs, labelAddrs, dataAddrs };
}

function writeDataEntry(entry: DataEntry, addr: number, memory: Memory): number {
  const dir = entry.directive;
  switch (dir) {
    case '.byte': {
      for (const v of entry.values) {
        memory.writeByte(addr, parseNumber(v));
        addr++;
      }
      break;
    }
    case '.half': case '.short': {
      for (const v of entry.values) {
        memory.writeHalf(addr, parseNumber(v));
        addr += 2;
      }
      break;
    }
    case '.word': {
      for (const v of entry.values) {
        memory.writeWord(addr, parseNumber(v));
        addr += 4;
      }
      break;
    }
    case '.string': case '.asciz': case '.ascii': {
      for (const v of entry.values) {
        for (let i = 0; i < v.length; i++) {
          memory.writeByte(addr++, v.charCodeAt(i));
        }
        if (dir !== '.ascii') memory.writeByte(addr++, 0); // null terminator
      }
      break;
    }
    case '.space': {
      const size = entry.values.length > 0 ? parseNumber(entry.values[0]) : 0;
      addr += size; // already zeroed
      break;
    }
    case '.align': {
      const n = entry.values.length > 0 ? parseNumber(entry.values[0]) : 0;
      const alignment = 1 << n;
      addr = Math.ceil(addr / alignment) * alignment;
      break;
    }
  }
  return addr;
}

function parseNumber(s: string): number {
  if (s.startsWith('0x') || s.startsWith('0X')) return parseInt(s, 16);
  if (s.startsWith('0b') || s.startsWith('0B')) return parseInt(s.slice(2), 2);
  return parseInt(s, 10);
}
