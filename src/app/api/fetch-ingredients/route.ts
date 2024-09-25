import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Adjust this import based on your Prisma setup

export async function GET() {
  try {
    const ingredients = await prisma.ingredient.findMany({
      include: {
        recipeIngredients: true,
      },
    });

    return NextResponse.json(ingredients);
  } catch (error) {
    console.error("Failed to fetch ingredients:", error);
    return NextResponse.json({ error: "Failed to fetch ingredients" }, { status: 500 });
  }
}
