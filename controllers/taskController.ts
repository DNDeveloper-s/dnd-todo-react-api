import * as express from 'express';
import mongoose from 'mongoose';
import User from "../models/User";
import Task from "../models/Task";
import {constants} from "../helpers/constants";
import Project from "../models/Project";
import Activity, {ActivityInterface} from "../models/Activity";
import TaskItem from "../models/TaskItem";
import {isDefined} from "../helpers/utils";

const createError = require('http-errors');

export const createTask = async (req: express.Request, res: express.Response, next: (error: any) => void) => {
	try {
		const {
			id,
			priority,
			deleted,
			isFullDay,
			projectId,
			labelIds,
			status,
			content,
			createType,
			startDate,
			inItemMode,
			items,
			childTasks,
			parentTask,
			reminders,
		} = req.body;
		const createdAt = new Date().toISOString();
		// @ts-ignore
		const curUserId = req.userId || '5ff5ae879539e3266439096b';
		// Creating new task by using the Mongoose Model Constructor
		// return res.json({
		// 	type: 'error',
		// 	message: 'This is just testing error. Nothing wrong in serious'
		// });
		const taskId = mongoose.Types.ObjectId(id);

		const newTaskObj = {
			_id: taskId,
			priority,
			deleted,
			isFullDay,
			projectId,
			labelIds,
			status,
			content,
			startDate,
			inItemMode,
			items,
			childTasks,
			parentTask,
			reminders,
			createdAt,
			creator: curUserId,
			subscribers: []
		};
		// Updating the newly created task into the user model
		const user = await User.findById(curUserId);

		// Case 1. If task has been added without any reference
		// so it will be added just to the top of the array in the top level
		if (!createType) {
			user.appData.taskOrder.splice(0, 0, id);
		}

		// Case 2. If added as some extra info
		// like creating task with a reference
		// of its sibling or child
		if (createType) {
			const { path, as } = createType;
			// Here "path" is the tree path of the reference task
			// eg: ["task-1", "task-2"] is "path"
			// and "as" is the relation with the reference task
			// child or sibling
			// refTask is just the reference task
			// and grabbing the refTaskId from the path
			// its the last item in the path array
			const refTask = await Task.findById(path[path.length - 1]);
			if(!refTask) {
				return next(createError(500, 'Reference Task is undefined', {errorKey: 'serverErr'}));
			}

			// Case 1. If added as sibling
			if (as === constants.AS_SIBLING) {
				// In case of sibling
				// There are two cases also

				// Case 1. When the reference task lies on the top level
				// Hence refTask won't have any parent task
				// @ts-ignore
				if (!refTask.parentTask) {
					// Get the index of the reference task on the top level [taskOrder]
					const refIndex = user.appData.taskOrder.findIndex((c) => c.toString() === refTask._id.toString());

					// and then add the newTask after the index of refTask to the top level [taskOrder]
					// Adding next to the refIndex, so adding "1"
					user.appData.taskOrder.splice(refIndex + 1, 0, newTaskObj._id.toString());
				}

				// Case 2. When the reference task lies somewhere in the inner level
				// @ts-ignore
				if (refTask.parentTask) {
					// Get the parent task of the reference task
					// @ts-ignore
					const parentOfRefTask = await Task.findById(refTask.parentTask);
					if(!parentOfRefTask) {
						return next(createError(500, 'Parent of Reference Task is undefined', {errorKey: 'serverErr'}));
					}

					// And get the index of the reference task
					// @ts-ignore
					const refTaskIndex = parentOfRefTask.childTasks.findIndex(
						(c) => c.toString() === refTask._id.toString()
					);

					// and then add the newTask to the parentTasks's childTasks array
					// after the index of reference task
					// Adding next to the refIndex, so adding "1"
					// @ts-ignore
					parentOfRefTask.childTasks.splice(
						refTaskIndex + 1,
						0,
						newTaskObj._id
					);

					// Update the parent task
					newTaskObj.parentTask = parentOfRefTask._id;

					// Saving ParentOfRefTask
					await parentOfRefTask.save();
				}
			}

			// Case 2. If added as child
			if (as === constants.AS_CHILD) {
				// Here, its so simple as we don't need to get any index to add
				// So, just add the newTask to top of the refTask's childTasks array
				// @ts-ignore
				refTask.childTasks.splice(0, 0, newTaskObj._id);

				// And Yes,
				// Update the parent task
				newTaskObj.parentTask = refTask._id;
			}

			// Saving RefTask
			await refTask.save();
		}

		const task = new Task(newTaskObj);

		// Saving Data
		user.appData.tasks.push(taskId);

		// Tracking Activity
		// const message = {
		// 	text: " created the Task ",
		// 	entity: [
		// 		{index: 0, el: 'span', classes: ["highlight-blue"], key: 'user', data: {user: curUserId}},
		// 	]
		// };
		// const activityObj = {
		// 	key: 'task',
		// 	type: 'createTask',
		// 	task: taskId,
		// 	message: message,
		// 	timeStamp: new Date().toISOString(),
		// };
		//
		// const activity = new Activity(activityObj);
		// task.activities.push(activity._id);

		// await activity.save();
		await task.save();
		await user.save();

		// Sending it to all the collaborators if it is related to the project
		await sendSubscriptionToUsers(req, res, next, {projectId, taskId, excludeOwner: true}, async (userData, io) => {
			const user = await User.findById(userData.user._id);
			user.appData.tasks.push(taskId);
			if (!createType) {
				user.appData.taskOrder.splice(0, 0, taskId);
			}
			await user.save();
			if(user.socketId)
				io.to(user.socketId).emit('task_created', {projectId, taskId});
		});

		// Finally returning the response in json form
		return res.json({
			type: 'success',
			message: 'Task created successfully.',
			taskId: task._id
		});
	} catch (error) {
		return next(createError(500, error.message, {errorKey: 'serverErr'}));
	}
};

export const createWaTask = async (content, curUserId, req) => {
	const user = await User.findById(curUserId);
	const newTaskObj = {
		priority: 0,
		deleted: 0,
		isFullDay: true,
		projectId: null,
		labelIds: [],
		status: {completed: false, prevColumnId: "2"},
		content,
		inItemMode: false,
		childTasks: [],
		parentTask: null,
		createdAt: new Date().toISOString(),
		creator: curUserId,
		subscribers: []
	};

	const task = new Task(newTaskObj);

	// Saving Data
	user.appData.tasks.push(task._id);
	user.appData.taskOrder.splice(0, 0, task._id);
	await task.save();
	await user.save();

	// Sending it to all the collaborators if it is related to the project
	const io = req.app.get('socket.io');
	io.to(user.socketId).emit('task_created', {taskId: task._id});

	return task._id;
}

function omitUndefined(obj: object): object {
	const resObj = {};
	for(let key in obj) {
		if(obj.hasOwnProperty(key) && obj[key] !== undefined) {
			resObj[key] = obj[key];
		}
	}
	return resObj;
}

function objectString(obj: object): string {
	let str = '';
	for(let key in obj) {
		if(obj.hasOwnProperty(key) && obj[key] !== undefined) {
			str += `${key}=${obj[key]}&`
		}
	}
	return str.slice(0, -1);
}

/**
 *
 * @param req
 * @param res
 * @param next
 * @param projectId
 * @param excludeOwner
 * @param taskId
 * @param cb
 */

async function sendSubscriptionToUsers(req, res, next, {projectId, taskId, excludeOwner}, cb) {

	const curUserId = req.userId;
	// Sending it to all the collaborators if it is related to the project
	if(projectId) {
		const project = await Project.findById(projectId);
		const io = req.app.get('socket.io');
		if(project) {
			for(let i = 0; i < project.users.length; i++) {
				const userData = project.users[i];
				if((excludeOwner && userData.user._id.toString() !== curUserId.toString()) || !excludeOwner) {
					await cb(userData, io);
				}
			}
		}
	}
}

export const updateTask = async (req: express.Request, res: express.Response, next: (error: any) => void) => {
	try {
		const {
			taskId,
			priority,
			isFullDay,
			projectId,
			labelIds,
			status,
			content,
			startDate,
			inItemMode,
			deleted,
			childTasks,
			parentTask,
			reminders,
			createdAt,
		} = req.body;

		// @ts-ignore | Current User id
		const curUserId = req.userId || '5ff5ae879539e3266439096b';

		const updatedObj = {
			priority,
			isFullDay,
			projectId,
			labelIds,
			deleted,
			status,
			content,
			startDate,
			inItemMode,
			childTasks,
			parentTask,
			reminders,
			createdAt,
		};

		let task = await Task.findById(taskId);
		const curUser = await User.findById(curUserId);

		// Tracking Activity
		const updatedObjWithOutUndefined = omitUndefined(updatedObj);
		function oldObj(obj) {
			const res = {};
			for(let key in obj) {
				if(obj.hasOwnProperty(key)) {
					res[key] = task[key];
				}
			}
			return res;
		}
		const activityObj = {
			type: 'updateTask',
			key: 'task user',
			task: taskId,
			updatedData: objectString(updatedObjWithOutUndefined),
			oldData: objectString(oldObj(updatedObjWithOutUndefined)),
			user: curUserId,
			timeStamp: new Date().toISOString(),
		};

		// Switching task between projects
		// Case 1. Moving from the highest level taskOrder
		// In this case we don't need to anything special
		// Case 2. Moving from the lower level
		if (task.parentTask && projectId) {
			// Here, We need to do one thing before moving to new project
			// 1. Add the task to taskOrder
			// Adding it in the subscription of webSockets

			// 2. Remove the task from the parent's childTasks array
			const parentTask = await Task.findById(task.parentTask);
			// a. firstly getting the index of taskId in the parentTask's childTasks  Array
			const indexOfTask = parentTask.childTasks.findIndex(
				(c) => c === taskId
			);
			// b. now, its time to splice [remove] from the array
			parentTask.childTasks.splice(indexOfTask, 1);

			// 3. Update the parentTask of the task
			task.parentTask = null;

			await parentTask.save();
			await task.save();
		}

		if(projectId) {
			// This will happen no matter what eventually
			await moveToProjectRecursively(taskId);
			async function moveToProjectRecursively(taskId) {
				const curTask = await Task.findByIdAndUpdate(taskId, {projectId}, {new: true, omitUndefined: true});
				for(let childId of curTask.childTasks) {
					await moveToProjectRecursively(childId);
				}
			}
		} else {
			// Updating the task by finding the task by its id
			task = await Task.findByIdAndUpdate(taskId, {...updatedObj, updatedAt: new Date().toISOString()}, {new: true, omitUndefined: true});
		}

		// Deleting Items if task is coming off inItemMode
		if(isDefined(inItemMode) && !inItemMode) {
			for(let item of task.items) {
				await TaskItem.findByIdAndDelete(item);
			}
			task.items = [];
		}

		// Saving Activity Object
		const activity = new Activity(activityObj);
		task.activities.push(activity._id);

		await activity.save();
		await task.save();

		// @ts-ignore
		await sendSubscriptionToUsers(req, res, next, {projectId: task.projectId, taskId}, async (userData, io) => {
			const user = await User.findById(userData.user._id);
			console.log('[taskController.ts || Line no. 250 ....]', task);
			if (task.parentTask && projectId) {
				// Here, We need to do one thing before moving to new project
				// 1. Add the task to taskOrder
				user.appData.taskOrder.splice(0, 0, taskId);
				await user.save();
			}
			if(user.socketId) { // @ts-ignore
				io.to(user.socketId).emit('task_updated', {projectId: task.projectId, taskId});
			}
		});

		// Finally returning the response in json form
		return res.json({
			type: 'success',
			message: 'Task updated successfully.',
			task
		});
	} catch (error) {
		return next(createError(500, error.message, {errorKey: 'serverErr'}));
	}
};

export const dropTask = async (req: express.Request, res: express.Response, next: (error: any) => void) => {
	try {
		const {
			source,
			destination: dest,
			dropAsType,
			dragFrom,
		} = req.body;

		// @ts-ignore
		const curUserId = req.userId || '5ff5ae879539e3266439096b';

		console.log(source, dest, dropAsType, dragFrom);
		const draggedId = source.id;
		const droppedId = dest.id;

		async function addToInnerLevel() {
			// Adding to Inner Level
			// 1. Adding to Child Tasks
			const droppedToParentId = dest.path[dest.path.length - 2];
			const droppedToParentTask = await Task.findById(droppedToParentId);
			if(!droppedToParentTask) {
				return next(createError(500, 'Dropped to Parent Task is undefined', {errorKey: 'serverErr'}));
			}
			// @ts-ignore
			const droppedIndex = droppedToParentTask.childTasks.findIndex((c) => c.toString() === dest.id);
			// @ts-ignore
			droppedToParentTask.childTasks.splice(
				droppedIndex + 1,
				0,
				draggedId
			);
			// 2. Updating the expand Count
			// const poppedDestPath = [...dest.path];
			// poppedDestPath.pop();
			// console.log(poppedDestPath);
			// poppedDestPath.forEach((destId) => {
			//   state.tasks[destId].expandCount +=
			//     state.tasks[draggedId].expandCount + 1;
			// });
			// 3. Updating the parent task
			const draggedTask = await Task.findById(draggedId);
			if(!draggedTask) {
				return next(createError(500, 'Dragged task is undefined', {errorKey: 'serverErr'}));
			}
			// @ts-ignore
			draggedTask.parentTask = droppedToParentId;

			// Saving both the task
			await droppedToParentTask.save();
			await draggedTask.save();
		}

		async function removeFromInnerLevel() {
			// Removing from Inner Level
			const draggedFromParentId = source.path[source.path.length - 2];
			const draggedFromParentTask = await Task.findById(draggedFromParentId);
			if(!draggedFromParentTask) {
				return next(createError(500, 'Dragged from Parent Task is undefined', {errorKey: 'serverErr'}));
			}
			// @ts-ignore
			const draggedIndex = draggedFromParentTask.childTasks.findIndex(
				(c: any) => c.toString() === draggedId
			);
			// @ts-ignore
			draggedFromParentTask.childTasks.splice(draggedIndex, 1);
			// 2. Updating the expand Count
			// const poppedSrcPath = [...source.path];
			// poppedSrcPath.pop();
			// console.log(poppedSrcPath);
			// poppedSrcPath.forEach((srcId) => {
			//   state.tasks[srcId].expandCount -=
			//     state.tasks[draggedId].expandCount + 1;
			// });
			// Saving the task
			await draggedFromParentTask.save();
		}

		// Case 1 - Moving inside Top Level
		if (source.path.length === 1 && dest.path.length === 1) {
			// Fetching the user appData
			const user = await User.findById(curUserId);
			if(!user) {
				return next(createError(500, 'Invalid UserId Request!', {errorKey: 'serverErr'}));
			}
			// Removing Part
			// Removing from taskOrder
			const draggedIndex = user.appData.taskOrder.findIndex(
				(c) => c.toString() === draggedId
			);
			user.appData.taskOrder.splice(draggedIndex, 1);

			// Adding Part
			if (dropAsType === constants.AS_SIBLING) {
				const droppedIndex = user.appData.taskOrder.findIndex(
					(c) => c.toString() === droppedId
				);
				user.appData.taskOrder.splice(droppedIndex + 1, 0, draggedId);
			}

			// Saving it to the appData
			await user.save();
		}

		// Case 2 - Moving from Top Level to Inner Level
		else if (source.path.length === 1 && dest.path.length >= 2) {
			// Fetching the user appData
			const user = await User.findById(curUserId);
			if(!user) {
				return next(createError(500, 'Invalid UserId Request!', {errorKey: 'serverErr'}));
			}
			// Removing Part
			// Removing from taskOrder
			const draggedIndex = user.appData.taskOrder.findIndex(
				(c) => c.toString() === draggedId
			);
			user.appData.taskOrder.splice(draggedIndex, 1);

			// Adding Part
			if (dropAsType === constants.AS_SIBLING) {
				await addToInnerLevel();
			}

			// Saving it to the appData
			await user.save();
		}

		// Case 3 - Moving from Inner Lever to Top Level
		else if (source.path.length >= 2 && dest.path.length === 1) {
			// Fetching the user appData
			const user = await User.findById(curUserId);
			if(!user) {
				return next(createError(500, 'Invalid UserId Request!', {errorKey: 'serverErr'}));
			}

			// Removing Part
			await removeFromInnerLevel();

			// Adding Part
			if (dropAsType === constants.AS_SIBLING) {
				// Adding to Top Level
				// 1. Adding to Task Order
				const droppedIndex = user.appData.taskOrder.findIndex(
					(c) => c.toString() === droppedId
				);
				user.appData.taskOrder.splice(droppedIndex + 1, 0, draggedId);

				// 2. Updating the parent task
				const draggedTask = await Task.findById(draggedId);
				if(!draggedTask) {
					return next(createError(500, 'Dragged task is undefined', {errorKey: 'serverErr'}));
				}
				// @ts-ignore
				draggedTask.parentTask = null;
				// Saving the Task
				await draggedTask.save();
				// Saving it to the appData
				await user.save();
			}
		}

		// Case 4 - Moving inside Inner Level
		else if (source.path.length >= 2 && dest.path.length >= 2) {
			// Removing Part
			await removeFromInnerLevel();

			// Adding Part
			if (dropAsType === constants.AS_SIBLING) {
				// Adding to Inner Level
				await addToInnerLevel();
			}
		}

		// Handling case for dropping as child
		if (dropAsType === constants.AS_CHILD) {
			// Adding to childTasks array
			const droppedToParentId = dest.path[dest.path.length - 1];
			const droppedToParentTask = await Task.findById(droppedToParentId);
			if(!droppedToParentTask) {
				return next(createError(500, 'Dropped to Parent Task is undefined', {errorKey: 'serverErr'}));
			}
			// @ts-ignore
			droppedToParentTask.childTasks.splice(0, 0, draggedId);
			// 2. Updating the expand Count
			// const poppedDestPath = [...dest.path];
			// console.log(poppedDestPath);
			// poppedDestPath.forEach((destId) => {
			//   state.tasks[destId].expandCount +=
			//     state.tasks[draggedId].expandCount + 1;
			// });
			// 3. Updating the parent task
			const draggedTask = await Task.findById(draggedId);
			if(!draggedTask) {
				return next(createError(500, 'Dragged task is undefined', {errorKey: 'serverErr'}));
			}
			// @ts-ignore
			draggedTask.parentTask = droppedToParentId;

			// Saving both the task
			await droppedToParentTask.save();
			await draggedTask.save();
		}

		return res.json({
			type: 'success',
			message: 'Task dropped successfully!'
		});

	} catch (error) {
		return next(createError(500, error.message, {errorKey: 'serverErr'}));
	}

};

// TODO: Validate to get the task
export const getTask = async (req: express.Request, res: express.Response, next: (error: any) => void) => {
  try {
    const {taskId} = req.query;
    // @ts-ignore
		// const curUserId = req.userId;
		const task = await Task.findById(taskId)
			.populate({
				path: 'items activities',
				populate: {
					path: 'user',
					select: 'fullName email image _id'
				}
			});

		if(!task) {return next(createError(404, 'Task not found!'))}

		return res.json({
		  type: 'success',
		  message: 'Task fetched successfully!',
		  task
		});

  } catch (error) {
    return next(createError(500, error.message, {errorKey: 'serverErr'}));
  }
};

export const onDropTaskItem = async (req: express.Request, res: express.Response, next: (error: any) => void) => {
  try {
    const {
			taskId, draggedId, droppedId
		} = req.body;

		const curTask = await Task.findById(taskId);
		const curTaskItem = curTask.items.find((c) => c === draggedId);
		// Removing the dragged id from its initial position
		// Finding the index of the draggedId in array
		const draggedIndex = curTask.items.findIndex((c) => c === draggedId);
		curTask.items.splice(draggedIndex, 1);
		// Now its time to add it to the new place in the array
		// Finding the index of the droppedId in arrau
		// to be placed after the item
		const droppedIndex = curTask.items.findIndex((c) => c === droppedId);
		curTask.items.splice(droppedIndex + 1, 0, curTaskItem);

    await curTask.save();

		// @ts-ignore
		await sendSubscriptionToUsers(req, res, next, {projectId: curTask.projectId, taskId}, async (userData, io) => {
			const user = await User.findById(userData.user._id);
			if(user.socketId) { // @ts-ignore
				io.to(user.socketId).emit('task_updated', {projectId: curTask.projectId, taskId});
			}
		});

    return res.json({
      type: 'success',
      message: 'Task Item dropped successfully!',
      task: curTask
    });

  } catch (error) {
    return next(createError(500, error.message, {errorKey: 'serverErr'}));
  }
};

export const createTaskItem = async (req: express.Request, res: express.Response, next: (error: any) => void) => {
  try {
		const {itemId, taskId, items, createAfterItemId, content, status} = req.body;

		const curTask = await Task.findById(taskId);

		if(items) {
			for(let item of items) {
				const taskItem = new TaskItem({
					_id: item.id,
					id: item.id,
					content: item.content,
					status: item.status
				});
				curTask.items.push(item.id);
				curTask.inItemMode = true;
				await taskItem.save();
			}

		} else {
			const taskItem = new TaskItem({
				_id: itemId,
				id: itemId,
				content: content || '',
				status
			});

			if (!createAfterItemId) {
				curTask.items.push(itemId);
			} else {
				const createAfterItemIdIndex = curTask.items.findIndex(c => c === createAfterItemId);
				curTask.items.splice(createAfterItemIdIndex + 1, 0, itemId);
			}

			await taskItem.save();
		}

		await curTask.save();

		// @ts-ignore
		await sendSubscriptionToUsers(req, res, next, {projectId: curTask.projectId, taskId}, async (userData, io) => {
			const user = await User.findById(userData.user._id);
			if(user.socketId) { // @ts-ignore
				io.to(user.socketId).emit('task_updated', {projectId: curTask.projectId, taskId});
			}
		});

		return res.json({
			type: 'success',
			message: 'Task Item created successfully!',
		});

  } catch (error) {
    return next(createError(500, error.message, {errorKey: 'serverErr'}));
  }
};

export const updateTaskItem = async (req: express.Request, res: express.Response, next: (error: any) => void) => {
  try {
    const {itemId, taskId, status, content, completedAt} = req.body;

		const curTask = await Task.findById(taskId);
    const taskItem = await TaskItem.findByIdAndUpdate(itemId, {status, content, completedAt}, {new: true, omitUndefined: true});

		// @ts-ignore
		await sendSubscriptionToUsers(req, res, next, {projectId: curTask.projectId, taskId}, async (userData, io) => {
			const user = await User.findById(userData.user._id);
			if(user.socketId) { // @ts-ignore
				io.to(user.socketId).emit('task_updated', {projectId: curTask.projectId, taskId});
			}
		});

    return res.json({
      type: 'success',
      message: 'Task Item updated successfully!',
      taskItem
    });
  } catch (error) {
    return next(createError(500, error.message, {errorKey: 'serverErr'}));
  }
};
