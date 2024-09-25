import { notFound } from 'next/navigation';
import { prisma } from "@/lib/prisma";

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

// Default page component
export default async function RecipePage({ params }: { params: { 'recipe-name': string } }) {
  const slug = params['recipe-name'];
  const recipe = await fetchRecipeByName(slug);

  if (!recipe) {
    notFound(); // Show 404 if recipe not found
  }

  // Ensure recipeIngredients is defined before checking its length
  const recipeIngredients = recipe?.recipeIngredients || [];

  return (
    <section>
      <h1 className="title font-semibold text-2xl tracking-tight">{recipe.name}</h1>
      <div className="flex justify-between items-center mt-2 mb-8 text-sm">
        <p className="text-sm text-neutral-600 dark:text-neutral-400">{recipe.description}</p>
      </div>

      <h2>Ingredients:</h2>
      <ul className="flex flex-col gap-y-2">
        {recipeIngredients.length > 0 ? (
          recipeIngredients.map((recipeIngredient) => (
            <li key={recipeIngredient.id}>
              {recipeIngredient.amount} {recipeIngredient.ingredient?.unit} of{' '}
              {recipeIngredient.ingredient?.name || 'Ingredient not found'}
            </li>
          ))
        ) : (
          <li>No ingredients available.</li>
        )}
      </ul>

      <h2>Method:</h2>
      <article className="prose">
        <p>{recipe.method}</p>
      </article>

      <div>
        <a href="/">Back to Home</a>
      </div>
    </section>
  );
}
