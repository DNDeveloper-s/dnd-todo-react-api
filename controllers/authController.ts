import * as express from 'express';
import User from '../models/User';
import VerifyEmail from "../models/VerifyEmail";
const bcrypt = require('bcrypt');
const createError = require('http-errors');
const jwt = require('jsonwebtoken');
const main = require('../mail');
import { authenticator, totp } from 'otplib';
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

        if(typeof password !== 'string' || password.length === 0) return next(createError(401, 'Make sure to enter the correct password!', {errorKey: 'password'}));
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

module.exports.sendVerificationCode = async (req: express.Request, res: express.Response, next: (error: any) => void) => {
    const { email } = req.body;

    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return next(createError(401, errors.errors[0].msg, {errorKey: errors.errors[0].param}));
        }

        // Checking if user is already exists
        let user = await User.findOne({email});

        if(user) {
            return next(createError(401, 'User with the email already exists', {errorKey: 'email'}));
        }

        const secret = authenticator.generateSecret();
        const token = totp.generate(secret);

        main(email, token).catch((e) => {
            console.log('Line no. 109', e);
            return next(createError(500, e.message, {errorKey: 'serverErr'}));
        });

        // Checking for any preexisting
        const isExist = await VerifyEmail.findOne({email});
        if(isExist) await VerifyEmail.findByIdAndRemove(isExist._id);

        const verifyEmailDB = new VerifyEmail({
            email,
            token
        });

        await verifyEmailDB.save();

        return res.json({
            type: 'success',
            message: 'Code sent successfully!',
            email,
        });

    } catch (e) {
        console.log('Line no. 131', e);
        return next(createError(500, e.message, {errorKey: 'serverErr'}));
    }
}



module.exports.verifyCode = async (req: express.Request, res: express.Response, next: (error: any) => void) => {
    const { email, token } = req.body;

    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return next(createError(401, errors.errors[0].msg, {errorKey: errors.errors[0].param}));
        }

        // Checking for any preexisting
        const isExist = await VerifyEmail.findOne({email});
        if(!isExist) return next(createError(500, 'Try to send the code again!'));

        const isValid = isExist.token == token;

        if(!isValid) return next(createError(500, 'Code is incorrect!'));

        await VerifyEmail.findByIdAndRemove(isExist._id);

        return res.json({
            type: 'success',
            message: 'Email verified successfully!',
            email
        });

    } catch (e) {
        console.log('Line no. 131', e);
        return next(createError(500, e.message, {errorKey: 'serverErr'}));
    }
}
