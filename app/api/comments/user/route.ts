import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) {
            return NextResponse.json(
                { error: "Non authentifié" },
                { status: 401 }
            )
        }
        const comments = await prisma.comment.findMany({
            where: { userId: parseInt(session.user.id) },
            orderBy: { createdAt: "desc" },
            include: {
                movie: {
                    select: { title: true }
                }
            }
        })

        return NextResponse.json(comments, { status: 200 })

    } catch (error) {
        return NextResponse.json(
            { error: "Erreur serveur" },
            { status: 500 }
        )
    }
}