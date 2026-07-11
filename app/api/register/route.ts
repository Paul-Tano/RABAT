import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { z } from "zod"

const registerSchema = z.object({
    username: z.string().trim().min(3, "Le username doit faire au moins 3 caractères"),
    email: z.string().trim().min(1, "L'email est requis").email("Email invalide"),
    password: z.string().trim().min(8, "Le mot de passe doit faire au moins 8 caractères")
})
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()

        const validation = registerSchema.safeParse(body)
        if (!validation.success) {
            return NextResponse.json(
                { error: validation.error.issues[0].message },
                { status: 400 }
            )
        }

        const { email, password, username } = validation.data

        const existingUser = await prisma.user.findUnique({
            where: { email }
        })

        if (existingUser) {
            return NextResponse.json(
                { error: "Cet email est déjà utilisé" },
                { status: 400 }
            )
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const user = await prisma.user.create({
            data: {
                username,
                email,
                password: hashedPassword
            }
        })
        return NextResponse.json(
        {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role
        },
        { status: 201 }
        )

    } catch (error) {
        return NextResponse.json(
            { error: "Erreur serveur" },
            { status: 500 }
        )
    }
}