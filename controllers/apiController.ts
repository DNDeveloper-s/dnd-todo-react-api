import * as express from 'express';
import User from '../models/User';
import {constants} from "../helpers/constants";
// import MessagingResponse from "twilio/lib/twiml/MessagingResponse";
// import {createWaTask} from "./taskController";
import createError from 'http-errors';
import jwt from 'jsonwebtoken';
// import nodemailer from 'nodemailer';

// const transporter = nodemailer.createTransport({
// 	service: 'gmail',
// 	auth: {
// 		user: 'noreply.dndtodo@gmail.com',
// 		pass: 'dndtodoapp'
// 	}
// });

// const mailOptions = {
// 	from: 'noreply.dndtodo@gmail.com',
// 	to: 'saurs2000@gmail.com',
// 	subject: 'DND-Todo Reminder',
// 	text: 'Do this task related to the time right now!'
// };

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

// export const replyToTwilo = async(req: express.Request, res: express.Response, next: (error: any) => void) => {
// 	// const client = require('twilio')();
// 	// client.messages.create({
// 	// 	from: 'whatsapp:+14155238886',
// 	// 	to: 'whatsapp:+919319825600',
// 	// 	body: 'Hello DNDeveloper,	q from the DND-Todo app.'
// 	// }).then(c => console.log('[apiController.ts || Line no. 223 ....]', c.sid))
// 	// 	.catch(e => console.log('[apiController.ts || Line no. 224 ....]', e));


// 	const twiml = new MessagingResponse();
// 	console.log('[app.ts || Line no. 89 ....]', req.body);
// 	// @ts-ignore
// 	const message = twiml.message();
// 	const user = await User.findOne({'waNumber': req.body.WaId});

// 	// Handling the case where
// 	// the whatsapp number is not attached with any account
// 	if(!user) {
// 		let str = `Hey ${req.body.ProfileName}, No user has been attached with this number to the DND-Todo app
// https://bfacf9d4576a.ngrok.io`;

// 		message.body(str);
// 		// message.body('Task *' + req.body.Body + '* has been added successfully!');
// 		// message.media('https://demo.twilio.com/owl.png');
// 		res.writeHead(200, {'Content-Type': 'text/xml'});
// 		return res.end(twiml.toString());
// 	}

// 	// Handling the case where
// 	// the plugin whatsapp is not enabled
// 	if(!user.appData.global.plugins?.whatsApp?.isEnabled) {
// 		let str = `Hey ${req.body.ProfileName}, You are not subscribed to our app.
// Please login to dnd-todo-app using the following url
// https://bfacf9d4576a.ngrok.io`;

// 		message.body(str);
// 		// message.body('Task *' + req.body.Body + '* has been added successfully!');
// 		// message.media('https://demo.twilio.com/owl.png');
// 		res.writeHead(200, {'Content-Type': 'text/xml'});
// 		return res.end(twiml.toString());
// 	}

// // 	user.appData.tasks.forEach((task, ind) => {
// // 		str += `
// // *${ind+1}*. _${task.content.trim()}_ ☑️`;
// // 	});

// 	const taskId = await createWaTask(req.body.Body, user._id, req);
// 	// console.log('[apiController.ts || Line no. 273 ....]', taskId);

// 	let str = `Hey ${req.body.ProfileName},`;
// 	str += `
// Task *${req.body.Body}* has been added successfully
// Task Link: https://08f978528e68.ngrok.io/app/inbox/tasks/${taskId}`;

// 	message.body(str);
// 	// message.body('Task *' + req.body.Body + '* has been added successfully!');
// 	// message.media('https://demo.twilio.com/owl.png');
// 	res.writeHead(200, {'Content-Type': 'text/xml'});
// 	res.end(twiml.toString());
// };
