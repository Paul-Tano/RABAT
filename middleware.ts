import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
    function middleware(req) {
        const token = req.nextauth.token
        const path = req.nextUrl.pathname

        if (path.startsWith("/admin") && token?.role !== "ADMIN") {
            return NextResponse.redirect(new URL("/", req.url))
        }

        return NextResponse.next()
    },
    {
        callbacks: {
            authorized: ({ token }) => !!token
        }
    }
)

export const config = {
    matcher: [
        "/admin/:path*",
        "/profile/:path*",
        "/api/ratings/:path*",
        "/api/comments/:path*",
        "/api/favorites/:path*",
        "/api/users/:path*",
        "/api/stats/:path*",
    ]
}
