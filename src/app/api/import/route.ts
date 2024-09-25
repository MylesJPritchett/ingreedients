import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import csv from 'csv-parser';
import { Readable } from 'stream';

interface CSVBase {
  category: string;
  name: string;
}

interface CSVIngredient extends CSVBase {
  ingredient_direction?: string;
  quantity?: string | null;
  unit?: string | null;
  ingredient: string;
  note?: string | null;
}

interface CSVRecipe extends CSVBase {
  ingredients: string;
  method: string;
}

interface RecipeIngredientInput {
  ingredient: { connect: { id: number } };
  amount: number;
  use: string;
}

export async function POST(request: Request): Promise<Response> {
  const formData = await request.formData();
  const file = formData.get('file') as File;

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const stream = Readable.from(buffer);

  return detectAndHandleCSV(stream);
}

function isCSVRecipe(data: CSVBase): data is CSVRecipe {
  return 'method' in data;
}

async function detectAndHandleCSV(stream: Readable): Promise<Response> {
  return new Promise((resolve) => {
    const results: CSVBase[] = [];
    const parser = csv();

    stream
      .pipe(parser)
      .on('data', (data: CSVBase) => results.push(data))
      .on('end', async () => {
        if (results.length > 0) {
          if (isCSVRecipe(results[0])) {
            return resolve(handleRecipeImport(results as CSVRecipe[]));
          } else if ('ingredient_direction' in results[0]) {
            return resolve(handleIngredientImport(results as CSVIngredient[]));
          } else {
            return resolve(NextResponse.json({ error: 'Unrecognized CSV format' }, { status: 400 }));
          }
        }
      })
      .on('error', (error: Error) => {
        console.error(error);
        resolve(NextResponse.json({ error: 'Error processing the CSV file' }, { status: 500 }));
      });
  });
}

async function handleRecipeImport(recipes: CSVRecipe[]): Promise<Response> {
  try {
    const resultsPromises = recipes.map(async (recipe) => {
      const { name, method } = recipe;

      await prisma.recipe.update({
        where: { name },
        data: { method },
      });

      return { name, method };
    });

    const recipesResults = await Promise.all(resultsPromises);
    return NextResponse.json({ message: 'Recipes updated successfully', recipes: recipesResults });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error processing recipes' }, { status: 500 });
  }
}

async function handleIngredientImport(ingredients: CSVIngredient[]): Promise<Response> {
  const recipeMap = new Map<string, { category: string; ingredients: CSVIngredient[] }>();

  ingredients.forEach((data) => {
    const { category, name, ingredient_direction, quantity, unit, ingredient, note } = data;

    if (!recipeMap.has(name)) {
      recipeMap.set(name, { category, ingredients: [] });
    }

    recipeMap.get(name)?.ingredients.push({
      category,
      name,
      ingredient_direction: ingredient_direction || 'NA',
      quantity,
      unit,
      ingredient,
      note,
    });
  });

  try {
    const resultsPromises = Array.from(recipeMap.entries()).map(async ([name, { category, ingredients }]) => {
      const recipe = await prisma.recipe.upsert({
        where: { name },
        update: {},
        create: {
          name,
          category,
          recipeIngredients: {
            create: await parseIngredients(ingredients),
          },
        },
      });

      return {
        category,
        name: recipe.name,
        ingredients,
        method: 'NA', // Assuming you want to default to 'NA'
      };
    });

    const recipesResults = await Promise.all(resultsPromises);
    return NextResponse.json({ message: 'Ingredients imported successfully', recipes: recipesResults });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error processing ingredients' }, { status: 500 });
  }
}

async function parseIngredients(ingredients: CSVIngredient[]): Promise<RecipeIngredientInput[]> {
  const ingredientPromises = ingredients.map(async (item) => {
    const { ingredient, quantity, unit, note } = item;

    const parsedQuantity = parseFloat(quantity || '0'); // Convert to Float

    try {
      // Upsert the ingredient
      const foundIngredient = await prisma.ingredient.upsert({
        where: { name: ingredient },
        update: {},
        create: { name: ingredient, unit: unit || null },
      });

      // Return a RecipeIngredient object
      return {
        ingredient: { connect: { id: foundIngredient.id } }, // Connect to the found ingredient
        amount: parsedQuantity, // Store as Float
        use: note || 'NA', // Default to 'NA' if note is undefined
      };
    } catch (error) {
      console.error(`Error processing ingredient ${ingredient}:`, error);
      throw error;
    }
  });

  return Promise.all(ingredientPromises);
}
