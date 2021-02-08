import express from 'express';
import isAuth from "../middleware/isAuth";

const router = express.Router();

const { createTask, createTaskItem, dropTask, getTask, onDropTaskItem, updateTask, updateTaskItem } = require('../controllers/taskController');

// These routes comes under 'task' namespace
router.get('/get', isAuth, getTask);
router.post('/create', isAuth, createTask);
router.post('/drop', isAuth, dropTask);
router.post('/update', isAuth, updateTask);
router.post('/create-task-item', isAuth, createTaskItem);
router.post('/update-task-item', isAuth, updateTaskItem);
router.post('/drop-task-item', isAuth, onDropTaskItem);

export default router;
