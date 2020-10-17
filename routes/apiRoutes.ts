import * as express from 'express';
import {createIngredient, createRecipe, getRecipes} from "../controllers/apiController";

const apiRoutes = express.Router();

apiRoutes.get('/recipes', getRecipes);
apiRoutes.post('/recipe', createRecipe);
apiRoutes.post('/ingredient', createIngredient);

export default apiRoutes;