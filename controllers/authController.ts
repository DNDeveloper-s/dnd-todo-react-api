import * as express from 'express';
import User from '../models/User';
const bcrypt = require('bcrypt');
const createError = require('http-errors');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');


module.exports.postSignup = async (req: express.Request, res: express.Response, next: (error: any) => void) => {
    const { fullName, email, password } = req.body;

    try {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return next(createError(401, errors.errors[0].msg, {errorKey: errors.errors[0].param}));
        }

        const hashedPw = await bcrypt.hash(password, 12);

        // Fetching user
        // Checking if user is already exists
        let user = await User.findOne({email});

        if(user) {
            return next(createError(401, 'User with the email already exists', {errorKey: 'email'}));
        }

        user = new User({
            fullName, 
            email, 
            password: hashedPw,
            image: '/assets/images/default.jpg'
        });

        await user.save();

        return res.json({
            type: 'success',
            message: 'User registered successfully.',
            user: {
                fullName,
                email
            }
        })
    } catch (error) {
        return next(createError(500, error.message, {errorKey: 'serverErr'}));
    }
};

module.exports.postLogin = async (req: express.Request, res: express.Response, next: (error: any) => void) => {
    const { email, password } = req.body;

    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return next(createError(401, errors.errors[0].msg, {errorKey: errors.errors[0].param}));
        }

        const user = await User.findOne({email});
        
        if(!user) {
            return next(createError(401, 'User with the email not found!', {errorKey: 'email'}));
        }

        const doMatch = await bcrypt.compare(password, user.password);

        if(!doMatch) {
            return next(createError(401, 'Password doesn\'t match', {errorKey: 'password'}));
        }


        const token = jwt.sign({
                userId: user._id.toString(),
                email: user.email
            },                  // Data passed with the token
          process.env.JWT_SECRET_KEY,      // Secret key
            { expiresIn: '2312h'}  // Expiration time 
        );

        return res.json({
            type: 'success',
            message: 'Logged in successfully',
            token: token,
            userId: user._id.toString()
        });

    } catch (e) {
        return next(createError(500, e.message, {errorKey: 'serverErr'}));
    }
}
