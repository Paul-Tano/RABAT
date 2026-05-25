import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { z } from "zod"
import bcrypt from "bcryptjs"

const updateMeSchema = z.object({
    username: z.string().min(3, "Le username doit faire au moins 3 caractères").optional(),
    email: z.email("Email invalide").optional(),
    currentPassword: z.string().optional(),
    newPassword: z.string().min(8, "Le mot de passe doit faire au moins 8 caractères").optional()
}).refine(
    (data) => {
        if (data.newPassword && !data.currentPassword) return false
        return true
    },
    {
      message: "Le mot de passe actuel est obligatoire pour changer de mot de passe",
     path: ["currentPassword"]
    }
)

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session) {
            return NextResponse.json(
                { error: "Non authentifié" },
                { status: 401 }
            )
        }
        const user = await prisma.user.findUnique({
            where: { id: parseInt(session.user.id) },
            select: {
                id: true,
                username: true,
                email: true,
                role: true,
                createdAt: true,
                _count: {
                    select: {
                        comments: true,
                        ratings: true,
                        favorites: true
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

export async function PUT(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session) {
            return NextResponse.json(
                { error: "Non authentifié" },
                { status: 401 }
            )
        }

        const body = await request.json()

        const validation = updateMeSchema.safeParse(body)
        if (!validation.success) {
            const errors = z.treeifyError(validation.error)
            return NextResponse.json(
                { error: validation.error.issues[0].message },
                { status: 400 }
            )
        }

        const { username, email, currentPassword, newPassword } = validation.data

        const user = await prisma.user.findUnique({
            where: { id: parseInt(session.user.id) }
        })

        if (!user) {
            return NextResponse.json(
                { error: "Utilisateur non trouvé" },
                { status: 404 }
            )
        }

        if (newPassword && currentPassword) {

            if (!user.password) {
                return NextResponse.json(
                    { error: "Ce compte utilise une connexion externe (Google/Microsoft)" },
                    { status: 400 }
                )
            }

            const passwordMatch = await bcrypt.compare(currentPassword, user.password)

            if (!passwordMatch) {
                return NextResponse.json(
                    { error: "Mot de passe actuel incorrect" },
                    { status: 400 }
                )
            }
        }
        const dataToUpdate: any = {}
        if (username) dataToUpdate.username = username
        if (email) dataToUpdate.email = email
        if (newPassword) dataToUpdate.password = await bcrypt.hash(newPassword, 10)

        const updatedUser = await prisma.user.update({
            where: { id: parseInt(session.user.id) },
            data: dataToUpdate,
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