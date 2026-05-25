"use client"
import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { MessageSquare, Send, LogIn, Trash2, Loader2 } from "lucide-react"

interface Comment {
  id: number
  content: string
  createdAt: string
  user: {
    username: string
    role?: string
  }
}

interface CommentSectionProps {
  movieId: number
  session: {
    user: {
      id: string | number 
      username: string
      role: string
    }
  } | null
}

export default function CommentSection({ movieId, session }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(false)
 const [deletingId, setDeletingId] = useState<number | null>(null)


  
  const fetchComments = useCallback(async (): Promise<void> => {
    if (!movieId) return
    try {
      const res = await fetch(`/api/comments/${movieId}`)
      if (res.ok) {
        const data = (await res.json()) as Comment[]
        setComments(data)
      }
    } catch (err) {
      console.error("Erreur chargement commentaires:", err)
    }
  }, [movieId])

  useEffect(() => {
    let isMounted = true
    if (isMounted) {
      void fetchComments()
    }
    return () => {
      isMounted = false
    }
  }, [fetchComments])

 
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()
    
    if (!newComment.trim() || !session?.user?.id || loading) return
    setLoading(true)
    try {
      const userIdAsNumber = Number(session.user.id)
      if (isNaN(userIdAsNumber)) {
        alert("Votre identifiant utilisateur n'est pas un nombre valide.")
        setLoading(false)
        return
      }
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: newComment.trim(),
          movieId: movieId,
          userId: userIdAsNumber 
        }),
      })

      if (res.ok) {
        const createdComment = (await res.json()) as Comment
        setComments([createdComment, ...comments]) 
        setNewComment("")
      } else {
        const errData = (await res.json()) as { error?: string | Record<string, unknown> }
        console.error("Rejet du serveur :", errData.error)
        alert("Erreur lors de l'enregistrement de votre commentaire.")
      }
    } catch (err) {
      console.error("Erreur envoi commentaire:", err)
    } finally {
      setLoading(false)
    }
  }
  const handleDeleteComment = async (commentId: number) => {
  if (!confirm("Supprimer ce commentaire ?")) return
  setDeletingId(commentId)
  try {
    const res = await fetch(`/api/comments/${commentId}`, { method: "DELETE" })
    if (res.ok) {
      setComments(comments.filter(c => c.id !== commentId))
    }
  } catch (err) {
    console.error("Erreur suppression:", err)
  } finally {
    setDeletingId(null)
  }
}

  return (
    <div className="mt-12 border-t border-zinc-900 pt-8 max-w-4xl mx-auto">
      <h3 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
        <MessageSquare size={20} className="text-red-500" />
        Commentaires ({comments.length})
      </h3>

      {session?.user ? (
        <form onSubmit={handleSubmit} className="mb-8 flex gap-4 items-end">
          <div className="flex-1">
            <textarea
              value={newComment}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewComment(e.target.value)}
              placeholder="Ajouter un commentaire ..."
              rows={2}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-red-600 transition-colors resize-none text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !newComment.trim()}
            className="bg-red-600 hover:bg-red-500 text-white p-3 rounded-xl transition-all disabled:opacity-50 disabled:hover:bg-red-600 cursor-pointer h-11 flex items-center justify-center shrink-0"
          >
            <Send size={18} />
          </button>
        </form>
      ) : (
        <div className="bg-zinc-900/50 border border-zinc-900 rounded-2xl p-6 text-center mb-8">
          <p className="text-zinc-400 text-sm mb-4">Vous devez être connecté pour publier un commentaire.</p>
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-2 text-sm font-bold bg-zinc-800 hover:bg-zinc-700 px-5 py-2.5 rounded-xl text-white transition-all border border-zinc-700"
          >
            <LogIn size={16} />
            Se connecter pour commenter
          </Link>
        </div>
      )}

      <div className="space-y-6">
        {comments.length === 0 ? (
          <p className="text-zinc-500 text-sm italic">Aucun commentaire pour le moment. Soyez le premier !</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="flex gap-4 bg-zinc-900/20 p-4 rounded-xl border border-zinc-900">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-zinc-800 to-zinc-700 flex items-center justify-center font-bold text-white uppercase text-sm border border-zinc-600 shrink-0">
                {comment.user.username ? comment.user.username.substring(0, 2) : "U"}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold text-white">
                    {comment.user.username || "Utilisateur"}
                  </span>
                  <span className="text-xs text-zinc-500">
                    {new Date(comment.createdAt).toLocaleDateString("fr-FR")}
                  </span>
                  <button
      onClick={() => handleDeleteComment(comment.id)}
      disabled={deletingId === comment.id}
      className="ml-auto p-1 text-zinc-600 hover:text-red-500 transition-colors disabled:opacity-50"
    >
      {deletingId === comment.id
        ? <Loader2 size={14} className="animate-spin" />
        : <Trash2 size={14} />
      }
    </button>
                </div>
                <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">{comment.content}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}