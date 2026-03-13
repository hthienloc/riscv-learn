import { useState } from 'react'
import { type Memory } from '@riscv-learn/simulator'

interface Props {
  memory: Memory
  baseAddress?: number
  rows?: number
}

export default function MemoryView({ memory, baseAddress = 0x80000, rows = 16 }: Props) {
  const [addr, setAddr] = useState(baseAddress)
  const [displayMode, setDisplayMode] = useState<'hex' | 'dec'>('hex')

  const handleAddrChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 16)
    if (!isNaN(val)) setAddr(val & ~3) // align to 4 bytes
  }

  const words: { addr: number; value: number }[] = []
  for (let i = 0; i < rows; i++) {
    const a = addr + i * 4
    try {
      words.push({ addr: a, value: memory.readWord(a) })
    } catch {
      break
    }
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
      <div className="px-4 py-2 border-b border-gray-800 flex items-center gap-3">
        <h3 className="text-sm font-semibold text-gray-300">Memory</h3>
        <input
          type="text"
          defaultValue={addr.toString(16).padStart(8, '0')}
          onBlur={handleAddrChange}
          className="bg-gray-800 border border-gray-700 rounded px-2 py-0.5 text-xs font-mono w-24 text-gray-300 focus:outline-none focus:border-blue-500"
          placeholder="address"
        />
        <div className="flex gap-1 ml-auto">
          {(['hex', 'dec'] as const).map(m => (
            <button
              key={m}
              onClick={() => setDisplayMode(m)}
              className={`px-2 py-0.5 text-xs rounded transition-colors ${
                displayMode === m
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>
      <div className="overflow-y-auto max-h-64">
        <table className="w-full text-xs font-mono">
          <thead>
            <tr className="border-b border-gray-800 text-gray-500">
              <th className="text-left px-3 py-1.5">Address</th>
              <th className="text-right px-3 py-1.5">Value</th>
            </tr>
          </thead>
          <tbody>
            {words.map(({ addr: a, value }) => (
              <tr key={a} className={`border-b border-gray-800/50 hover:bg-gray-800/50 ${
                value !== 0 ? 'text-yellow-400' : 'text-gray-600'
              }`}>
                <td className="px-3 py-1">
                  0x{a.toString(16).padStart(8, '0')}
                </td>
                <td className="px-3 py-1 text-right">
                  {displayMode === 'hex'
                    ? `0x${(value >>> 0).toString(16).padStart(8, '0')}`
                    : String(value)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
