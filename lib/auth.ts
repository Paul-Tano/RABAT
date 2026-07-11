import { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export const authOptions: NextAuthOptions = {
    secret: process.env.NEXTAUTH_SECRET,

    session: {
        strategy: "jwt"
    },

    providers: [
        CredentialsProvider({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email }
                })

                if (!user || !user.password) return null
                if (!user.is_active) {
                    throw new Error("Compte suspendu")
                }

                const passwordMatch = await bcrypt.compare(
                    credentials.password,
                    user.password
                )

                if (!passwordMatch) return null

                return {
                    id: String(user.id),
                    email: user.email,
                    username: user.username,
                    role: user.role
                }
            }
        }),

        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            allowDangerousEmailAccountLinking: true
        }),
    ],

    callbacks: {
        async signIn({ user, account, profile }) {
            if (account?.provider === "google") {
                try {
                    const existingUser = await prisma.user.findUnique({
                        where: { email: user.email! }
                    })

                    if (!existingUser) {
                        const baseUsername = profile?.name
                            ?.toLowerCase()
                            .replace(/\s+/g, "_")
                            .replace(/[^a-z0-9_]/g, "")
                            || user.email!.split("@")[0]

                        const usernameExists = await prisma.user.findFirst({
                            where: { username: baseUsername }
                        })

                        const username = usernameExists
                            ? `${baseUsername}_${Math.floor(Math.random() * 1000)}`
                            : baseUsername

                        const newUser = await prisma.user.create({
                            data: {
                                email: user.email!,
                                username,
                            }
                        })
                        user.id = String(newUser.id)
                    } else {
                        user.id = String(existingUser.id)
                    }
                } catch (error) {
                    return false
                }
            }
            return true
        },

        async jwt({ token, user }) {
            if (user) {
                token.id = user.id
                token.role = (user as any).role
                token.username = (user as any).username
            }
            return token
        },

        async session({ session, token }) {
            if (token) {
                session.user.id = token.id as string
                session.user.username = token.username as string
                if (token.email) {
                    const dbUser = await prisma.user.findUnique({
                        where: { email: token.email }
                    })
                    if (dbUser && dbUser.is_active) {
                        session.user.role = dbUser.role
                    } else {
                        session.user.role = "SUSPENDED"
                    }
                } else {
                    session.user.role = token.role as string
                }
            }
            return session
        }
    },

    pages: {
        signIn: "/auth/login"
    }
}