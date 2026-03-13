# Content Contribution Guide

This guide explains how to add or edit chapter content.

## Chapter Structure

Each chapter lives in `packages/frontend/src/content/ch{XX}/`:

```
ch01/
├── exercises.json     # Quiz questions and coding challenges
└── code-examples/     # RISC-V assembly snippets (optional)
```

## exercises.json Schema

```json
{
  "chapterId": 1,
  "exercises": [
    {
      "id": "ch01-ex01",
      "type": "multiple-choice",
      "prompt": "Question text here",
      "options": ["A", "B", "C", "D"],
      "answer": "A",
      "hints": ["Hint 1", "Hint 2"],
      "chapterRef": "Section 1.2"
    },
    {
      "id": "ch01-ex02",
      "type": "fill-blank",
      "prompt": "Performance = 1 / ___",
      "answer": "Execution Time",
      "hints": ["Think about the relationship between speed and time."],
      "chapterRef": "Section 1.6"
    },
    {
      "id": "ch01-ex03",
      "type": "code-challenge",
      "prompt": "Write RISC-V assembly to add two numbers.",
      "answer": "addi t0, zero, 5\naddi t1, zero, 3\nadd a0, t0, t1",
      "hints": ["Use addi to load immediates into registers."],
      "chapterRef": "Section 2.4"
    }
  ]
}
```

## Exercise Types

| Type | Description |
|------|-------------|
| `multiple-choice` | Select one correct answer from options |
| `fill-blank` | Type a short answer (case-insensitive match) |
| `code-challenge` | Write RISC-V assembly (exact string match) |

## Adding a New Chapter

1. Create `packages/frontend/src/content/ch{XX}/exercises.json`
2. Register the chapter in `packages/frontend/src/content/index.ts`
3. Import and add to the `exerciseMap` in `packages/frontend/src/pages/Chapter.tsx`
