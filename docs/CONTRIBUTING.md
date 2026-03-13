# Contributing to RISC-V Learn

Thank you for your interest in contributing!

## Development Setup

1. Clone the repo: `git clone https://github.com/hthienloc/riscv-learn`
2. Install dependencies: `npm install`
3. Run tests: `npm test`
4. Start the frontend: `npm run dev`
5. Start the backend: `npm run dev:backend`

## Repository Structure

```
riscv-learn/
├── packages/
│   ├── simulator/   # RISC-V RV32I engine (TypeScript, no deps)
│   ├── frontend/    # React 18 + Vite app
│   └── backend/     # Express + Prisma API
└── docs/            # Documentation
```

## Pull Request Guidelines

- One PR per feature or fix
- Include tests for new simulator logic
- Follow the TypeScript strict mode conventions
- Use named exports only (no default exports except React components)
- All async functions must use async/await

## Adding a New Instruction

1. Add execution logic in `packages/simulator/src/cpu/execute.ts`
2. Add a Vitest test in `packages/simulator/tests/simulator.test.ts`
3. Ensure `npm test` passes

## Adding Chapter Content

See [CONTENT_GUIDE.md](./CONTENT_GUIDE.md).
