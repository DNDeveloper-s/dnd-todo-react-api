import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const ingredientSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: String,
    image: {
        type: String,
        default: "/assets/images/default.jpg"
    },
    amount: {
        type: Number,
        required: true
    },
});

const Ingredient = mongoose.model('Ingredient', ingredientSchema);
export default Ingredient;