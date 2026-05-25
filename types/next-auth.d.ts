import { DefaultSession } from "next-auth"

declare module "next-auth" {
    interface Session {
        user: {
            id: string
            role: string
            isActive: boolean
            username: string
        } & DefaultSession["user"]
    }

    interface User {
        role: string
        username: string
        

    }
}