import * as express from 'express';
import User from '../models/User';
import {constants} from "../helpers/constants";
const createError = require('http-errors');
const jwt = require('jsonwebtoken');

export const getCurrentUser = async (req: express.Request, res: express.Response, next: (error: any) => void) => {
    // @ts-ignore
    const curUserId = req.userId || '5ff5ae879539e3266439096b';

    try {
			const user = await User.findById(curUserId);

			if(!user) {
				return next(createError(400, 'Invalid UserId request!'));
			}

			return res.json({
				type: 'success',
				message: 'User fetched successfully!',
				user: {
					fullName: user.fullName,
					email: user.email,
					image: user.image
				}
			})
		} catch (error) {
			return next(createError(500, error.message, {errorKey: 'serverErr'}));
		}
};

export const getAppData = async (req: express.Request, res: express.Response, next: (error: any) => void) => {
		// @ts-ignore
    const curUserId = req.userId || '5ff5ae879539e3266439096b';

		try {
			// const io = req.app.get('socket.io');
			const user = await User.findById(curUserId)
				.populate({
					path: 'appData.tasks',
					populate: {
						path: 'items activities',
						populate: {
							path: 'user',
							select: 'fullName email image _id'
						}
					}
				})
				.populate({
					path: 'appData.projects',
					populate: {
						path: 'users.user',
						select: 'fullName email _id image status'
					}
				})
				.populate('appData.labels')
				.populate({
					path: 'notifications',
					model: 'Notification',
					populate: {
						path: 'fromUserId toUserId message.entity.data.project message.entity.data.user ticket',
						select: 'fullName email image _id content owner color deleted active'
					}
				});

			if(!user) {
				return next(createError(400, 'Invalid UserId request!'));
			}

			// const formTasks = user.appData.tasks.map(taskId => {})

			// io.emit('chat', {message: 'Thanks to all of you.'});

			return res.json({
				type: 'success',
				message: 'User App Data fetched successfully!',
				appData: user.appData,
				notifications: user.notifications
			});

		} catch (error) {
			return next(createError(500, error.message, {errorKey: 'serverErr'}));
		}
};

export const postAppGlobalData = async (req: express.Request, res: express.Response, next: (error: any) => void) => {
	const {global, toggleCollapse = {}} = req.body;
	const {dragFrom, taskId, expanded} = toggleCollapse;

	try {
		// @ts-ignore
		const curUserId = req.userId || '5ff5ae879539e3266439096b';

		const user = await User.findById(curUserId);

		if(!user) {
			return next(createError(400, 'Invalid UserId request!'));
		}

		user.appData.global = global;
		if(Object.keys(toggleCollapse).length > 0)
			user.appData.global.toggleCollapse[dragFrom + constants.SEPARATOR + taskId] = expanded;
		await user.save();

		return res.json({
			type: 'success',
			message: 'App Global Data posted successfully!',
			dragFrom, taskId, expanded
		});
	} catch (error) {
		return next(createError(500, error.message, {errorKey: 'serverErr'}));
	}
};

export const validateToken = async (req: express.Request, res: express.Response, next: (error: any) => void) => {
    try {
			const { token } = req.body;

			let decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY);

			if(!decodedToken) {
				return next(createError(401, 'Not authorized!'));
			}

			// Fetching user from the database
			const user = await User.findById(decodedToken.userId);

			if(!user) {
				return next(createError(401, 'Not authorized!'));
			}

			return res.json({
			    type: 'success',
			    message: 'Token is validated successfully!',
			    info: {
			    	_id: user._id,
						fullName: user.fullName,
						email: user.email,
						image: user.image
					}
			});

		} catch (error) {
			return next(createError(500, error.message, {errorKey: 'serverErr'}));
		}
};

export const handleUserSearch = async (req: express.Request, res: express.Response, next: (error: any) => void) => {
    const {value} = req.body;
	// @ts-ignore
    const currentUserId = req.userId;

    try {
    	if(value.trim().length === 0) {
				return res.json({
					type: 'success',
					message: 'Users searching have been done!',
					users: []
				})
			}
			const users = await User.find({
					$or: [{fullName: {$regex: value, $options: 'i'}}, {email: {$regex: value, $options: 'i'}}],
					$and: [{_id: {$ne: currentUserId}}]
			})
				.limit(10)
				.select(['fullName', 'image', 'email']);

			return res.json({
				type: 'success',
				message: 'Users searching have been done!',
				users
			});

		} catch (error) {
			return next(createError(500, error.message, {errorKey: 'serverErr'}));
		}
};

export const getNotifications = async (req: express.Request, res: express.Response, next: (error: any) => void) => {
	// @ts-ignore
	const curUserId = req.userId || '5ff5ae879539e3266439096b';
	try {
		const user = await User.findById(curUserId)
			.populate({
				path: 'notifications',
				model: 'Notification',
				populate: {
					path: 'fromUserId toUserId message.entity.data.project message.entity.data.user ticket',
					select: 'fullName email image _id content owner color deleted active'
				}
			});

		if(!user) {
			return next(createError(404, 'User not found!'));
		}

		return res.json({
		    type: 'success',
		    message: 'Notifications fetched successfully',
		    notifications: user.notifications
		});

	} catch (error) {
			return next(createError(500, error.message, {errorKey: 'serverErr'}));
	}
};

export const updateNotificationStatus = async (req: express.Request, res: express.Response, next: (error: any) => void) => {
  try {
    const {notificationIds} = req.body;
  } catch (error) {
    return next(createError(500, error.message, {errorKey: 'serverErr'}));
  }
};
