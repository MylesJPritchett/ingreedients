import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Adjust this import based on your Prisma setup

export async function GET() {
  try {
    const recipes = await prisma.recipe.findMany({
      include: {
        recipeIngredients: {
          include: {
            ingredient: true,
          },
        },
      },
    });

    return NextResponse.json(recipes);
  } catch (error) {
    console.error("Failed to fetch recipes:", error);
    return NextResponse.json({ error: "Failed to fetch recipes" }, { status: 500 });
  }
}
