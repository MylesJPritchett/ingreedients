import { RecipeIngredient } from './recipeIngredient';

export interface Recipe {
  id: number;
  name: string;
  description?: string | null; // Optional field
  method?: string | null; // Optional field
  recipeIngredients?: RecipeIngredient[]; // Relation to RecipeIngredient
}
