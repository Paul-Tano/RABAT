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

        const { searchParams } = new URL(request.url)
        const page = parseInt(searchParams.get("page") || "1")
        const limit = parseInt(searchParams.get("limit") || "10")

        const skip = (page - 1) * limit
        const [users, total] = await Promise.all([
            prisma.user.findMany({
                skip,
                take: limit,
                orderBy: { createdAt: "desc" },
                select: {
                    id: true,
                    username: true,
                    email: true,
                    role: true,
                    is_active: true,
                    createdAt: true,
                    _count: {
                        select: {
                            comments: true,
                            ratings: true,
                            favorites: true
                        }
                    }
                }
            }),
            prisma.user.count()
        ])

        return NextResponse.json({
            users,
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