// src/app/api/delete-all/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Adjust this import based on your setup

export async function DELETE() {
  try {
    // First, delete all RecipeIngredient records
    await prisma.recipeIngredient.deleteMany({});

    // Then, delete all Recipe records
    await prisma.recipe.deleteMany({});

    await prisma.ingredient.deleteMany({});

    return NextResponse.json({ message: 'All recipes and their ingredients deleted successfully.' });
  } catch (error) {
    console.error('Error deleting recipes and ingredients:', error);
    return NextResponse.json({ error: 'Failed to delete recipes and ingredients.' }, { status: 500 });
  }
}
