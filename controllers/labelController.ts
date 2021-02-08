import * as express from 'express';
const createError = require('http-errors');
import Label from "../models/Label";
import User from "../models/User";
import Project from "../models/Project";

export const createLabel = async (req: express.Request, res: express.Response, next: (error: any) => void) => {
	try {
		const {id, taskIds, color, content} = req.body;
		// @ts-ignore
		const curUserId = req.userId || '5ff5ae879539e3266439096b';
		// Creating new label by using the Mongoose Model Constructor
		const label = new Label({_id: id, taskIds, color, content});
		// Updating the newly created label into the user model
		const user = await User.findById(curUserId);
		user.appData.labels.push(label._id);
		// Saving Data
		await label.save();
		await user.save();
		// Finally returning the response in json form
		return res.json({
			type: 'success',
			message: 'Label created successfully.',
			labelId: label._id
		})
	} catch (error) {
		return next(createError(500, error.message, {errorKey: 'serverErr'}));
	}
};

export const updateLabel = async (req: express.Request, res: express.Response, next: (error: any) => void) => {
	try {
		const {labelId, color, content} = req.body;
		// Updating the label by finding the label by its id
		const label = await Label.findByIdAndUpdate(labelId,
			{color: color, content: content},
			{new: true, omitUndefined: true});
		// Finally returning the response in json form
		return res.json({
			type: 'success',
			message: 'Label updated successfully.',
			label
		})
	} catch (error) {
		return next(createError(500, error.message, {errorKey: 'serverErr'}));
	}
};
