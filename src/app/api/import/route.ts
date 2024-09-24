// app/api/import/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Adjust the import path based on your project structure
import csv from 'csv-parser';
import { Readable } from 'stream';

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get('file') as File;

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const stream = Readable.from(buffer);
  const recipeMap = new Map<string, { category: string; ingredients: any[] }>(); // Track recipes and their ingredients

  // Read the CSV file
  return new Promise((resolve) => {
    stream
      .pipe(csv())
      .on('data', (data) => {
        const { category, name, ingredient_direction, quantity, unit, ingredient, note } = data;

        if (!recipeMap.has(name)) {
          recipeMap.set(name, { category, ingredients: [] });
        }

        recipeMap.get(name)?.ingredients.push({
          direction: ingredient_direction,
          quantity: parseFloat(quantity) || 0, // Default to 0 if invalid
          unit,
          ingredient: { name: ingredient },
          note: note || 'NA',
        });
      })
      .on('end', async () => {
        try {
          const resultsPromises = Array.from(recipeMap.entries()).map(async ([name, { category, ingredients }]) => {
            const recipe = await prisma.recipe.upsert({
              where: { name },
              update: {},
              create: {
                name,
                recipeIngredients: {
                  create: await parseIngredients(ingredients),
                },
              },
            });

            return {
              category,
              name: recipe.name,
              ingredients: ingredients,
              method: 'NA', // Default method
            };
          });

          const recipesResults = await Promise.all(resultsPromises);
          resolve(NextResponse.json({ message: 'Recipes imported successfully', recipes: recipesResults }));
        } catch (error) {
          console.error(error);
          resolve(NextResponse.json({ error: 'Error processing recipes' }, { status: 500 }));
        }
      })
      .on('error', (error) => {
        console.error(error);
        resolve(NextResponse.json({ error: 'Error processing the CSV file' }, { status: 500 }));
      });
  });
}

// Helper function to parse ingredients
async function parseIngredients(ingredients: any[]) {
  const ingredientPromises = ingredients.map(async (item) => {
    const { ingredient, quantity, unit, note } = item;

    // Default quantity to 0 if it's invalid or not provided
    const parsedQuantity = parseFloat(quantity);
    const finalQuantity = isNaN(parsedQuantity) ? 0 : parsedQuantity;

    // Create or find the ingredient
    const foundIngredient = await prisma.ingredient.upsert({
      where: { name: ingredient.name },
      update: {},
      create: { name: ingredient.name, unit: unit },
    });

    return {
      ingredient: { connect: { id: foundIngredient.id } },
      amount: finalQuantity,
      use: note || 'NA', // Set as per your requirement
    };
  });

  return Promise.all(ingredientPromises);
}
