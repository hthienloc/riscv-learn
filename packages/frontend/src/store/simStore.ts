import { create } from 'zustand'
import { Simulator, type RegisterEntry } from '@riscv-learn/simulator'

export interface SimStore {
  simulator: Simulator
  registers: RegisterEntry[]
  output: string
  halted: boolean
  currentLine: number
  error: string | null
  source: string
  setSource: (source: string) => void
  loadAndRun: () => void
  loadAndStep: () => void
  stepOnce: () => void
  resetSim: () => void
}

const DEFAULT_SOURCE = `# RISC-V Assembly Example
# Computes 1 + 2 + 3 + 4 + 5 = 15
.text
  addi t0, zero, 0   # sum = 0
  addi t1, zero, 1   # i = 1
  addi t2, zero, 5   # limit = 5

loop:
  add  t0, t0, t1    # sum += i
  addi t1, t1, 1     # i++
  bge  t2, t1, loop  # if limit >= i (i <= limit), loop

  addi a0, t0, 0     # a0 = sum
  addi a7, zero, 1   # syscall: print_int
  ecall              # print sum

  addi a7, zero, 10  # syscall: exit
  ecall
`

export const useSimStore = create<SimStore>((set, get) => {
  const simulator = new Simulator()

  const syncState = () => {
    set({
      registers: simulator.registers,
      output: simulator.output,
      halted: simulator.state.halted,
      currentLine: simulator.state.currentLine,
    })
  }

  return {
    simulator,
    registers: simulator.registers,
    output: '',
    halted: false,
    currentLine: 0,
    error: null,
    source: DEFAULT_SOURCE,

    setSource: (source) => set({ source }),

    loadAndRun: () => {
      const { source } = get()
      set({ error: null, output: '' })
      simulator.load(source)
      const result = simulator.run()
      if (result.error) set({ error: result.error })
      syncState()
    },

    loadAndStep: () => {
      const { source } = get()
      set({ error: null, output: '' })
      simulator.load(source)
      syncState()
    },

    stepOnce: () => {
      const result = simulator.step()
      if (result.error) set({ error: result.error })
      syncState()
    },

    resetSim: () => {
      simulator.reset()
      syncState()
      set({ error: null, output: '' })
    },
  }
})
