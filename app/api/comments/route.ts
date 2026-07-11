import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";


const commentCreateSchema = z.object({
    content: z.string().trim().min(1, "Le commentaire ne peut pas être vide").max(1000, "Commentaire trop long (1000 caractères max)"),
    movieId: z.number({ message: "L'ID du film doit être un nombre" }),
    userId: z.number({ message: "L'ID de l'utilisateur doit être un nombre" })
});

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const validation = commentCreateSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json(
                { error: validation.error.format() },
                { status: 400 }
            );
        }
        const { content, movieId, userId } = validation.data;
        const userExists = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!userExists) {
            return NextResponse.json(
                { error: "Utilisateur introuvable" },
                { status: 404 }
            );
        }
        const movieExists = await prisma.movie.findUnique({
            where: { id: movieId }
        });
        if (!movieExists) {
            return NextResponse.json(
                { error: "Le film spécifié n'existe pas dans la base de données" },
                { status: 404 }
            );
        } 
        const newComment = await prisma.comment.create({
            data: {
                content,
                movieId,
                userId
            },  
            include: {
                user: {
                    select: {
                        username: true,
                        role: true
                    }
                }
            }
        });
        return NextResponse.json(newComment, { status: 201 });

    } catch (error) {
        console.error("Erreur POST /api/comments:", error);
        return NextResponse.json(
            { error: "Erreur serveur lors de l'ajout du commentaire" },
            { status: 500 }
        );
    }
}