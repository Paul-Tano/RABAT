import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import Navbar from "./components/Navbar"
import MovieGrid from "./components/MovieGrid"
import { Play, Info } from "lucide-react"
import Link from "next/link"

interface HomeProps {
  searchParams: Promise<{ search?: string }>
}

export default async function HomePage({ searchParams }: HomeProps) {
  const session = await getServerSession(authOptions)
  const { search } = await searchParams

  const [movies, total] = await Promise.all([
    prisma.movie.findMany({
      orderBy: { createdAt: "desc" },
      take: 16,
      include: { ratings: true }
    }),
    prisma.movie.count()
  ])

  const totalPages = Math.ceil(total / 16)

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans pb-12">
      <Navbar session={session} />
      <section className="relative w-full h-[65vh] flex items-end overflow-hidden border-b border-zinc-900">
        <div className="absolute inset-0 z-0">
          <div className="w-full h-full overflow-hidden">
            <img
              src={movies[0]?.poster || "/placeholder.jpg"}
              alt="Hero Background"
              className="w-full h-full object-cover brightness-[0.70]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/20 to-transparent"></div>
          </div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto w-full px-6 pb-12 space-y-4">
          <h1 className="text-4xl md:text-6xl font-black tracking-tight max-w-2xl bg-clip-text text-transparent bg-gradient-to-b from-white to-zinc-300">
            {movies[0]?.title || "Découvrez nos films"}
          </h1>
          <p className="text-zinc-400 text-sm md:text-base max-w-xl line-clamp-3">
            {movies[0]?.description || "Découvrez les meilleurs films sur RABAT."}
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            {movies[0]?.trailer && (
              <a href={movies[0].trailer} target="_blank" rel="noopener noreferrer">
                <button className="flex items-center gap-2 px-6 py-3 bg-white hover:bg-zinc-200 text-zinc-950 font-bold rounded-xl text-sm transition-all cursor-pointer shadow-lg">
                  <Play size={16} fill="currentColor" />
                  Visionner la bande-annonce
                </button>
              </a>
            )}
            <Link href={`/movies/${movies[0]?.id}`}>
              <button className="flex items-center gap-2 px-5 py-3 bg-zinc-800/80 hover:bg-zinc-700/80 border border-zinc-700 text-zinc-200 font-bold rounded-xl text-sm transition-all cursor-pointer">
                <Info size={16} />
                Plus d'infos
              </button>
            </Link>
          </div>
        </div>
      </section>
      <MovieGrid movies={movies} totalPages={totalPages} searchQuery={search || ""} />
    </div>
  )
}