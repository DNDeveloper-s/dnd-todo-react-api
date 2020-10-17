import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const recipeSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: String,
    image: {
        type: String,
        default: "/assets/images/default.jpg"
    },
    ingredients: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Ingredient'
        }
    ],
    author: {
        type: String,
        required: true
    },
    prepTime: {
        type: String,
        required: true
    },
});

const Recipe = mongoose.model('Recipe', recipeSchema);
export default Recipe;