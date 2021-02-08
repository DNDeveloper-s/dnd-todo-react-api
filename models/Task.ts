import mongoose, {Document, Model, MongooseFilterQuery, Types} from 'mongoose';
import {UserInterface} from "./User";
import {ProjectInterface} from "./Project";
import {ActivityInterface} from "./Activity";
import {LabelInterface} from "./Label";
import {TaskItemInterface} from "./TaskItem";
const Schema = mongoose.Schema;

const taskSchema = new Schema({
    priority: Number,
    deleted: Number,
    isFullDay: Boolean,
    projectId: {
        type: Schema.Types.ObjectId,
        ref: 'Project'
    },
    labelIds: [{
        type: Schema.Types.ObjectId,
        ref: 'Label'
    }],
    status: {
        completed: Boolean,
        prevColumnId: String
    },
    activities: [{
        type: Schema.Types.ObjectId,
        ref: 'Activity'
    }],
    content: String,
    startDate: String,
    inItemMode: Boolean,
    items: [{
        type: Schema.Types.ObjectId,
        ref: 'TaskItem'
    }],
    childTasks: [{
        type: Schema.Types.ObjectId,
        ref: 'Task'
    }],
    parentTask: {
        type: Schema.Types.ObjectId,
        ref: 'Task'
    },
		subscribers: [{
    	type: Schema.Types.ObjectId,
			ref: 'User'
		}],
		creator: {
			type: Schema.Types.ObjectId,
			ref: 'User'
    },
    reminders: Array,
    createdAt: String,
    updatedAt: String,
});

export interface TaskInterface {
    priority: number;
    deleted: number;
    isFullDay: boolean;
    projectId: string | ProjectInterface | MongooseFilterQuery<any>;
    labelIds: Array<string | LabelInterface>;
    status: {
        completed: boolean;
        prevColumnId: string;
    };
    activities: Array<string | ActivityInterface>;
    content: string;
    startDate: string;
    inItemMode: boolean;
    items: Array<any>;
    childTasks: Array<string | TaskInterface | Types.ObjectId>;
    parentTask: Array<string | TaskInterface>;
    subscribers: Array<string | UserInterface>;
    creator: string | UserInterface;
    reminders: Array<any>;
    createdAt: string;
    updatedAt: string;
}

interface TaskDocument extends TaskInterface, Document {}

export interface TaskModel extends Model<TaskDocument> {}

export default  mongoose.model<TaskDocument, TaskModel>('Task', taskSchema);

