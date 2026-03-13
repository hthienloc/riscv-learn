# RISC-V Learn

An interactive learning platform for Patterson & Hennessy,
*Computer Organization and Design: RISC-V Edition, 2nd Ed.*

## Features

- **RISC-V RV32I Simulator** — step-by-step execution with full register file and memory view
- **Chapter-aligned Tutorials** — theory with animations and runnable RISC-V code examples
- **Auto-graded Exercises** — multiple-choice, fill-in-the-blank, and coding challenges with instant feedback
- **AI-powered Hints** — configurable OpenAI/Anthropic backend for targeted guidance

## Repository Structure

```
riscv-learn/
├── packages/
│   ├── simulator/       # RISC-V RV32I engine (TypeScript, no external deps)
│   │   ├── src/
│   │   │   ├── assembler/   # tokenizer, parser, linker
│   │   │   ├── cpu/         # registers, ALU, execute, syscalls
│   │   │   ├── memory/      # byte-addressable memory model
│   │   │   └── index.ts     # public API
│   │   └── tests/           # Vitest unit tests (36 tests)
│   ├── frontend/        # React 18 + Vite + Tailwind CSS app
│   │   └── src/
│   │       ├── components/  # SimEditor, RegisterFile, MemoryView, QuizCard
│   │       ├── pages/       # Home, Chapter, Playground
│   │       ├── store/       # Zustand stores
│   │       └── content/     # Chapter exercises (JSON)
│   └── backend/         # Express + Prisma API
│       └── src/
│           ├── routes/      # progress.ts, ai-hint.ts
│           └── db/          # Prisma client
├── docs/                # CONTRIBUTING.md, CONTENT_GUIDE.md
└── .github/workflows/   # ci.yml, deploy.yml
```

## Getting Started

```bash
git clone https://github.com/hthienloc/riscv-learn
cd riscv-learn
npm install
npm run dev          # starts frontend on :5173
npm run dev:backend  # starts backend on :3001
```

## Running Tests

```bash
npm test             # runs all simulator unit tests
```

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript + Vite + Tailwind CSS + Framer Motion |
| State | Zustand |
| Code editor | Monaco Editor |
| Backend | Node.js + Express + Prisma + SQLite/Postgres |
| Simulator | Custom RISC-V RV32I engine in TypeScript |
| Deploy | Vercel (frontend) + Railway (backend) |

## Contributing

See [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md).
Content contributions: see [docs/CONTENT_GUIDE.md](docs/CONTENT_GUIDE.md).

## License

MIT