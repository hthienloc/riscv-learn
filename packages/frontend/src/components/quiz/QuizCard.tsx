import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Exercise } from '../../pages/Chapter'

interface Props {
  exercise: Exercise
}

export default function QuizCard({ exercise }: Props) {
  const [answer, setAnswer] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const [hintIdx, setHintIdx] = useState(0)

  const isCorrect = answer.trim().toLowerCase() === exercise.answer.trim().toLowerCase()

  const handleSubmit = () => {
    if (answer.trim()) setSubmitted(true)
  }

  const handleReset = () => {
    setAnswer('')
    setSubmitted(false)
    setShowHint(false)
    setHintIdx(0)
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
          exercise.type === 'multiple-choice' ? 'bg-blue-900 text-blue-300' :
          exercise.type === 'fill-blank' ? 'bg-purple-900 text-purple-300' :
          'bg-orange-900 text-orange-300'
        }`}>
          {exercise.type === 'multiple-choice' ? 'Multiple Choice' :
           exercise.type === 'fill-blank' ? 'Fill in the Blank' : 'Code Challenge'}
        </span>
        <span className="text-xs text-gray-600">{exercise.chapterRef}</span>
      </div>

      {/* Prompt */}
      <p className="text-gray-200 mb-4 text-sm leading-relaxed">{exercise.prompt}</p>

      {/* Input */}
      {!submitted && (
        <>
          {exercise.type === 'multiple-choice' && exercise.options ? (
            <div className="flex flex-col gap-2 mb-4">
              {exercise.options.map(opt => (
                <label key={opt} className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="radio"
                    name={exercise.id}
                    value={opt}
                    checked={answer === opt}
                    onChange={() => setAnswer(opt)}
                    className="accent-blue-500"
                  />
                  <span className="text-sm text-gray-300 group-hover:text-white transition-colors">{opt}</span>
                </label>
              ))}
            </div>
          ) : exercise.type === 'code-challenge' ? (
            <textarea
              value={answer}
              onChange={e => setAnswer(e.target.value)}
              rows={6}
              placeholder="Write your RISC-V assembly here..."
              className="w-full bg-gray-950 border border-gray-700 rounded-lg p-3 text-sm font-mono text-gray-200 focus:outline-none focus:border-blue-500 resize-y mb-4"
            />
          ) : (
            <input
              type="text"
              value={answer}
              onChange={e => setAnswer(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              placeholder="Type your answer..."
              className="w-full bg-gray-950 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-blue-500 mb-4"
            />
          )}

          <div className="flex gap-2">
            <button
              onClick={handleSubmit}
              disabled={!answer.trim()}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-sm rounded-lg transition-colors"
            >
              Submit
            </button>
            {exercise.hints.length > 0 && (
              <button
                onClick={() => { setShowHint(true); setHintIdx(h => Math.min(h + 1, exercise.hints.length - 1)); }}
                className="px-4 py-1.5 text-sm text-gray-400 hover:text-gray-200 border border-gray-700 rounded-lg transition-colors"
              >
                💡 Hint
              </button>
            )}
          </div>
        </>
      )}

      {/* Result */}
      <AnimatePresence>
        {submitted && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`mt-3 p-3 rounded-lg border ${
              isCorrect
                ? 'bg-green-900/30 border-green-700 text-green-300'
                : 'bg-red-900/30 border-red-700 text-red-300'
            }`}
          >
            {isCorrect ? (
              <p className="text-sm font-medium">✓ Correct!</p>
            ) : (
              <div>
                <p className="text-sm font-medium">✗ Incorrect.</p>
                <p className="text-sm mt-1">Answer: <span className="font-mono">{exercise.answer}</span></p>
              </div>
            )}
            <button
              onClick={handleReset}
              className="mt-2 text-xs text-gray-400 hover:text-gray-200 underline"
            >
              Try again
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hint */}
      <AnimatePresence>
        {showHint && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 p-3 bg-yellow-900/20 border border-yellow-800 rounded-lg"
          >
            <p className="text-xs text-yellow-300">💡 {exercise.hints[hintIdx]}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
