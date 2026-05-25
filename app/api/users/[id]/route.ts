import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { z } from "zod"

const updateUserSchema = z.object({
    username: z.string().min(3).optional(),
    email: z.email("Email invalide").optional(),
    role: z.enum(["USER", "ADMIN"]).optional(),
    is_active: z.boolean().optional()
})

export async function GET(
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
        const {id:paramid} = await params
        const id = parseInt(paramid)

        if (isNaN(id)) {
            return NextResponse.json(
                { error: "ID invalide" },
                { status: 400 }
            )
        }
        const user = await prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                 username: true,
                email: true,
                 is_active: true,
               role: true,
                createdAt: true,
                comments: {
                    orderBy: { createdAt: "desc" },
                    include: {
                        movie: {
                            select: { title: true }
                        }
                    }
                },
                ratings: {
                    include: {
                        movie: {
                            select: { title: true }
                        }
                    }
                },
                favorites: {
                    include: {
                        movie: {
                            select: { title: true, poster: true }
                        }
                    }
                }
            }
        })

        if (!user) {
            return NextResponse.json(
                { error: "Utilisateur non trouvé" },
                { status: 404 }
            )
        }

        return NextResponse.json(user, { status: 200 })

    } catch (error) {
        return NextResponse.json(
            { error: "Erreur serveur" },
            { status: 500 }
        )
    }
}

export async function PUT(
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

        const { id: paramid } = await params
        const id = parseInt(paramid)

        if (isNaN(id)) {
            return NextResponse.json(
                { error: "ID invalide" },
                { status: 400 }
            )
        }

        const body = await request.json()

        const validation = updateUserSchema.safeParse(body)
        if (!validation.success) {
            return NextResponse.json(
                { error: validation.error.issues[0].message },
                { status: 400 }
            )
        }

        const existingUser = await prisma.user.findUnique({
            where: { id }
        })

        if (!existingUser) {
            return NextResponse.json(
                { error: "Utilisateur non trouvé" },
                { status: 404 }
            )
        }

        const updatedUser = await prisma.user.update({
            where: { id },
            data: validation.data,
            select: {
                id: true,
                username: true,
                email: true,
                role: true
            }
        })

        return NextResponse.json(updatedUser, { status: 200 })

    } catch (error) {
        return NextResponse.json(
            { error: "Erreur serveur" },
            { status: 500 }
        )
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
        const { id: paramid } = await params
        const id = parseInt(paramid)

        if (isNaN(id)) {
            return NextResponse.json(
                { error: "ID invalide" },
                { status: 400 }
            )
        }
        if (String(id) === session.user.id) {
            return NextResponse.json(
                { error: "Vous ne pouvez pas supprimer votre propre compte" },
                { status: 400 }
            )
        }
        const existingUser = await prisma.user.findUnique({
            where: { id }
        })
        if (!existingUser) {
            return NextResponse.json(
                { error: "Utilisateur non trouvé" },
                { status: 404 }
            )
        }
        await prisma.user.delete({
            where: { id }
        })
        return NextResponse.json(
            { message: "Utilisateur supprimé avec succès" },
            { status: 200 }
        )

    } catch (error) {
        return NextResponse.json(
            { error: "Erreur serveur" },
            { status: 500 }
        )
    }
}