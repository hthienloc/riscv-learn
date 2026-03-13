import { type RegisterEntry } from '@riscv-learn/simulator'

interface Props {
  registers: RegisterEntry[]
  highlightChanged?: boolean
}

export default function RegisterFile({ registers }: Props) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
      <div className="px-4 py-2 border-b border-gray-800 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-300">Register File</h3>
        <span className="text-xs text-gray-500">x0–x31</span>
      </div>
      <div className="overflow-y-auto max-h-96">
        <table className="w-full text-xs font-mono">
          <thead>
            <tr className="border-b border-gray-800 text-gray-500">
              <th className="text-left px-3 py-1.5">Reg</th>
              <th className="text-left px-3 py-1.5">Alias</th>
              <th className="text-right px-3 py-1.5">Hex</th>
              <th className="text-right px-3 py-1.5">Dec</th>
            </tr>
          </thead>
          <tbody>
            {registers.map((reg) => (
              <tr
                key={reg.name}
                className={`border-b border-gray-800/50 hover:bg-gray-800/50 transition-colors ${
                  reg.value !== 0 ? 'text-green-400' : 'text-gray-500'
                }`}
              >
                <td className="px-3 py-1">{reg.name}</td>
                <td className="px-3 py-1 text-blue-400">{reg.alias}</td>
                <td className="px-3 py-1 text-right">
                  0x{(reg.value >>> 0).toString(16).padStart(8, '0')}
                </td>
                <td className="px-3 py-1 text-right">{reg.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
