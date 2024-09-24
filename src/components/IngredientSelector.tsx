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
  const [selectedRecipes, setSelectedRecipes] = useState<Recipe[]>([]); // State for selected recipes

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

  // Function to determine the status of the recipe based on selected ingredients
  const getRecipeStatus = (recipe: Recipe) => {
    const recipeIngredientIds = recipe.recipeIngredients?.map((ri) => ri.ingredientId);
    const allIngredientsSelected = recipeIngredientIds?.every((id) =>
      selectedIngredients.includes(id)
    );

    if (allIngredientsSelected) {
      return "✔️"; // Tick if all ingredients of the recipe are selected
    } else {
      const missingIngredientsCount = ingredientsNeeded(recipe);
      return `${missingIngredientsCount} more needed`; // Return how many more are needed
    }
  };

  // Function to determine the number of ingredients needed to complete the recipe
  const ingredientsNeeded = (recipe: Recipe) => {
    const recipeIngredientIds = recipe.recipeIngredients?.map((ri) => ri.ingredientId);
    return recipeIngredientIds?.filter((id) => !selectedIngredients.includes(id)).length;
  };

  // Custom sorting function
  const sortRecipes = (a: Recipe, b: Recipe) => {
    const statusOrder: { [key: string]: number } = {
      "✔️": 1, // Tick first
      "0 more needed": 2, // No more needed, meaning complete
      "1 more needed": 3, // Ascending order by number of missing ingredients
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

    // Compare by status
    if (statusOrder[statusA] !== statusOrder[statusB]) {
      return statusOrder[statusA] - statusOrder[statusB];
    }

    return 0; // Maintain order if they are the same
  };

  // Combine ingredients from all selected recipes
  const selectedRecipeIngredients = selectedRecipes.flatMap((recipe) =>
    recipe.recipeIngredients?.map((ri) => ri.ingredientId) || []
  );

  const uniqueRecipeIngredients = Array.from(new Set(selectedRecipeIngredients));

  // Filter ingredients based on selected recipes (if any)
  const filteredIngredients = selectedRecipes.length
    ? ingredients.filter((ingredient) => uniqueRecipeIngredients.includes(ingredient.id))
    : ingredients;

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
          {filteredIngredients
            .filter((ingredient) =>
              ingredient.name.toLowerCase().includes(ingredientSearch.toLowerCase())
            )
            .map((ingredient) => (
              <li key={ingredient.id} className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedIngredients.includes(ingredient.id)}
                  onChange={() => toggleIngredient(ingredient.id)}
                  className="mr-2"
                />
                {ingredient.name}
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
            .sort(sortRecipes) // Sort the recipes
            .map((recipe) => (
              <li
                key={recipe.id}
                className={`flex justify-between items-center cursor-pointer ${selectedRecipes.some((r) => r.id === recipe.id) ? "bg-gray-200" : ""
                  }`}
                onClick={() => toggleRecipe(recipe)}
              >
                <span>{recipe.name}</span>
                <span>{getRecipeStatus(recipe)}</span> {/* Show status here */}
              </li>
            ))}
        </ul>
      </div>
    </div>
  );
};

export default IngredientSelector;
