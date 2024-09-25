import { prisma } from "@/lib/prisma";
import IngredientSelector from "@/components/IngredientSelector"; // Import the client component
import { Ingredient, Recipe, RecipeIngredient } from "@prisma/client";

// Define types for the ingredient and recipe based on your data model
//
interface RecipeWithIngredients extends Recipe {
  recipeIngredients: (RecipeIngredient & { ingredient: Ingredient })[]; // Include the related ingredient
}


const Home = async () => {
  const ingredients: Ingredient[] = await prisma.ingredient.findMany({
    include: {
      recipeIngredients: true, // Include the recipeIngredients relation
    },
  });
  const recipes: RecipeWithIngredients[] = await prisma.recipe.findMany({
    include: {
      recipeIngredients: {
        include: {
          ingredient: true, // Include the ingredient relation
        },
      }, // Include the recipeIngredients relation
    },
  });

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="row-start-2">

        <a href="/import">Import CSV</a>
        <h1 className="text-4xl font-bold text-center">Recipe Finder</h1>
        <IngredientSelector ingredients={ingredients} recipes={recipes} />
      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
        Myles Pritchett
      </footer>
    </div>
  );
};

export default Home;
