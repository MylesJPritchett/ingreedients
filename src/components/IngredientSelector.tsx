"use client"; // Ensure this is a client component
import { Ingredient, Recipe, RecipeIngredient } from "@prisma/client";
import { useState } from "react";
import Link from 'next/link';

// Define props interface
interface IngredientSelectorProps {
  ingredients: Ingredient[];
  recipes: RecipeWithIngredients[]; // Ensure this is the extended type
}

// Extended Recipe type to include RecipeIngredients
interface RecipeWithIngredients extends Recipe {
  recipeIngredients: (RecipeIngredient & { ingredient: Ingredient })[]; // Include the related ingredient
}

const IngredientSelector: React.FC<IngredientSelectorProps> = ({ ingredients, recipes }) => {
  const [selectedIngredients, setSelectedIngredients] = useState<number[]>([]);
  const [ingredientSearch, setIngredientSearch] = useState<string>("");
  const [recipeSearch, setRecipeSearch] = useState<string>("");
  const [selectedRecipes, setSelectedRecipes] = useState<RecipeWithIngredients[]>([]); // Update to use extended type

  const toggleIngredient = (ingredientId: number) => {
    setSelectedIngredients((prevSelected) =>
      prevSelected.includes(ingredientId)
        ? prevSelected.filter((i) => i !== ingredientId)
        : [...prevSelected, ingredientId]
    );
  };

  const toggleRecipe = (recipe: RecipeWithIngredients) => {
    setSelectedRecipes((prevSelected) =>
      prevSelected.some((r) => r.id === recipe.id)
        ? prevSelected.filter((r) => r.id !== recipe.id)
        : [...prevSelected, recipe]
    );
  };

  const getRecipeStatus = (recipe: RecipeWithIngredients) => {
    const recipeIngredientIds = recipe.recipeIngredients.map((ri) => ri.ingredientId);
    const allIngredientsSelected = recipeIngredientIds.every((id) => selectedIngredients.includes(id));

    if (allIngredientsSelected) {
      return "✔️";
    } else {
      const missingIngredientsCount = ingredientsNeeded(recipe);
      return `${missingIngredientsCount} more needed`; // Fixed string interpolation
    }
  };

  const ingredientsNeeded = (recipe: RecipeWithIngredients) => {
    const recipeIngredientIds = recipe.recipeIngredients.map((ri) => ri.ingredientId);
    return recipeIngredientIds.filter((id) => !selectedIngredients.includes(id)).length;
  };

  const sortRecipes = (a: RecipeWithIngredients, b: RecipeWithIngredients) => {
    const statusOrder: { [key: string]: number } = {
      "✔️": 1,
      "0 more needed": 2,
      "1 more needed": 3,
      "2 more needed": 4,
      "3 more needed": 5,
      "4 more needed": 6,
      "5 more needed": 7,
      "6 more needed": 8,
      "7 more needed": 9,
      "8 more needed": 10,
      "9 more needed": 11,
      "10 more needed": 12,
    };

    const statusA = getRecipeStatus(a);
    const statusB = getRecipeStatus(b);

    if (statusOrder[statusA] !== statusOrder[statusB]) {
      return statusOrder[statusA] - statusOrder[statusB];
    }

    return a.name.localeCompare(b.name);
  };

  const selectedRecipeIngredients = selectedRecipes.flatMap((recipe) =>
    recipe.recipeIngredients.map((ri) => ri.ingredientId)
  );

  const uniqueRecipeIngredients = Array.from(new Set(selectedRecipeIngredients));

  const filteredIngredients = selectedRecipes.length
    ? ingredients.filter((ingredient) => uniqueRecipeIngredients.includes(ingredient.id))
    : ingredients;

  const getIngredientImmediateImpact = (ingredientId: number) => {
    let completesRecipesImmediately = 0;
    let getsRecipesCloser = 0;

    recipes.forEach((recipe) => {
      const recipeIngredientIds = recipe.recipeIngredients?.map((ri) => ri.ingredientId);
      const missingIngredients = recipeIngredientIds?.filter((id) => !selectedIngredients.includes(id));

      if (missingIngredients?.length === 1 && missingIngredients.includes(ingredientId)) {
        completesRecipesImmediately++;
      } else if (missingIngredients?.includes(ingredientId)) {
        getsRecipesCloser++;
      }
    });

    return completesRecipesImmediately * 1000 + getsRecipesCloser;
  };

  const sortedIngredients = filteredIngredients
    .filter((ingredient) => ingredient.name.toLowerCase().includes(ingredientSearch.toLowerCase()))
    .sort((a, b) => {
      const aSelected = selectedIngredients.includes(a.id) ? 1 : 0;
      const bSelected = selectedIngredients.includes(b.id) ? 1 : 0;

      if (aSelected !== bSelected) {
        return bSelected - aSelected;
      }

      const impactComparison = getIngredientImmediateImpact(b.id) - getIngredientImmediateImpact(a.id);
      if (impactComparison !== 0) {
        return impactComparison;
      }

      return a.name.localeCompare(b.name);
    });

  return (
    <div className="flex flex-row gap-8 w-full">
      <div className="flex flex-col w-full sm:w-1/2">
        <input
          type="text"
          placeholder="Search Ingredients..."
          value={ingredientSearch}
          onChange={(e) => setIngredientSearch(e.target.value)}
          className="mb-4 p-2 border rounded"
        />
        <ul className="flex flex-col gap-y-2">
          {sortedIngredients.map((ingredient) => (
            <li key={ingredient.id} className="flex items-center">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedIngredients.includes(ingredient.id)}
                  onChange={() => toggleIngredient(ingredient.id)}
                  className="mr-2"
                />
                {ingredient.name}
              </label>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-col w-full sm:w-1/2">
        <input
          type="text"
          placeholder="Search Recipes..."
          value={recipeSearch}
          onChange={(e) => setRecipeSearch(e.target.value)}
          className="mb-4 p-2 border rounded"
        />
        <ul className="flex flex-col gap-y-2">
          {recipes
            .filter((recipe) =>
              recipe.name.toLowerCase().includes(recipeSearch.toLowerCase())
            )
            .sort(sortRecipes)
            .map((recipe) => (
              <li
                key={recipe.id}
                className={`flex justify-between items-center cursor-pointer ${selectedRecipes.some((r) => r.id === recipe.id) ? "bg-gray-400" : ""}`} // Fixed className formatting
                onClick={() => toggleRecipe(recipe as RecipeWithIngredients)} // Cast recipe as RecipeWithIngredients
              >
                <span>{recipe.name}</span>
                <span>{getRecipeStatus(recipe as RecipeWithIngredients)}</span> {/* Cast recipe as RecipeWithIngredients */}
                <Link
                  href={`/recipes/${recipe.name.replace(/ /g, '-')}`} // Ensure proper slug formatting
                  className="ml-4 bg-blue-500 text-white px-2 py-1 rounded inline-block"
                >
                  View
                </Link>
              </li>
            ))}
        </ul>
      </div>
    </div>
  );
};

export default IngredientSelector;
