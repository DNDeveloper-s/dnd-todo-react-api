import {InterfaceIngredient} from "./InterfaceIngredient";

export interface InterfaceRecipe {
	_id: string;
	title: string;
	description: string;
	ingredients: InterfaceIngredient[];
	image: string;
	author: string;
	prepTime: string;
}