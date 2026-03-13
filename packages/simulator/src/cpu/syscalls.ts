import { type RegisterFile } from './registers.js';
import { type Memory } from '../memory/memory.js';
import { type SyscallResult } from './execute.js';

/**
 * Default RISC-V syscall handler (Venus-compatible).
 * a7 (x17) holds the syscall number.
 * a0 (x10) is the first argument / return value.
 * a1 (x11) is the second argument.
 */
export function handleSyscall(regs: RegisterFile, mem: Memory): SyscallResult {
  const a7 = regs.read(17); // syscall number
  const a0 = regs.read(10);

  switch (a7) {
    case 1: // print_int
      return { output: String(a0 | 0) };

    case 2: // print_float (stub — floating-point not yet implemented)
      return { output: '0.0' };

    case 4: // print_string
      try {
        const str = mem.readString(a0 >>> 0);
        return { output: str };
      } catch {
        return { output: '' };
      }

    case 5: // read_int
      return {
        waitForInput: true,
        inputCallback: (value: number) => {
          regs.write(10, value | 0);
        },
      };

    case 10: // exit
      return { exit: true, exitCode: 0 };

    case 11: // print_char
      return { output: String.fromCharCode(a0 & 0xff) };

    case 17: // exit2 (with code)
      return { exit: true, exitCode: a0 };

    case 34: // print_hex
      return { output: '0x' + (a0 >>> 0).toString(16) };

    case 35: // print_bin
      return { output: '0b' + (a0 >>> 0).toString(2) };

    case 36: // print_uint
      return { output: String(a0 >>> 0) };

    case 93: // Linux exit
      return { exit: true, exitCode: a0 };

    default:
      return {};
  }
}
