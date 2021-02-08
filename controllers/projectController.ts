import * as express from 'express';
import mongoose from 'mongoose';
const createError = require('http-errors');
import Project from "../models/Project";
import User from "../models/User";
import Notification from "../models/Notification";
import Task from "../models/Task";
import Ticket from "../models/Ticket";

export const getProject = async (req: express.Request, res: express.Response, next: (error: any) => void) => {
	try {
		const {projectId} = req.query;
		const project = await Project.findById(projectId)
			.populate({
				path: 'owner',
				model: 'User',
				select: '_id fullName email image'
			})
			.populate({
				path: 'users',
				model: 'User',
				populate: {
					path: 'user',
					model: 'User',
					select: '_id fullName email image'
				}
			});
		if(!project) {
			return next(createError(404, 'Project not found!'));
		}
		const tasks = await Task.find({projectId: projectId});

		return res.json({
			type: 'success',
			message: 'Project has been fetched successfully!',
			project,
			tasksLength: tasks.length
		});
	} catch (error) {
		return next(createError(500, error.message, {errorKey: 'serverErr'}));
	}
};

export const createProject = async (req: express.Request, res: express.Response, next: (error: any) => void) => {
	try {
		const {id, color, content} = req.body;
		// @ts-ignore
		const curUserId = req.userId || '5ff5ae879539e3266439096b';
		// Creating new label by using the Mongoose Model Constructor
		const project = new Project({_id: id, color, content});
		project.users.push({user: curUserId, role: 'owner'});
		project.owner = curUserId;
		// Updating the newly created project into the user model
		const user = await User.findById(curUserId);
		user.appData.projects.push(project._id);
		// Saving Data
		await project.save();
		await user.save();
		// Finally returning the response in json form
		return res.json({
			type: 'success',
			message: 'Project created successfully.',
			projectId: project.id
		})
	} catch (error) {
		return next(createError(500, error.message, {errorKey: 'serverErr'}));
	}
};

export const updateProject = async (req: express.Request, res: express.Response, next: (error: any) => void) => {
	try {
		const {projectId, color, content, taskIds} = req.body;
		// Updating the project by finding the project by its id
		const project = await Project.findByIdAndUpdate(projectId,
			{color, content, taskIds},
			{new: true, omitUndefined: true});
		// Finally returning the response in json form
		return res.json({
			type: 'success',
			message: 'Project updated successfully.',
			project
		})
	} catch (error) {
		return next(createError(500, error.message, {errorKey: 'serverErr'}));
	}
};

export const deleteProject = async (req: express.Request, res: express.Response, next: (error: any) => void) => {
	try {
		const {projectId} = req.body;
		// Updating the project by finding the project by its id
		await Project.findByIdAndRemove(projectId);
		// Finally returning the response in json form
		return res.json({
			type: 'success',
			message: 'Project deleted successfully.',
			projectId
		})
	} catch (error) {
		return next(createError(500, error.message, {errorKey: 'serverErr'}));
	}
};

export const inviteCollaborator = async (req: express.Request, res: express.Response, next: (error: any) => void) => {
	try {
		const {projectId, toUserId} = req.body;
		// @ts-ignore
		const currentUserId = req.userId;
		const io = req.app.get('socket.io');

		const toUser = await User.findById(toUserId);
		const curUser = await User.findById(currentUserId);
		const project = await Project.findById(projectId);

		// If user is already the collaborator of the given project
		const isAlreadyCollaborator = project.users.some(c => c.user.toString() === toUserId.toString());
		if(isAlreadyCollaborator) {
				return res.json({
					type: 'error',
					// @ts-ignore
					message: `${toUser.fullName} is already the collaborator of the project ${project.content}`,
				});
		}

		// Checking if the notification has already being sent
		const doesExist = await Notification.findOne({type: 'invitation', toUserId: toUserId, fromUserId: currentUserId, data: {projectId: projectId}})
			.populate('ticket');

		console.log('[projectController.ts || Line no. 120 ....]', doesExist);
		// @ts-ignore
		if(doesExist && doesExist.ticket.active) {

			return res.json({
				type: 'error',
				// @ts-ignore
				message: `${toUser.fullName} has already been invited to the project ${project.content}`,
				// @ts-ignore
				notificationId: doesExist
			});
		}

		const ticket = new Ticket({
			active: true,
			data: {project: projectId},
			timeStamp: new Date().toISOString(),
			duration: '2d',
			owner: currentUserId,
			toUserId
		});

		const message = {
			text: " has been invited you to the project ",
			entity: [
				{index: 0, el: 'span', classes: ["highlight"], data: {user: currentUserId}},
				{index: -1, el: 'span', classes: ["highlight"], data: {project: projectId}},
			]
		};

		const notification = new Notification({
			flag: 'important',
			type: 'invitation',
			category: 'project',
			timeStamp: new Date().toISOString(),
			unread: true,
			// @ts-ignore
			message: message,
			data: {
				projectId
			},
			fromUserId: currentUserId,
			toUserId,
			ticket: ticket._id
		});

		toUser.notifications.push(notification._id);

		if(toUser.socketId) {
			io.to(toUser.socketId).emit("notification", {
				// @ts-ignore
				message: `<span class="highlight">${curUser.fullName}</span> has been invited you to the project "<span class="highlight">${project.content}</span>".`
			});
		}

		await ticket.save();
		await notification.save();
		await toUser.save();

		return res.json({
			type: 'success',
			message: 'Invitation sent successfully!',
			notificationId: notification._id
		});

	} catch (error) {
		return next(createError(500, error.message, {errorKey: 'serverErr'}));
	}
};

export const respondInvite = async (req: express.Request, res: express.Response, next: (error: any) => void) => {
	try {
		const {ticketId, isAccept} = req.body;
		// @ts-ignore
		const currentUserId = req.userId;

		const curUser = await User.findById(currentUserId);
		if(!curUser) return next(createError(404, 'User is invalid!'));

		const ticket = await Ticket.findById(ticketId);
		if(!ticket) return next(createError(404, 'Ticket is not found!'));

		const project = await Project.findById(ticket.data.project);
		if(!project) return next(createError(404, 'Project not found!'));

		if(!ticket.active) return next(createError(200, 'Ticket is not active now'));
		
		// Transferring the tasks of the projects to the invited user 
		const tasks = await Task.find({projectId: project._id});

		if(isAccept) {
			// project.users.push({
			// 	user: currentUserId,
			// 	role: 'can_view'
			// });
			await Project.findByIdAndUpdate(ticket.data.project, {
				// @ts-ignore
				users: [...project.users, {
					user: currentUserId,
					role: 'can_view'
				}]
			});
			await User.findByIdAndUpdate(currentUserId, {
				appData: {
					...curUser.appData,
					projects: [...curUser.appData.projects, project._id],
					tasks: [...curUser.appData.tasks, ...tasks],
					taskOrder: [...curUser.appData.taskOrder, ...tasks]
				}
			}, {
				upsert: true
			});
			await project.save();
		}
		ticket.active = false;
		await ticket.save();

		const message = isAccept ? 'Invitation accepted successfully!' : 'Invitation rejected successfully!';

		return res.json({
			type: 'success',
			message: message,
			isAccept,
			project
		});

	} catch (error) {
		return next(createError(500, error.message, {errorKey: 'serverErr'}));
	}
};
