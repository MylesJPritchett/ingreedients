export interface RecipeIngredient {
  id: number;
  recipeId: number;
  ingredientId: number;
  amount: number;
  use?: string | null; // Optional field
}
