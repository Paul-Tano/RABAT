import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: paramId } = await params
        const id = parseInt(paramId)

        if (isNaN(id)) {
            return NextResponse.json({ error: "ID invalide" }, { status: 400 })
        }

        const movie = await prisma.movie.findUnique({
            where: { id },
            include: {
                ratings: true,
                comments: {
                    include: {
                        user: {
                            select: { id: true, username: true }
                        }
                    },
                    orderBy: { createdAt: "desc" }
                },
                favorites: true
            }
        })

        if (!movie) {
            return NextResponse.json({ error: "Film non trouvé" }, { status: 404 })
        }

        return NextResponse.json(movie, { status: 200 })

    } catch (error) {
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
    }
}
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json(
                { error: "Non autorisé" },
                { status: 403 }
            )
        }
        const { id: paramId} = await params
        const id =  parseInt(paramId)

        if (isNaN(id)) {
            return NextResponse.json(
                { error: "ID invalide" },
                { status: 400 }
            )
        }

        const movie = await prisma.movie.findUnique({
            where: { id }
        })

        if (!movie) {
            return NextResponse.json(
                { error: "Film non trouvé" },
                { status: 404 }
            )
        }
        await prisma.movie.delete({
            where: { id }
        })

        return NextResponse.json(
            { message: "Film supprimé avec succès" },
            { status: 200 }
        )

    } catch (error) {
        return NextResponse.json(
            { error: "Erreur serveur" },
            { status: 500 }
        )
    }
}