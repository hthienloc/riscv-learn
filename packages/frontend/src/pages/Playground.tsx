import { useSimStore } from '../store/simStore'
import SimEditor from '../components/simulator/SimEditor'
import RegisterFile from '../components/simulator/RegisterFile'
import MemoryView from '../components/simulator/MemoryView'
import OutputConsole from '../components/simulator/OutputConsole'

export default function Playground() {
  const {
    source, setSource,
    registers, output, halted, currentLine, error,
    simulator,
    loadAndRun, loadAndStep, stepOnce, resetSim,
  } = useSimStore()

  return (
    <div className="h-[calc(100vh-3.5rem)] flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-800 bg-gray-900">
        <button
          onClick={loadAndRun}
          className="px-4 py-1.5 bg-green-700 hover:bg-green-600 text-white text-sm font-medium rounded transition-colors"
        >
          ▶ Run
        </button>
        <button
          onClick={loadAndStep}
          className="px-4 py-1.5 bg-blue-700 hover:bg-blue-600 text-white text-sm font-medium rounded transition-colors"
        >
          ⏮ Load
        </button>
        <button
          onClick={stepOnce}
          disabled={halted}
          className="px-4 py-1.5 bg-gray-700 hover:bg-gray-600 disabled:opacity-40 text-white text-sm font-medium rounded transition-colors"
        >
          ⏭ Step
        </button>
        <button
          onClick={resetSim}
          className="px-4 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium rounded transition-colors"
        >
          ↺ Reset
        </button>
        <div className="ml-auto flex items-center gap-2">
          {halted && (
            <span className="text-xs text-yellow-400">● Halted</span>
          )}
          <span className="text-xs text-gray-500">Line: {currentLine}</span>
        </div>
      </div>

      {/* Main layout */}
      <div className="flex-1 grid grid-cols-[1fr_280px_240px] gap-0 overflow-hidden">
        {/* Editor */}
        <div className="flex flex-col border-r border-gray-800">
          <div className="flex-1 min-h-0">
            <SimEditor
              value={source}
              onChange={setSource}
              currentLine={currentLine}
            />
          </div>
          <div className="border-t border-gray-800">
            <OutputConsole output={output} error={error} />
          </div>
        </div>

        {/* Register file */}
        <div className="border-r border-gray-800 overflow-y-auto p-3">
          <RegisterFile registers={registers} />
        </div>

        {/* Memory view */}
        <div className="overflow-y-auto p-3">
          <MemoryView memory={simulator.memory} />
        </div>
      </div>
    </div>
  )
}
