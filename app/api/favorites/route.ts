import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { z } from "zod"

const favoriteSchema = z.object({
    movieId: z.number()
})
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session) {
            return NextResponse.json(
                { error: "Non authentifié" },
                { status: 401 }
            )
        }
        const favorites = await prisma.favorite.findMany({
            where: { userId: parseInt(session.user.id) },
            include: {
                movie: {
                    select: {
                        id: true,
                         title: true,
                         poster: true,
                         genre: true,
                        director: true,
                        releaseDate: true,
                        ratings: true
                    }
                }
            },
            orderBy: { id: "desc" }
        })

        return NextResponse.json(favorites, { status: 200 })

    } catch (error) {
        return NextResponse.json(
            { error: "Erreur serveur" },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session) {
            return NextResponse.json(
                { error: "Non authentifié" },
                { status: 401 }
            )
        }

        const body = await request.json()
        const validation = favoriteSchema.safeParse(body)

        if (!validation.success) {
            return NextResponse.json(
                { error: validation.error.issues[0].message },
                { status: 400 }
            )
        }
        const { movieId } = validation.data
        const userId = parseInt(session.user.id)
        const movie = await prisma.movie.findUnique({
            where: { id: movieId }
        })
        if (!movie) {
            return NextResponse.json(
                { error: "Film non trouvé" },
                { status: 404 }
            )
        }
        const existingFavorite = await prisma.favorite.findUnique({
            where: {
                userId_movieId: { userId, movieId }
            }
        })
        if (existingFavorite) {
            return NextResponse.json(
                { error: "Ce film est déjà dans vos favoris" },
                { status: 400 }
            )
        }
        const favorite = await prisma.favorite.create({
            data: { userId, movieId },
            include: {
                movie: {
                    select: {
                        id: true,
                        title: true,
                        poster: true
                    }
                }
            }
        })
     return NextResponse.json(favorite, { status: 201 })

    } catch (error) {
        return NextResponse.json(
            { error: "Erreur serveur" },
            { status: 500 }
        )
    }
}
export async function DELETE(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) {
            return NextResponse.json(
                { error: "Non authentifié" },
                { status: 401 }
            )
        }
        const body = await request.json()
        const validation = favoriteSchema.safeParse(body)

        if (!validation.success) {
            return NextResponse.json(
                { error: validation.error.issues[0].message },
                { status: 400 }
            )
        }

    const { movieId } = validation.data
     const userId = parseInt(session.user.id)

        const existingFavorite = await prisma.favorite.findUnique({
            where: {
                userId_movieId: { userId, movieId }
            }
        })

        if (!existingFavorite) {
            return NextResponse.json(
                { error: "Ce film n'est pas dans vos favoris" },
                { status: 404 }
            )
        }

    await prisma.favorite.delete({
        where: {
            userId_movieId: { userId, movieId }
        }
    })
        return NextResponse.json(
            { message: "Film retiré des favoris" },
            { status: 200 }
        )

    } catch (error) {
        return NextResponse.json(
            { error: "Erreur serveur" },
            { status: 500 }
        )
    }
}