import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json(
                { error: "Non autorisé" },
                { status: 403 }
            )
        }
    const [totalUsers, totalAdmins, totalMovies, totalRatings, totalComments, recentRatings] = await Promise.all([
        prisma.user.count(),
        prisma.user.count({
            where: { role: "ADMIN" }
        }),
        prisma.movie.count(),
        prisma.rating.count(),
        prisma.comment.count(),
        prisma.rating.findMany({
            take: 5,
            orderBy: { id: "desc" },
            include: {
                user: {
                    select: { username: true }
                },
                movie: {
                    select: { title: true }
                }
            }
        })
    ])

        return NextResponse.json({ totalUsers, totalAdmins, totalMovies, totalRatings, totalComments, recentRatings}, { status: 200 })

    } catch (error) {
        return NextResponse.json(
            { error: "Erreur serveur" },
            { status: 500 }
        )
    }
}