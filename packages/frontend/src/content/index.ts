export interface ChapterMeta {
  id: number;
  title: string;
  description: string;
  topics: string[];
}

export const chapters: ChapterMeta[] = [
  {
    id: 1,
    title: 'Computer Abstractions & Technology',
    description: 'Performance metrics, latency, bandwidth, and the abstraction layers of modern computers.',
    topics: ['Performance', 'Latency', 'Bandwidth', 'Abstractions'],
  },
  {
    id: 2,
    title: 'Instructions: Language of the Computer',
    description: 'RISC-V instruction set architecture, register conventions, and encoding formats.',
    topics: ['RV32I', 'Registers', 'Encoding', 'ABI'],
  },
  {
    id: 3,
    title: 'Arithmetic for Computers',
    description: 'Integer and floating-point arithmetic, overflow detection, and the ALU.',
    topics: ['ALU', 'Overflow', 'FP', 'Binary'],
  },
  {
    id: 4,
    title: 'The Processor',
    description: 'Single-cycle and pipelined datapath design with control signals.',
    topics: ['Datapath', 'Control', 'Pipeline', 'Hazards'],
  },
  {
    id: 5,
    title: 'Large and Fast: Memory Hierarchy',
    description: 'Cache design, hit/miss analysis, and virtual memory concepts.',
    topics: ['Cache', 'Hit/Miss', 'DRAM', 'Virtual Memory'],
  },
];
