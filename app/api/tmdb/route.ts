import { NextRequest, NextResponse } from "next/server"
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
        const query = searchParams.get("query")
        if (!query) {
            return NextResponse.json(
                { error: "Le paramètre query est obligatoire" },
                { status: 400 }
            )
        }
        const searchResponse = await fetch(
            `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(query)}&language=fr-FR`,
            {
                headers: {
                    Authorization: `Bearer ${process.env.TMDB_ACCESS_TOKEN}`,
                    "Content-Type": "application/json"
                }
            }
        )

        if (!searchResponse.ok) {
            return NextResponse.json(
                { error: "Erreur lors de l'appel" },
                { status: 500 }
            )
        }
        
        const searchData = await searchResponse.json()

        const movies = await Promise.all(
            searchData.results.map(async (movie: any) => {
                const detailsResponse = await fetch(
                    `https://api.themoviedb.org/3/movie/${movie.id}?append_to_response=credits,videos&language=fr-FR`,
                    {
                        headers: {
                            Authorization: `Bearer ${process.env.TMDB_ACCESS_TOKEN}`,
                            "Content-Type": "application/json"
                        }
                    }
                )

                const details = await detailsResponse.json()

                const director = details.credits?.crew?.find(
                    (person: any) => person.job === "Director"
                )

                const genres = details.genres
                    ?.map((g: any) => g.name)
                    .join(", ") || "Inconnu"

                const trailer = details.videos?.results?.find(
                    (video: any) =>
                        video.type === "Trailer" &&
                        video.site === "YouTube" &&
                        video.official === true
                ) || details.videos?.results?.find(
                    (video: any) =>
                        video.type === "Trailer" &&
                        video.site === "YouTube"
                )

                const trailerUrl = trailer
                    ? `https://www.youtube.com/watch?v=${trailer.key}`
                    : ""

                return {
                    tmdbId: movie.id,
                    title: movie.title,
                    description: movie.overview || "",
                    poster: movie.poster_path
                        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                        : "",
                    director: director?.name || "Inconnu",
                    genre: genres,
                    trailer: trailerUrl,
                    releaseDate: movie.release_date
                }
            })
        )

        return NextResponse.json(movies, { status: 200 })

    } catch (error) {
        return NextResponse.json(
            { error: "Erreur serveur" },
            { status: 500 }
        )
    }
}