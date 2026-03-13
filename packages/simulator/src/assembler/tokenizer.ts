export type TokenKind =
  | 'LABEL'
  | 'DIRECTIVE'
  | 'IDENT'
  | 'NUMBER'
  | 'STRING'
  | 'COMMA'
  | 'LPAREN'
  | 'RPAREN'
  | 'NEWLINE'
  | 'EOF';

export interface Token {
  kind: TokenKind;
  value: string;
  line: number;
  col: number;
}

/**
 * Tokenizes a RISC-V assembly source string into a flat token list.
 */
export function tokenize(source: string): Token[] {
  const tokens: Token[] = [];
  const lines = source.split('\n');

  for (let lineNum = 0; lineNum < lines.length; lineNum++) {
    let col = 0;
    let remaining = lines[lineNum];

    // strip inline comment
    const commentIdx = remaining.indexOf('#');
    if (commentIdx !== -1) remaining = remaining.slice(0, commentIdx);

    while (col < remaining.length) {
      // skip whitespace
      if (/\s/.test(remaining[col])) {
        col++;
        continue;
      }

      // comma
      if (remaining[col] === ',') {
        tokens.push({ kind: 'COMMA', value: ',', line: lineNum + 1, col });
        col++;
        continue;
      }

      // parens
      if (remaining[col] === '(') {
        tokens.push({ kind: 'LPAREN', value: '(', line: lineNum + 1, col });
        col++;
        continue;
      }
      if (remaining[col] === ')') {
        tokens.push({ kind: 'RPAREN', value: ')', line: lineNum + 1, col });
        col++;
        continue;
      }

      // string literal
      if (remaining[col] === '"') {
        let str = '';
        col++; // skip opening quote
        while (col < remaining.length && remaining[col] !== '"') {
          if (remaining[col] === '\\' && col + 1 < remaining.length) {
            const esc = remaining[col + 1];
            switch (esc) {
              case 'n': str += '\n'; break;
              case 't': str += '\t'; break;
              case '0': str += '\0'; break;
              case '\\': str += '\\'; break;
              case '"': str += '"'; break;
              default: str += esc;
            }
            col += 2;
          } else {
            str += remaining[col];
            col++;
          }
        }
        col++; // skip closing quote
        tokens.push({ kind: 'STRING', value: str, line: lineNum + 1, col });
        continue;
      }

      // number (hex, binary, decimal, negative)
      const numMatch = remaining.slice(col).match(/^-?(?:0x[0-9a-fA-F]+|0b[01]+|\d+)/);
      if (numMatch) {
        tokens.push({ kind: 'NUMBER', value: numMatch[0], line: lineNum + 1, col });
        col += numMatch[0].length;
        continue;
      }

      // directive
      if (remaining[col] === '.') {
        const dirMatch = remaining.slice(col).match(/^\.[a-zA-Z_][a-zA-Z0-9_]*/);
        if (dirMatch) {
          tokens.push({ kind: 'DIRECTIVE', value: dirMatch[0], line: lineNum + 1, col });
          col += dirMatch[0].length;
          continue;
        }
      }

      // identifier or label
      const identMatch = remaining.slice(col).match(/^[a-zA-Z_][a-zA-Z0-9_.]*/);
      if (identMatch) {
        const word = identMatch[0];
        const after = remaining[col + word.length];
        if (after === ':') {
          tokens.push({ kind: 'LABEL', value: word, line: lineNum + 1, col });
          col += word.length + 1; // skip colon
        } else {
          tokens.push({ kind: 'IDENT', value: word, line: lineNum + 1, col });
          col += word.length;
        }
        continue;
      }

      // unexpected character — skip
      col++;
    }

    tokens.push({ kind: 'NEWLINE', value: '\n', line: lineNum + 1, col: remaining.length });
  }

  tokens.push({ kind: 'EOF', value: '', line: lines.length, col: 0 });
  return tokens;
}
