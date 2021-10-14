const express = require('express');
const { body } = require('express-validator');

const router = express.Router();

const { postSignup, postLogin, sendVerificationCode, verifyCode } = require('../controllers/authController');

// These routes comes under 'auth' namespace
router.post('/signup',
  // username must be an email
  body('fullName')
		.trim()
    .isLength({ min: 5 })
    .withMessage('Full Name must be at least 5 characters'),
  // email must be an email
  body('email')
		.trim()
    .isEmail()
    .withMessage('Invalid Email'),
  // password must be at least 5 chars long
  body('password')
		.trim()
    .isLength({min: 8})
    .withMessage('Must have at least 8 digits')
    .matches(/\d/)
    .withMessage('Must contain at least a number')
		.matches(/[A-Z]/)
		.withMessage('Must contain at least one Uppercase letter')
		.matches(/[-+_!@#$%^&*.,?]/)
		.withMessage('Must contain one of these [-+_!@#$%^&*.,?]'),
  body('con_password')
		.trim()
		.custom((value: any, {req}: any) => {
			if(value !== req.body.password) {
				throw new Error('Confirm Password doesn\'t match');
			}

			return true;
		}),
  postSignup);

router.post('/login',
	// email must be an email
	body('email')
		.trim()
		.isEmail()
		.withMessage('Invalid Email'),
	postLogin);

router.post('/send-code',
	// email must be an email
	body('email')
		.trim()
		.isEmail()
		.withMessage('Invalid Email'),
	sendVerificationCode);

router.post('/verify-code',
	// email must be an email
	body('token')
		.trim()
		.isLength({ min: 6, max: 6 })
		.withMessage('Code must be of 6 characters'),
	verifyCode);

export default router;
