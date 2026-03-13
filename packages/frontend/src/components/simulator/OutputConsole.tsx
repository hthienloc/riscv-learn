interface Props {
  output: string
  error: string | null
}

export default function OutputConsole({ output, error }: Props) {
  return (
    <div className="bg-gray-950 border border-gray-800 rounded-lg overflow-hidden">
      <div className="px-4 py-2 border-b border-gray-800">
        <h3 className="text-sm font-semibold text-gray-300">Console Output</h3>
      </div>
      <div className="p-3 font-mono text-sm min-h-16 max-h-32 overflow-y-auto">
        {error ? (
          <span className="text-red-400">{error}</span>
        ) : output ? (
          <span className="text-green-400 whitespace-pre-wrap">{output}</span>
        ) : (
          <span className="text-gray-600">// output will appear here...</span>
        )}
      </div>
    </div>
  )
}
