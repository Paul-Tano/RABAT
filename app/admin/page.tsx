"use client"
import { useState, useEffect } from "react"
import { Film, Users, Star, ShieldCheck, MessageSquare, Loader2 } from "lucide-react"
import { Stats } from "../../types"
import Link from "next/link"

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/stats")
        const data = await res.json()
        setStats(data)
      } catch (error) {
        console.error("Erreur lors du chargement des stats")
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    )
  }

  const statCards = [
    {
      name: "Utilisateurs Totaux",
      value: stats?.totalUsers ?? 0,
      icon: Users,
      color: "text-blue-500"
    },
    {
      name: "Films ajoutés",
      value: stats?.totalMovies ?? 0,
      icon: Film,
      color: "text-orange-500",
      path: "/admin/films"
    },
    {
      name: "Notes",
      value: stats?.totalRatings ?? 0,
      icon: Star,
      color: "text-yellow-500"
    },
    {
      name: "Commentaires",
      value: stats?.totalComments ?? 0,
      icon: MessageSquare,
      color: "text-purple-500"
    },
    {
      name: "Administrateurs",
      value: stats?.totalAdmins ?? 0,
      icon: ShieldCheck,
      color: "text-emerald-500",
      path: "/admin/accounts"
    }
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Dashboard</h1>
        <p className="text-sm text-zinc-400 mt-1">
          Bienvenue sur le panneau de contrôle de RABAT. Voici un aperçu global de l'activité.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, idx) => {
          const Icon = stat.icon
          return (
            <Link href={stat.path || "#"} key={idx} className="block">
              <div
              key={idx}
              className="bg-[#151518] border border-zinc-800/60 rounded-2xl p-6 flex items-center justify-between shadow-lg"
            >
              <div className="space-y-1">
                <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  {stat.name}
                </p>
                <p className="text-3xl font-bold tracking-tight text-zinc-100">
                  {stat.value.toLocaleString()}
                </p>
              </div>
              <div className={`p-3 bg-zinc-800/40 border border-zinc-700/30 rounded-xl ${stat.color}`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
            </Link>
          )
        })}
      </div>

      <div className="bg-[#151518] border border-zinc-800/60 rounded-2xl p-6">
        <h3 className="text-lg font-bold mb-4">Dernières notes ajoutées</h3>

        {stats?.recentRatings && stats.recentRatings.length > 0 ? (
          <div className="space-y-3">
            {stats.recentRatings.map((rating) => (
              <div
                key={rating.id}
                className="flex items-center justify-between py-2 border-b border-zinc-800/60 last:border-0"
              >
                <div>
                  <p className="text-sm font-medium text-zinc-200">
                    {rating.movie.title}
                  </p>
                  <p className="text-xs text-zinc-500">
                    par {rating.user.username}
                  </p>
                </div>
                <span className="bg-orange-500/10 text-orange-400 border border-orange-500/30 px-3 py-1 rounded-full text-xs font-bold">
                  {rating.score}/5
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-zinc-500">
            Aucune note pour le moment.
          </p>
        )}
      </div>
    </div>
  )
}