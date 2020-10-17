import * as express from 'express';
import mongoose from 'mongoose';
import {InterfaceRecipe} from "../interfaces/InterfaceRecipe";
import Recipe from "../models/Recipe";
import Ingredient from "../models/Ingredient";
import {InterfaceIngredient} from "../interfaces/InterfaceIngredient";

export const getRecipes = async (req: express.Request, res: express.Response, next: () => void) => {
    return res.json({
        ok: true,
        message: 'This is all the recipes you want...'
    })
}

export const createRecipe = async (req: express.Request, res: express.Response, next: any) => {
    try {
        const {title, description, ingredients, author, image, prepTime}: InterfaceRecipe = req.body;

        const newRecipe = new Recipe({
            title, description, ingredients, author, prepTime, image
        });

        await newRecipe.save();

        return res.json({
            ok: true,
            message: 'Your recipe has been posted successfully...',
            newRecipe: newRecipe._id
        })
    } catch (e) {
        next(e);
    }
}

export const createIngredient = async (req: express.Request, res: express.Response, next: any) => {
    try {
        const {title, description, amount, image}: InterfaceIngredient = req.body;

        const newIngredient = new Ingredient({
            title, description, amount, image
        });

        await newIngredient.save();

        return res.json({
            ok: true,
            message: 'Your ingredient has been posted successfully...',
            newIngredient: newIngredient._id
        })
    } catch (e) {
        next(e);
    }
}