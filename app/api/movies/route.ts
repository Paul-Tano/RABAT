import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { z } from "zod"

const movieSchema = z.object({
    tmdbId: z.number(),
    title: z.string().min(1, "Le titre est obligatoire"),
    description: z.string(),
    poster: z.string(),
    trailer: z.string().optional(),
    director: z.string(),
    genre: z.string(),
    releaseDate: z.string()
})


export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const page = parseInt(searchParams.get("page") || "1")
        const limit = parseInt(searchParams.get("limit") || "12")
        const skip = (page - 1) * limit

        const [movies, total] = await Promise.all([
            prisma.movie.findMany({
                skip,
                take: limit,
                orderBy: { createdAt: "desc" },
                include: { ratings: true }
            }),
            prisma.movie.count()
        ])

        return NextResponse.json({
            movies,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        }, { status: 200 })

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

        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json(
                { error: "Non autorisé" },
                { status: 403 }
            )
        }
        const body = await request.json()
        const validation = movieSchema.safeParse(body)
        if (!validation.success) {
            return NextResponse.json(
                { error: validation.error.issues[0].message },
                { status: 400 }
            )
        }

        const {
            tmdbId, title, description, poster, trailer, director, genre, releaseDate
        } = validation.data

        const existingMovie = await prisma.movie.findUnique({
            where: { tmdbId }
        })

        if (existingMovie) {
            return NextResponse.json(
                { error: "Ce film existe déjà" },
                { status: 400 }
            )
        }

        const movie = await prisma.movie.create({
            data: {
                tmdbId, title, description, poster, trailer: trailer, director, genre, releaseDate: new Date(releaseDate)
            }
        })

        return NextResponse.json(movie, { status: 201 })

    } catch (error) {
        return NextResponse.json(
            { error: "Erreur serveur" },
            { status: 500 }
        )
    }
}