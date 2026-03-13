import { type Token, tokenize } from './tokenizer.js';

export interface Instruction {
  op: string;
  operands: string[];
  line: number;
  label?: string;
}

export interface DataEntry {
  label: string;
  directive: string;
  values: string[];
}

export interface ParsedProgram {
  instructions: Instruction[];
  data: DataEntry[];
  labels: Map<string, number>; // label -> instruction index or byte offset
}

/**
 * Parses a RISC-V assembly source string into a structured AST.
 */
export function parse(source: string): ParsedProgram {
  const tokens = tokenize(source);
  let pos = 0;

  const instructions: Instruction[] = [];
  const data: DataEntry[] = [];
  const textLabels = new Map<string, number>(); // label -> instruction index
  const dataLabels = new Map<string, number>(); // label -> data index
  const labels = new Map<string, number>();

  let inText = true;
  let pendingLabel: string | undefined;

  function peek(): Token { return tokens[pos]; }
  function consume(): Token { return tokens[pos++]; }

  function skipNewlines(): void {
    while (peek().kind === 'NEWLINE') consume();
  }

  function parseOperands(): string[] {
    const operands: string[] = [];
    while (peek().kind !== 'NEWLINE' && peek().kind !== 'EOF') {
      const t = peek();
      if (t.kind === 'COMMA') { consume(); continue; }
      if (t.kind === 'NUMBER' || t.kind === 'IDENT') {
        const val = consume().value;
        // check for (reg) offset form
        if (peek().kind === 'LPAREN') {
          consume(); // (
          const reg = consume().value;
          consume(); // )
          operands.push(`${val}(${reg})`);
        } else {
          operands.push(val);
        }
      } else if (t.kind === 'STRING') {
        operands.push(consume().value);
      } else {
        consume(); // skip unexpected
      }
    }
    return operands;
  }

  while (peek().kind !== 'EOF') {
    skipNewlines();
    if (peek().kind === 'EOF') break;

    const t = peek();

    if (t.kind === 'DIRECTIVE') {
      consume();
      const dir = t.value.toLowerCase();
      if (dir === '.text') {
        inText = true;
        skipNewlines();
        continue;
      }
      if (dir === '.data' || dir === '.rodata') {
        inText = false;
        skipNewlines();
        continue;
      }
      if (dir === '.globl' || dir === '.global') {
        // skip global directive
        while (peek().kind !== 'NEWLINE' && peek().kind !== 'EOF') consume();
        continue;
      }
      // data directive: .word, .half, .byte, .string, .asciz, .ascii, .space, .align
      if (!inText) {
        const values: string[] = [];
        while (peek().kind !== 'NEWLINE' && peek().kind !== 'EOF') {
          if (peek().kind === 'COMMA') { consume(); continue; }
          values.push(consume().value);
        }
        const entry: DataEntry = { label: pendingLabel ?? '', directive: dir, values };
        if (pendingLabel) {
          dataLabels.set(pendingLabel, data.length);
          pendingLabel = undefined;
        }
        data.push(entry);
      } else {
        // in text section, skip unknown directives
        while (peek().kind !== 'NEWLINE' && peek().kind !== 'EOF') consume();
      }
      continue;
    }

    if (t.kind === 'LABEL') {
      consume();
      pendingLabel = t.value;
      if (inText) {
        textLabels.set(t.value, instructions.length);
      }
      continue;
    }

    if (t.kind === 'IDENT' && inText) {
      consume();
      const operands = parseOperands();
      const instr: Instruction = { op: t.value.toLowerCase(), operands, line: t.line };
      if (pendingLabel) {
        instr.label = pendingLabel;
        pendingLabel = undefined;
      }
      instructions.push(instr);
      continue;
    }

    // skip anything else
    consume();
  }

  // merge labels
  for (const [k, v] of textLabels) labels.set(k, v);
  // data labels store index + offset into data section
  for (const [k, v] of dataLabels) labels.set(`__data_${k}`, v);

  return { instructions, data, labels };
}
