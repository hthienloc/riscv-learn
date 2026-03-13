import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Chapter from './pages/Chapter'
import Playground from './pages/Playground'
import Navbar from './components/Navbar'

export default function App() {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/chapter/:id" element={<Chapter />} />
        <Route path="/playground" element={<Playground />} />
      </Routes>
    </div>
  )
}
