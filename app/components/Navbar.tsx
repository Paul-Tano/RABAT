"use client"
import { useState } from "react"
import Link from "next/link"
import { signOut } from "next-auth/react"
import { 
  LogIn, UserPlus,  LogOut,  LayoutDashboard,  Clapperboard,  Search,  ChevronDown,  User,  Heart 
} from "lucide-react"
import { useRouter } from "next/dist/client/components/navigation"

interface NavbarProps {
  session: {
    user: {
      username: string
      role: string
    }
  } | null
  searchQuery?: string
  onSearch?: (value: string) => void
}

export default function Navbar({ session, searchQuery, onSearch }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false)

  // Gestion bare de rechercher
  const router = useRouter()

const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
  const value = e.target.value
  onSearch?.(value)
  router.push(`/?search=${value}`)
}

  return (
    <header className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-900 px-6 py-4 flex items-center justify-between gap-4">
      
      <div className="flex items-center gap-6 shrink-0">
        <Link
          href="/"
          className="text-3xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-amber-500"
        >
          RABAT
        </Link>
      </div>
      <div className="flex-1 max-w-xl mx-4 hidden sm:block">
        <div className="relative w-full">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-zinc-500">
            <Search size={16} />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearch}
            placeholder="Rechercher un film, un réalisateur..."
            className="w-full bg-zinc-900/60 border border-zinc-800 text-zinc-100 placeholder-zinc-500 text-sm rounded-xl pl-10 pr-4 py-2 focus:outline-none focus:border-zinc-700 focus:bg-zinc-900 transition-all"
          />
        </div>
      </div>

    
      <div className="flex items-center gap-4 shrink-0 relative">
        {session ? (
          <>
            {session.user.role === "ADMIN" && (
              <Link
                href="/admin"
                className="hidden md:flex items-center gap-2 text-sm font-semibold text-amber-400 hover:text-amber-300 transition-colors"
              >
                <LayoutDashboard size={16} />
                Dashboard
              </Link>
            )}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex items-center gap-2 bg-zinc-900/50 hover:bg-zinc-900 p-1.5 pr-3 rounded-full border border-zinc-800/80 transition-all cursor-pointer select-none"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-red-600 to-amber-500 text-white font-black flex items-center justify-center uppercase text-sm shadow-md">
                {session.user.username ? session.user.username.charAt(0) : "U"}
              </div>
              <ChevronDown 
                size={14} 
                className={`text-zinc-500 transition-transform duration-200 ${isMenuOpen ? "rotate-180 text-white" : ""}`} 
              />
            </button>
            {isMenuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsMenuOpen(false)} />             
                <div className="absolute right-0 top-full mt-2 w-52 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                  <div className="px-4 py-2 border-b border-zinc-800/60 mb-1">
                    <p className="text-sm font-bold text-white truncate">{session.user.username}</p>
                    {session.user.role === "ADMIN" && (
  <Link
    href="/admin"
    onClick={() => setIsMenuOpen(false)}
    className="flex items-center gap-3 px-4 py-2.5 text-sm text-amber-400 hover:text-amber-300 hover:bg-zinc-800/50 transition-colors"
  >
    <LayoutDashboard size={16} />
    Dashboard
  </Link>
)}
                  </div>
                  <Link
                    href="/profile"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-300 hover:text-white hover:bg-zinc-800/50 transition-colors"
                  >
                    <User size={16} className="text-zinc-500" />
                    Mon profil
                  </Link>
                  <Link
                    href="/favorites"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-300 hover:text-white hover:bg-zinc-800/50 transition-colors"
                  >
                    <Heart size={16} className="text-zinc-500" />
                    Mes favoris
                  </Link>
                  <div className="border-t border-zinc-800/60 my-1" />
                  <button
                    onClick={() => {
                      setIsMenuOpen(false)
                      signOut({ callbackUrl: "/" })
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-red-400 hover:text-red-300 hover:bg-red-950/20 transition-colors cursor-pointer text-left"
                  >
                    <LogOut size={16} />
                    Déconnexion
                  </button>
                </div>
              </>
            )}
          </>
        ) : (
          <>
            <Link
              href="/auth/login"
              className="flex items-center gap-2 text-sm font-semibold text-zinc-300 hover:text-white transition-colors"
            >
              <LogIn size={16} />
              Sign In
            </Link>

            <Link
              href="/auth/register"
              className="flex items-center gap-2 text-sm font-bold bg-gradient-to-r from-red-600 to-amber-600 px-4 py-2 rounded-xl text-white hover:from-red-500 hover:to-amber-500 transition-all shadow-md shadow-red-950/30"
            >
              <UserPlus size={16} />
              Sign Up
            </Link>
          </>
        )}
      </div>
    </header>
  )
}