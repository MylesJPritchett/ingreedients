// app/recipes/[recipe-name]/page.tsx
import { notFound } from 'next/navigation';
import { prisma } from "@/lib/prisma";
import { Recipe, RecipeIngredient } from '@prisma/client'; // Import types directly from Prisma Client

interface RecipePageParams {
  params: {
    'recipe-name': string; // Define the expected type for recipe-name
  };
}

async function fetchRecipes(): Promise<Recipe[]> {
  const recipes = await prisma.recipe.findMany({
    include: {
      recipeIngredients: {
        include: {
          ingredient: true, // Include the ingredient details
        },
      },
    },
  });
  return recipes;
}

async function fetchRecipeByName(name: string): Promise<(Recipe & { recipeIngredients: (RecipeIngredient & { ingredient: { name: string } })[] }) | null> {
  const recipe = await prisma.recipe.findUnique({
    where: {
      name: name,
    },
    include: {
      recipeIngredients: {
        include: {
          ingredient: true, // Include the ingredient relation
        },
      },
    },
  });
  return recipe;
}

export async function generateStaticParams() {
  const recipes = await fetchRecipes(); // Fetch all recipes

  return recipes.map((recipe) => ({
    'recipe-name': recipe.name.toLowerCase().replace(/ /g, '-'),
  }));
}

export default async function RecipePage({ params }: RecipePageParams) {
  const recipe = await fetchRecipeByName(params['recipe-name']);

  if (!recipe) {
    notFound();
  }

  // Ensure recipeIngredients is defined before checking its length
  const recipeIngredients = recipe.recipeIngredients || []; // Default to an empty array if undefined

  return (
    <section>
      <h1 className="title font-semibold text-2xl tracking-tight">{recipe.name}</h1>
      <div className="flex justify-between items-center mt-2 mb-8 text-sm">
        <p className="text-sm text-neutral-600 dark:text-neutral-400">{recipe.description}</p>
      </div>
      <div className="flex items-center gap-2 mb-4">
        <ul className="flex gap-2">
          {recipeIngredients.length > 0 ? (
            recipeIngredients.map((recipeIngredient) => (
              <li key={recipeIngredient.id}>
                {recipeIngredient.ingredient?.name || 'Ingredient not found'} {/* Safely access ingredient name */}
              </li>
            ))
          ) : (
            <li>No ingredients available.</li>
          )}
        </ul>
      </div>
      <article className="prose">
        <p>{recipe.method}</p>
      </article>
    </section>
  );
}
