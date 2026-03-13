import { Link, useLocation } from 'react-router-dom'

export default function Navbar() {
  const { pathname } = useLocation()

  const navItems = [
    { to: '/', label: 'Home' },
    { to: '/playground', label: 'Playground' },
    { to: '/chapter/1', label: 'Chapters' },
  ]

  return (
    <nav className="border-b border-gray-800 bg-gray-900/80 backdrop-blur sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold text-xl">
          <span className="text-blue-400">RISC-V</span>
          <span className="text-gray-100">Learn</span>
        </Link>
        <div className="flex items-center gap-1">
          {navItems.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                pathname === to
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-gray-100 hover:bg-gray-800'
              }`}
            >
              {label}
            </Link>
          ))}
          <a
            href="https://github.com/hthienloc/riscv-learn"
            target="_blank"
            rel="noopener noreferrer"
            className="ml-2 px-3 py-1.5 rounded-md text-sm font-medium text-gray-400 hover:text-gray-100 hover:bg-gray-800 transition-colors"
          >
            GitHub
          </a>
        </div>
      </div>
    </nav>
  )
}
