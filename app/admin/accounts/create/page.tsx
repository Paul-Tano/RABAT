"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Loader2 } from "lucide-react"

export default function CreateAccountPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: "USER"
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const registerRes = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password
        })
      })

      const registerData = await registerRes.json()

      if (!registerRes.ok) {
        setError(registerData.error || "Erreur lors de la création")
        return
      }
      if (formData.role === "ADMIN") {
        await fetch(`/api/users/${registerData.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role: "ADMIN" })
        })
      }
      router.push("/admin/accounts")
    } catch (error) {
      setError("Erreur serveur")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="space-y-3">
        <Link
          href="/admin/accounts"
          className="inline-flex items-center gap-2 text-sm font-medium text-zinc-400 transition hover:text-orange-400"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour aux comptes
        </Link>

        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Ajouter un compte
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            Formulaire de création d'un utilisateur.
          </p>
        </div>
      </div>

      {error && (
        <div className="px-4 py-3 rounded-lg text-sm font-medium bg-red-500/10 text-red-400 border border-red-500/30">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-2xl border border-zinc-800/60 bg-[#151518] p-6"
      >
        <div className="space-y-2">
          <label htmlFor="username" className="text-sm font-medium text-zinc-200">
            Username
          </label>
          <input
            id="username"
            name="username"
            type="text"
            value={formData.username}
            onChange={handleChange}
            placeholder="Ex: aminata_kouame"
            required
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-orange-500"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium text-zinc-200">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Ex: user@example.com"
            required
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-orange-500"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium text-zinc-200">
            Mot de passe
          </label>
          <input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Minimum 8 caractères"
            required
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-orange-500"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="role" className="text-sm font-medium text-zinc-200">
            Rôle
          </label>
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-zinc-100 outline-none transition focus:border-orange-500"
          >
            <option value="USER">USER</option>
            <option value="ADMIN">ADMIN</option>
          </select>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Link
            href="/admin/accounts"
            className="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-semibold text-zinc-300 transition hover:border-zinc-500 hover:text-white"
          >
            Annuler
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 rounded-lg bg-[#E25814] px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:opacity-50 cursor-pointer"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Enregistrer
          </button>
        </div>
      </form>
    </div>
  )
}