import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { chapters } from '../content/index'
import QuizCard from '../components/quiz/QuizCard'

// Import exercises dynamically based on chapter
import ch01Exercises from '../content/ch01/exercises.json'
import ch02Exercises from '../content/ch02/exercises.json'

const exerciseMap: Record<number, { exercises: Exercise[] }> = {
  1: ch01Exercises as { exercises: Exercise[] },
  2: ch02Exercises as { exercises: Exercise[] },
}

export interface Exercise {
  id: string
  type: 'fill-blank' | 'multiple-choice' | 'code-challenge'
  prompt: string
  answer: string
  options?: string[]
  hints: string[]
  chapterRef: string
}

export default function Chapter() {
  const { id } = useParams<{ id: string }>()
  const chapterId = parseInt(id ?? '1', 10)
  const chapter = chapters.find(c => c.id === chapterId)
  const exerciseData = exerciseMap[chapterId]

  if (!chapter) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Chapter not found</h1>
        <Link to="/" className="text-blue-400 hover:underline">← Back to Home</Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      {/* Chapter header */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <span className="text-xs text-blue-400 font-mono">Chapter {chapter.id}</span>
          <span className="text-xs text-gray-600">/</span>
          <Link to="/" className="text-xs text-gray-500 hover:text-gray-300">Home</Link>
        </div>
        <h1 className="text-3xl font-bold mb-3">{chapter.title}</h1>
        <p className="text-gray-400 mb-6">{chapter.description}</p>
        <div className="flex gap-2 mb-8">
          {chapter.topics.map(t => (
            <span key={t} className="px-2 py-0.5 text-xs bg-gray-800 text-gray-400 rounded-full">{t}</span>
          ))}
        </div>
      </motion.div>

      {/* Navigate between chapters */}
      <div className="flex gap-3 mb-8">
        {chapterId > 1 && (
          <Link
            to={`/chapter/${chapterId - 1}`}
            className="px-4 py-2 text-sm text-gray-400 hover:text-white border border-gray-700 rounded-lg hover:border-gray-500 transition-colors"
          >
            ← Chapter {chapterId - 1}
          </Link>
        )}
        <Link
          to="/playground"
          className="px-4 py-2 text-sm bg-blue-700 hover:bg-blue-600 text-white rounded-lg transition-colors"
        >
          Open Simulator
        </Link>
        {chapterId < 5 && (
          <Link
            to={`/chapter/${chapterId + 1}`}
            className="px-4 py-2 text-sm text-gray-400 hover:text-white border border-gray-700 rounded-lg hover:border-gray-500 transition-colors"
          >
            Chapter {chapterId + 1} →
          </Link>
        )}
      </div>

      {/* Exercises */}
      {exerciseData && (
        <section>
          <h2 className="text-xl font-bold mb-4">Exercises</h2>
          <div className="flex flex-col gap-4">
            {exerciseData.exercises.map((ex, i) => (
              <motion.div
                key={ex.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                <QuizCard exercise={ex} />
              </motion.div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
