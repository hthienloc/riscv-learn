import { useEffect, useRef } from 'react'
import Editor, { type Monaco } from '@monaco-editor/react'
import type { editor } from 'monaco-editor'

interface Props {
  value: string
  onChange: (value: string) => void
  currentLine?: number
}

export default function SimEditor({ value, onChange, currentLine }: Props) {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null)
  const monacoRef = useRef<Monaco | null>(null)
  const decorationsRef = useRef<string[]>([])

  // Update line highlight whenever currentLine changes
  useEffect(() => {
    const editor = editorRef.current
    const monaco = monacoRef.current
    if (!editor || !monaco) return

    if (currentLine && currentLine > 0) {
      editor.revealLineInCenter(currentLine)
      decorationsRef.current = editor.deltaDecorations(decorationsRef.current, [
        {
          range: new monaco.Range(currentLine, 1, currentLine, 1),
          options: {
            isWholeLine: true,
            className: 'bg-blue-900/40',
            glyphMarginClassName: 'text-blue-400',
          },
        },
      ])
    } else {
      decorationsRef.current = editor.deltaDecorations(decorationsRef.current, [])
    }
  }, [currentLine])

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
          editorRef.current = editor
          monacoRef.current = monaco
        }}
      />
    </div>
  )
}
