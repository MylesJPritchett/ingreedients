"use client";
import { Recipe } from "@/models/recipe";
import { Ingredient } from "@/models/ingredient";
import { useState } from "react";

// Define props interface
interface IngredientSelectorProps {
  ingredients: Ingredient[];
  recipes: Recipe[];
}

const IngredientSelector: React.FC<IngredientSelectorProps> = ({ ingredients, recipes }) => {
  const [selectedIngredients, setSelectedIngredients] = useState<number[]>([]);
  const [ingredientSearch, setIngredientSearch] = useState<string>("");
  const [recipeSearch, setRecipeSearch] = useState<string>("");
  const [selectedRecipes, setSelectedRecipes] = useState<Recipe[]>([]);

  const toggleIngredient = (ingredientId: number) => {
    setSelectedIngredients((prevSelected) =>
      prevSelected.includes(ingredientId)
        ? prevSelected.filter((i) => i !== ingredientId)
        : [...prevSelected, ingredientId]
    );
  };

  const toggleRecipe = (recipe: Recipe) => {
    setSelectedRecipes((prevSelected) =>
      prevSelected.some((r) => r.id === recipe.id)
        ? prevSelected.filter((r) => r.id !== recipe.id)
        : [...prevSelected, recipe]
    );
  };

  const getRecipeStatus = (recipe: Recipe) => {
    const recipeIngredientIds = recipe.recipeIngredients?.map((ri) => ri.ingredientId);
    const allIngredientsSelected = recipeIngredientIds?.every((id) =>
      selectedIngredients.includes(id)
    );

    if (allIngredientsSelected) {
      return "✔️";
    } else {
      const missingIngredientsCount = ingredientsNeeded(recipe);
      return `${missingIngredientsCount} more needed`;
    }
  };

  const ingredientsNeeded = (recipe: Recipe) => {
    const recipeIngredientIds = recipe.recipeIngredients?.map((ri) => ri.ingredientId);
    return recipeIngredientIds?.filter((id) => !selectedIngredients.includes(id)).length;
  };

  const sortRecipes = (a: Recipe, b: Recipe) => {
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

    return 0;
  };

  const selectedRecipeIngredients = selectedRecipes.flatMap((recipe) =>
    recipe.recipeIngredients?.map((ri) => ri.ingredientId) || []
  );

  const uniqueRecipeIngredients = Array.from(new Set(selectedRecipeIngredients));

  const filteredIngredients = selectedRecipes.length
    ? ingredients.filter((ingredient) => uniqueRecipeIngredients.includes(ingredient.id))
    : ingredients;

  // New function to calculate how many recipes an ingredient will complete immediately
  const getIngredientImmediateImpact = (ingredientId: number) => {
    let completesRecipesImmediately = 0;
    let getsRecipesCloser = 0;

    recipes.forEach((recipe) => {
      const recipeIngredientIds = recipe.recipeIngredients?.map((ri) => ri.ingredientId);
      const missingIngredients = recipeIngredientIds?.filter((id) => !selectedIngredients.includes(id));

      if (missingIngredients?.length === 1 && missingIngredients.includes(ingredientId)) {
        // This ingredient will complete the recipe
        completesRecipesImmediately++;
      } else if (missingIngredients?.includes(ingredientId)) {
        // This ingredient gets the recipe closer to being complete
        getsRecipesCloser++;
      }
    });

    // Higher weight for completing recipes, lower weight for getting closer
    return completesRecipesImmediately * 1000 + getsRecipesCloser;
  };

  // Sort ingredients with selected ones always at the top, then by immediate impact
  const sortedIngredients = filteredIngredients
    .filter((ingredient) =>
      ingredient.name.toLowerCase().includes(ingredientSearch.toLowerCase())
    )
    .sort((a, b) => {
      const aSelected = selectedIngredients.includes(a.id) ? 1 : 0;
      const bSelected = selectedIngredients.includes(b.id) ? 1 : 0;

      // Sort selected ingredients at the top
      if (aSelected !== bSelected) {
        return bSelected - aSelected;
      }

      // Sort unselected ingredients by immediate impact on completing recipes
      return getIngredientImmediateImpact(b.id) - getIngredientImmediateImpact(a.id);
    });

  return (
    <div className="flex flex-row gap-8 w-full">
      {/* Left Column for Ingredients */}
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

      {/* Right Column for Recipes */}
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
                className={`flex justify-between items-center cursor-pointer ${selectedRecipes.some((r) => r.id === recipe.id) ? "bg-gray-400" : ""}`}
                onClick={() => toggleRecipe(recipe)}
              >
                <span>{recipe.name}</span>
                <span>{getRecipeStatus(recipe)}</span>
              </li>
            ))}
        </ul>
      </div>
    </div>
  );
};

export default IngredientSelector;
