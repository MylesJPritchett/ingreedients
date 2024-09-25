import { notFound } from 'next/navigation';
import { prisma } from "@/lib/prisma";
import { Recipe, RecipeIngredient } from '@prisma/client';

// Function to fetch all recipes with ingredients
async function fetchRecipes(): Promise<Recipe[]> {
  try {
    return await prisma.recipe.findMany({
      include: {
        recipeIngredients: {
          include: {
            ingredient: true,
          },
        },
      },
    });
  } catch (error) {
    console.error("Error fetching recipes:", error);
    return [];
  }
}

// Function to fetch a specific recipe by its slug name
async function fetchRecipeByName(slugName: string) {
  const recipeName = decodeRecipeName(slugName);
  console.log("Decoded recipe name:", recipeName);

  try {
    const recipe = await prisma.recipe.findFirst({
      where: {
        name: recipeName,
      },
      include: {
        recipeIngredients: {
          include: { ingredient: true },
        },
      },
    });
    console.log("Fetched recipe:", recipe);
    return recipe;
  } catch (error) {
    console.error("Error fetching recipe:", error);
    return null;
  }
}

// Helper to decode the slug back to recipe name
function decodeRecipeName(slug: string | undefined): string {
  if (!slug) {
    console.error("Slug is undefined");
    return "";
  }
  return slug.replace(/-/g, ' '); // Decode the slug to match the recipe name
}

// Step 1: Generate static params for the dynamic routes
export async function generateStaticParams() {
  const recipes = await fetchRecipes();

  return recipes.map((recipe) => ({
    slug: recipe.name.replace(/ /g, '-'),
  }));
}

// Step 3: Default page component
export default async function RecipePage({ params }: { params: { 'recipe-name': string } }) {
  const slug = params['recipe-name'];
  console.log("Slug from params:", slug);

  const recipe = await fetchRecipeByName(slug);

  if (!recipe) {
    notFound();
  }

  // Ensure recipeIngredients is defined before checking its length
  const recipeIngredients = recipe?.recipeIngredients || [];

  return (
    <section className="p-6">
      <h1 className="title font-semibold text-3xl tracking-tight mb-4">{recipe.name}</h1>
      <h3 className="text-lg font-semibold text-neutral-500 dark:text-neutral-400 mb-4">
        {recipe.category}
      </h3>
      <div className="flex justify-between items-center mb-4 text-sm">
        <p className="text-sm text-neutral-600 dark:text-neutral-400">{recipe.description}</p>
      </div>

      <h2 className="text-xl font-semibold mt-6 mb-2">Ingredients:</h2>
      <ul className="flex flex-col gap-y-2">
        {recipeIngredients.length > 0 ? (
          recipeIngredients.map((recipeIngredient) => (
            <li key={recipeIngredient.id} className="text-sm">
              {recipeIngredient.amount} {recipeIngredient.ingredient?.unit} of{' '}
              <span className="font-medium">{recipeIngredient.ingredient?.name || 'Ingredient not found'}</span>
            </li>
          ))
        ) : (
          <li className="text-sm text-neutral-600">No ingredients available.</li>
        )}
      </ul>

      <h2 className="text-xl font-semibold mt-6 mb-2">Method:</h2>
      <article className="prose mb-6">
        <p>{recipe.method}</p>
      </article>

      <div className="mt-4">
        <a href="/" className="text-neutral-400 hover:underline">Back to Home</a>
      </div>
    </section>
  );
}
