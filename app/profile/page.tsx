"use client"
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { User, Mail, Lock, Star, MessageSquare, Heart, Loader2, Save, Eye, EyeOff, ArrowLeft } from "lucide-react"
import Link from "next/link"

interface UserProfile {
  id: number
  username: string
  email: string
  role: string
  createdAt: string
  _count: {
    comments: number
    ratings: number
    favorites: number
  }
}

interface Comment {
  id: number
  content: string
  createdAt: string
  movie: { title: string }
  movieId: number
}

export default function ProfilePage() {
  const { data: session, update } = useSession()
  const router = useRouter()

  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"info" | "password" | "comments">("info")

  const [infoForm, setInfoForm] = useState({ username: "", email: "" })
  const [infoLoading, setInfoLoading] = useState(false)
  const [infoMessage, setInfoMessage] = useState("")

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  })
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordMessage, setPasswordMessage] = useState("")
  const [showPasswords, setShowPasswords] = useState(false)

  // Charger le profil et les commentaires
  useEffect(() => {
    if (session) {
      fetchProfile()
      fetchComments()
    }
  }, [session])

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/users/me")
      const data = await res.json()
      setProfile(data)
      setInfoForm({
        username: data.username,
        email: data.email
      })
    } catch (error) {
      console.error("Erreur lors du chargement du profil")
    } finally {
      setLoading(false)
    }
  }

  const fetchComments = async () => {
    try {
      const res = await fetch("/api/comments/user")
      const data = await res.json()
      setComments(data)
    } catch (error) {
      console.error("Erreur lors du chargement des commentaires")
    }
  }

  // Modifier les infos
  const handleInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setInfoLoading(true)
    setInfoMessage("")

    try {
      const res = await fetch("/api/users/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: infoForm.username,
          email: infoForm.email
        })
      })

      const data = await res.json()

      if (!res.ok) {
        setInfoMessage(data.error || "Erreur lors de la modification")
        return
      }
      setInfoMessage("Profil mis à jour avec succès")
      fetchProfile()
      await update({
        username: infoForm.username,
        email: infoForm.email
      })

    } catch (error) {
      setInfoMessage("Erreur serveur")
    } finally {
      setInfoLoading(false)
    }
  }

  // Modifier le mot de passe
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordLoading(true)
    setPasswordMessage("")

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMessage("Les mots de passe ne correspondent pas")
      setPasswordLoading(false)
      return
    }

    try {
      const res = await fetch("/api/users/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
      })

      const data = await res.json()

      if (!res.ok) {
        setPasswordMessage(data.error || "Erreur lors de la modification")
        return
      }

      setPasswordMessage("Mot de passe modifié avec succès")
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      })

    } catch (error) {
      setPasswordMessage("Erreur serveur")
    } finally {
      setPasswordLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans">
      <div className="max-w-4xl mx-auto px-6 py-12 space-y-8">
        <div className="space-y-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-zinc-400 transition hover:text-orange-400"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour à l'accueil
        </Link>
      </div>
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-3xl font-black text-white">
            {profile?.username?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">
              {profile?.username}
            </h1>
            <p className="text-zinc-400 text-sm">{profile?.email}</p>
            <span className={`mt-1 inline-block rounded-full px-3 py-0.5 text-xs font-semibold ${
              profile?.role === "ADMIN"
                ? "bg-orange-500/10 text-orange-400"
                : "bg-zinc-800 text-zinc-300"
            }`}>
              {profile?.role}
            </span>
          </div>
        </div>
        <div className="flex gap-2 border-b border-zinc-800">
          {[
            { id: "info", label: "Mes informations", icon: User },
            { id: "password", label: "Mot de passe", icon: Lock },
            { id: "comments", label: "Mes commentaires", icon: MessageSquare }
          ].map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition cursor-pointer ${
                  activeTab === tab.id
                    ? "border-orange-500 text-orange-400"
                    : "border-transparent text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            )
          })}
        </div>
        {activeTab === "info" && (
          <form onSubmit={handleInfoSubmit} className="space-y-5 bg-[#151518] border border-zinc-800/60 rounded-2xl p-6">

            {infoMessage && (
              <div className={`px-4 py-3 rounded-lg text-sm font-medium ${
                infoMessage.includes("succès")
                  ? "bg-green-500/10 text-green-400 border border-green-500/30"
                  : "bg-red-500/10 text-red-400 border border-red-500/30"
              }`}>
                {infoMessage}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-200 flex items-center gap-2">
                <User className="w-4 h-4" /> Username
              </label>
              <input
                type="text"
                value={infoForm.username}
                onChange={(e) => setInfoForm({ ...infoForm, username: e.target.value })}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-zinc-100 outline-none focus:border-orange-500 transition"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-200 flex items-center gap-2">
                <Mail className="w-4 h-4" /> Email
              </label>
              <input
                type="email"
                value={infoForm.email}
                onChange={(e) => setInfoForm({ ...infoForm, email: e.target.value })}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-zinc-100 outline-none focus:border-orange-500 transition"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={infoLoading}
                className="flex items-center gap-2 rounded-lg bg-[#E25814] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:opacity-50 cursor-pointer"
              >
                {infoLoading
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <Save className="w-4 h-4" />
                }
                Enregistrer
              </button>
            </div>
          </form>
        )}

        {activeTab === "password" && (
          <form onSubmit={handlePasswordSubmit} className="space-y-5 bg-[#151518] border border-zinc-800/60 rounded-2xl p-6">

            {passwordMessage && (
              <div className={`px-4 py-3 rounded-lg text-sm font-medium ${
                passwordMessage.includes("succès")
                  ? "bg-green-500/10 text-green-400 border border-green-500/30"
                  : "bg-red-500/10 text-red-400 border border-red-500/30"
              }`}>
                {passwordMessage}
              </div>
            )}

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setShowPasswords(!showPasswords)}
                className="flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-200 transition cursor-pointer"
              >
                {showPasswords ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                {showPasswords ? "Masquer" : "Afficher"} les mots de passe
              </button>
            </div>

            {[
              { label: "Mot de passe actuel", key: "currentPassword" },
              { label: "Nouveau mot de passe", key: "newPassword" },
              { label: "Confirmer le nouveau mot de passe", key: "confirmPassword" }
            ].map((field) => (
              <div key={field.key} className="space-y-2">
                <label className="text-sm font-medium text-zinc-200 flex items-center gap-2">
                  <Lock className="w-4 h-4" /> {field.label}
                </label>
                <input
                  type={showPasswords ? "text" : "password"}
                  value={passwordForm[field.key as keyof typeof passwordForm]}
                  onChange={(e) => setPasswordForm({
                    ...passwordForm,
                    [field.key]: e.target.value
                  })}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-zinc-100 outline-none focus:border-orange-500 transition"
                />
              </div>
            ))}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={passwordLoading}
                className="flex items-center gap-2 rounded-lg bg-[#E25814] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:opacity-50 cursor-pointer"
              >
                {passwordLoading
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <Save className="w-4 h-4" />
                }
                Modifier le mot de passe
              </button>
            </div>
          </form>
        )}
        {activeTab === "comments" && (
          <div className="space-y-4">
            {comments.length === 0 ? (
              <div className="text-center py-12 text-zinc-500 border border-dashed border-zinc-800 rounded-2xl">
                Vous n'avez pas encore écrit de commentaire.
              </div>
            ) : (
              comments.map((comment) => (
                <div
                  key={comment.id}
                  className="bg-[#151518] border border-zinc-800/60 rounded-2xl p-5 space-y-2"
                >
                  <Link href={`/movies/${comment.movieId}`} className="text-sm text-orange-400 hover:underline">
                    <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-orange-400">
                      {comment.movie?.title}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {new Date(comment.createdAt).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                  <p className="text-sm text-zinc-300">{comment.content}</p>
                  </Link>
                  
                </div>
              ))
            )}
          </div>
        )}

      </div>
    </div>
  )
}