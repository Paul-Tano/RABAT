"use client"

import { useState, useEffect } from "react"
import {Trash2, Loader2, ChevronLeft, ChevronRight, ShieldCheck, ShieldOff, Pencil, X, Check,
  ToggleLeft, ToggleRight, Plus } from "lucide-react"
import { User, PaginatedResponse, EditForm } from "@/types"
import Link from "next/link"

export default function AdminUsersPage() {
  const [data, setData] = useState<PaginatedResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [promotingId, setPromotingId] = useState<number | null>(null)
  const [togglingId, setTogglingId] = useState<number | null>(null)
  const [message, setMessage] = useState("")

  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [editForm, setEditForm] = useState<EditForm>({ username: "", email: "" })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchUsers(currentPage)
  }, [currentPage])

  const fetchUsers = async (page: number) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/users?page=${page}&limit=10`)
      const json = await res.json()
      setData(json)
    } catch (error) {
      console.error("Erreur lors du chargement des users")
    } finally {
      setLoading(false)
    }
  }

  const handleOpenEdit = (user: User) => {
    setEditingUser(user)
    setEditForm({ username: user.username, email: user.email })
    setMessage("")
  }

  const handleCloseEdit = () => {
    setEditingUser(null)
    setEditForm({ username: "", email: "" })
  }
  const handleSaveEdit = async () => {
    if (!editingUser) return
    setSaving(true)
    setMessage("")

    try {
      const res = await fetch(`/api/users/${editingUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm)
      })

      const json = await res.json()

      if (!res.ok) {
        setMessage(json.error || "Erreur lors de la modification")
        return
      }

      setMessage(`"${editingUser.username}" modifié avec succès`)
      handleCloseEdit()
      fetchUsers(currentPage)

    } catch (error) {
      setMessage("Erreur serveur")
    } finally {
      setSaving(false)
    }
  }
  const handleToggleActive = async (user: User) => {
    setTogglingId(user.id)
    setMessage("")

    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !user.is_active })
      })

      const json = await res.json()

      if (!res.ok) {
        setMessage(json.error || "Erreur")
        return
      }

      setMessage(
        !user.is_active
          ? `"${user.username}" est maintenant actif`
          : `"${user.username}" est maintenant inactif`
      )

      fetchUsers(currentPage)

    } catch (error) {
      setMessage("Erreur serveur")
    } finally {
      setTogglingId(null)
    }
  }
  const handleToggleRole = async (user: User) => {
    setPromotingId(user.id)
    setMessage("")

    const newRole = user.role === "ADMIN" ? "USER" : "ADMIN"

    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole })
      })

      const json = await res.json()

      if (!res.ok) {
        setMessage(json.error || "Erreur")
        return
      }
      setMessage(
        newRole === "ADMIN"
          ? `${user.username} est maintenant admin`
          : `${user.username} n'est plus admin`
      )
      fetchUsers(currentPage)
    } catch (error) {
      setMessage("Erreur serveur")
    } finally {
      setPromotingId(null)
    }
  }
  const handleDelete = async (user: User) => {
    if (!confirm(`Supprimer "${user.username}" ?`)) return

    setDeletingId(user.id)
    setMessage("")

    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: "DELETE"
      })
      const json = await res.json()
      if (!res.ok) {
        setMessage(json.error || "Erreur lors de la suppression")
        return
      }
      setMessage(`"${user.username}" supprimé avec succès`)
      if (data?.users.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1)
      } else {
        fetchUsers(currentPage)
      }

    } catch (error) {
      setMessage("Erreur serveur")
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Comptes</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Liste des comptes utilisateurs de la plateforme.
        </p>
        <Link
          href="/admin/accounts/create"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#E25814] px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600"
        >
          <Plus className="h-4 w-4" />
          Ajouter
        </Link>
      </div>

      {message && (
        <div className={`px-4 py-3 rounded-lg text-sm font-medium ${
          message.includes("succès") || message.includes("maintenant") || message.includes("plus")
            ? "bg-green-500/10 text-green-400 border border-green-500/30"
            : "bg-red-500/10 text-red-400 border border-red-500/30"
        }`}>
          {message}
        </div>
      )}

      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-[#151518] border border-zinc-800 rounded-2xl p-6 w-full max-w-md space-y-4">

            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">
                Modifier {editingUser.username}
              </h2>
              <button
                onClick={handleCloseEdit}
                className="text-zinc-400 hover:text-white cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-zinc-400 font-medium">
                  Username
                </label>
                <input
                  type="text"
                  value={editForm.username}
                  onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                  className="mt-1 w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400 font-medium">
                  Email
                </label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="mt-1 w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={handleCloseEdit}
                className="px-4 py-2 text-sm text-zinc-400 hover:text-white transition cursor-pointer"
              >
                Annuler
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-lg transition disabled:opacity-50 cursor-pointer"
              >
                {saving
                  ? <Loader2 className="h-4 w-4 animate-spin" />
                  : <Check className="h-4 w-4" />
                }
                Sauvegarder
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tableau */}
      {loading ? (
        <div className="flex items-center gap-2 text-zinc-400 py-12 justify-center">
          <Loader2 className="h-5 w-5 animate-spin" />
          Chargement...
        </div>
      ) : (
        <>
          <div className="overflow-hidden rounded-2xl border border-zinc-800/60 bg-[#151518]">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="border-b border-zinc-800/60 bg-zinc-900/60 text-xs uppercase text-zinc-400">
                  <tr>
                    <th className="px-5 py-4 font-semibold">Username</th>
                    <th className="px-5 py-4 font-semibold">Email</th>
                    <th className="px-5 py-4 font-semibold">Rôle</th>
                    <th className="px-5 py-4 font-semibold">Statut</th>
                    <th className="px-5 py-4 font-semibold">Création</th>
                    <th className="px-5 py-4 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {data?.users.map((user) => (
                    <tr key={user.id} className={`text-zinc-200 ${!user.is_active ? "opacity-50" : ""}`}>
                      <td className="px-5 py-4 font-medium">{user.username}</td>
                      <td className="px-5 py-4 text-zinc-400">{user.email}</td>
                      <td className="px-5 py-4">
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          user.role === "ADMIN"
                            ? "bg-orange-500/10 text-orange-400"
                            : "bg-zinc-800 text-zinc-300"
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          user.is_active
                            ? "bg-green-500/10 text-green-400"
                            : "bg-red-500/10 text-red-400"
                        }`}>
                          {user.is_active ? "Actif" : "Inactif"}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-zinc-400">
                        {new Date(user.createdAt).toLocaleDateString("fr-FR")}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleOpenEdit(user)}
                            title="Modifier"
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-700 text-zinc-300 transition hover:border-orange-500 hover:text-orange-400 cursor-pointer"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleToggleActive(user)}
                            disabled={togglingId === user.id}
                            title={user.is_active ? "Désactiver" : "Activer"}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-700 text-zinc-300 transition hover:border-blue-500 hover:text-blue-400 disabled:opacity-50 cursor-pointer"
                          >
                            {togglingId === user.id
                              ? <Loader2 className="h-4 w-4 animate-spin" />
                              : user.is_active
                                ? <ToggleRight className="h-4 w-4" />
                                : <ToggleLeft className="h-4 w-4" />
                            }
                          </button>
                          <button
                            onClick={() => handleToggleRole(user)}
                            disabled={promotingId === user.id}
                            title={user.role === "ADMIN" ? "Rétrograder" : "Promouvoir admin"}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-700 text-zinc-300 transition hover:border-orange-500 hover:text-orange-400 disabled:opacity-50 cursor-pointer"
                          >
                            {promotingId === user.id
                              ? <Loader2 className="h-4 w-4 animate-spin" />
                              : user.role === "ADMIN"
                                ? <ShieldOff className="h-4 w-4" />
                                : <ShieldCheck className="h-4 w-4" />
                            }
                          </button>
                          <button
                            onClick={() => handleDelete(user)}
                            disabled={deletingId === user.id}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-700 text-zinc-300 transition hover:border-red-500 hover:text-red-400 disabled:opacity-50 cursor-pointer"
                          >
                            {deletingId === user.id
                              ? <Loader2 className="h-4 w-4 animate-spin" />
                              : <Trash2 className="h-4 w-4" />
                            }
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {data && data.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-zinc-400">
                {data.total} utilisateurs • Page {data.page} sur {data.totalPages}
              </p>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => p - 1)}
                  disabled={currentPage === 1}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-700 text-zinc-300 hover:border-orange-500 hover:text-orange-400 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                {Array.from({ length: data.totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`h-9 w-9 rounded-lg text-sm font-semibold transition cursor-pointer ${
                      page === currentPage
                        ? "bg-orange-500 text-white border border-orange-500"
                        : "border border-zinc-700 text-zinc-300 hover:border-orange-500 hover:text-orange-400"
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(p => p + 1)}
                  disabled={currentPage === data.totalPages}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-700 text-zinc-300 hover:border-orange-500 hover:text-orange-400 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}