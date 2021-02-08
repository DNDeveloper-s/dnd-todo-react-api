import express from 'express';
import isAuth from "../middleware/isAuth";

const router = express.Router();

const { createLabel, updateLabel } = require('../controllers/labelController');

// These routes comes under 'auth' namespace
router.post('/create', isAuth, createLabel);
router.post('/update', isAuth, updateLabel);

export default router;
