import Editor from '@monaco-editor/react'

interface Props {
  value: string
  onChange: (value: string) => void
  currentLine?: number
}

export default function SimEditor({ value, onChange, currentLine }: Props) {
  return (
    <div className="border border-gray-800 rounded-lg overflow-hidden h-full">
      <Editor
        height="100%"
        defaultLanguage="plaintext"
        theme="vs-dark"
        value={value}
        onChange={(v) => onChange(v ?? '')}
        options={{
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          fontSize: 13,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          wordWrap: 'on',
          lineNumbers: 'on',
          glyphMargin: true,
        }}
        onMount={(editor, monaco) => {
          // highlight current line
          if (currentLine && currentLine > 0) {
            editor.revealLineInCenter(currentLine)
            editor.deltaDecorations([], [
              {
                range: new monaco.Range(currentLine, 1, currentLine, 1),
                options: {
                  isWholeLine: true,
                  className: 'bg-blue-900/40',
                  glyphMarginClassName: 'text-blue-400',
                },
              },
            ])
          }
        }}
      />
    </div>
  )
}
