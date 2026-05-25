import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { z } from "zod"

const ratingSchema = z.object({
    movieId: z.number().int().positive(),
    score: z.number().int().min(1).max(5)
})

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
        const validation = ratingSchema.safeParse(body)

        if (!validation.success) {
            return NextResponse.json(
                { error: validation.error.issues[0].message },
                { status: 400 }
            )
        }

        const { movieId, score } = validation.data
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

        const rating = await prisma.rating.upsert({
            where: {
                userId_movieId: { userId, movieId }
            },
            update: { score },
            create: { userId, movieId, score }
        })

        const allRatings = await prisma.rating.findMany({
            where: { movieId }
        })

        const average = allRatings.reduce((acc, r) => acc + r.score, 0) / allRatings.length

        return NextResponse.json({
            rating,
            averageRating: parseFloat(average.toFixed(1)),
            ratingsCount: allRatings.length
        }, { status: 201 })

    } catch (error) {
        return NextResponse.json(
            { error: "Erreur serveur" },
            { status: 500 }
        )
    }
}