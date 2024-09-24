import { RecipeIngredient } from './recipeIngredient';

export interface Ingredient {
  id: number;
  name: string;
  description?: string | null; // Optional field
  unit?: string | null; // Optional field
  recipeIngredients?: RecipeIngredient[]; // Relation to RecipeIngredient
}
