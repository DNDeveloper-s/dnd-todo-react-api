import express from 'express';
import isAuth from "../middleware/isAuth";

const router = express.Router();

const { respondInvite, createProject, deleteProject, getProject, inviteCollaborator, updateProject } = require('../controllers/projectController');

// These routes comes under 'auth' namespace
router.get('/project', isAuth, getProject);
router.post('/respond-invite', isAuth, respondInvite);
router.post('/create', isAuth, createProject);
router.post('/delete', isAuth, deleteProject);
router.post('/update', isAuth, updateProject);
router.post('/invite-collaborator', isAuth, inviteCollaborator);

export default router;
