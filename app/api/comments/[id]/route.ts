import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

interface RouteParams {
    params: Promise<{ id: string }>
}
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params
        const movieIdInt = parseInt(id, 10)
        if (isNaN(movieIdInt)) {
            return NextResponse.json({ error: "ID invalide" }, { status: 400 })
        }
        const comments = await prisma.comment.findMany({
            where: { movieId: movieIdInt },
            include: {
                user: {
                    select: { id: true, username: true, role: true }
                }
            },
            orderBy: { createdAt: "desc" }
        })
        return NextResponse.json(comments, { status: 200 })
    } catch (error) {
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
    }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) {
            return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
        }
        const { id } = await params
        const commentId = parseInt(id)
        if (isNaN(commentId)) {
            return NextResponse.json({ error: "ID invalide" }, { status: 400 })
        }
        const comment = await prisma.comment.findUnique({
            where: { id: commentId }
        })
        if (!comment) {
            return NextResponse.json({ error: "Commentaire non trouvé" }, { status: 404 })
        }
        const isOwner = comment.userId === parseInt(session.user.id)
        const isAdmin = session.user.role === "ADMIN"
        if (!isOwner && !isAdmin) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 403 })
        }
        await prisma.comment.delete({ where: { id: commentId } })
        return NextResponse.json({ message: "Commentaire supprimé" }, { status: 200 })
    } catch (error) {
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
    }
}