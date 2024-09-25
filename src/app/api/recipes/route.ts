// app/api/recipes/route.ts
import { NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma"; // Import Prisma client

export async function GET() {
  const ingredients = await prisma.ingredient.findMany();
  const recipes = await prisma.recipe.findMany({
    include: {
      recipeIngredients: {
        include: {
          ingredient: true,
        },
      },
    },
  });

  console.log(ingredients);
  console.log(recipes);

  return NextResponse.json({ ingredients, recipes });
}


