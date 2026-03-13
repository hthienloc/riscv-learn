import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

const chapters = [
  { id: 1, title: 'Computer Abstractions & Technology', topics: ['Performance', 'Latency', 'Bandwidth'] },
  { id: 2, title: 'Instructions: Language of the Computer', topics: ['RV32I', 'Registers', 'Encoding'] },
  { id: 3, title: 'Arithmetic for Computers', topics: ['ALU', 'Overflow', 'FP'] },
  { id: 4, title: 'The Processor', topics: ['Datapath', 'Control', 'Pipeline'] },
  { id: 5, title: 'Memory Hierarchy', topics: ['Cache', 'Hit/Miss', 'DRAM'] },
]

export default function Home() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-16"
      >
        <h1 className="text-5xl font-bold mb-4">
          Learn <span className="text-blue-400">RISC-V</span> Interactively
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
          An interactive platform for Patterson &amp; Hennessy,{' '}
          <em>Computer Organization and Design: RISC-V Edition</em>.
          Run real RISC-V assembly in your browser.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            to="/playground"
            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold transition-colors"
          >
            Open Playground →
          </Link>
          <Link
            to="/chapter/1"
            className="px-6 py-3 border border-gray-700 hover:border-gray-500 text-gray-300 hover:text-white rounded-lg font-semibold transition-colors"
          >
            Start Chapter 1
          </Link>
        </div>
      </motion.div>

      {/* Feature cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        {[
          { icon: '⚙️', title: 'RV32I Simulator', desc: 'Step-by-step execution with full register file and memory view' },
          { icon: '📖', title: 'Chapter Tutorials', desc: 'Theory with animations and runnable RISC-V code examples' },
          { icon: '🧠', title: 'Auto-graded Quizzes', desc: 'Fill-in-the-blank and multiple-choice with AI-powered hints' },
        ].map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * i + 0.2 }}
            className="bg-gray-900 border border-gray-800 rounded-xl p-6"
          >
            <div className="text-3xl mb-3">{f.icon}</div>
            <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
            <p className="text-gray-400 text-sm">{f.desc}</p>
          </motion.div>
        ))}
      </div>

      {/* Chapter list */}
      <h2 className="text-2xl font-bold mb-6">Chapters</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {chapters.map((ch, i) => (
          <motion.div
            key={ch.id}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 + 0.3 }}
          >
            <Link
              to={`/chapter/${ch.id}`}
              className="flex items-start gap-4 p-5 bg-gray-900 hover:bg-gray-800 border border-gray-800 rounded-xl transition-colors group"
            >
              <span className="text-2xl font-bold text-blue-500 mt-0.5 w-8">{ch.id}</span>
              <div>
                <h3 className="font-semibold group-hover:text-blue-300 transition-colors">{ch.title}</h3>
                <div className="flex gap-2 mt-1">
                  {ch.topics.map(t => (
                    <span key={t} className="text-xs px-2 py-0.5 bg-gray-800 text-gray-400 rounded-full">{t}</span>
                  ))}
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
