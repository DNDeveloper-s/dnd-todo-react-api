import mongoose, {Document, Model} from 'mongoose';
import {UserInterface} from "./User";
const Schema = mongoose.Schema;

const activitySchema = new Schema({
    type: String,
    key: String,
    task: {
        type: Schema.Types.ObjectId,
        ref: 'Task'
    },
    project: {
        type: Schema.Types.ObjectId,
        ref: 'Project'
    },
    label: {
        type: Schema.Types.ObjectId,
        ref: 'Label'
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    // message: {
    //     text: String,
    //     entity: [{
    //         index: Number,
    //         el: String,
    //         classes: [{type: String}],
    //         keys: [{type: String}],
    //         data: {
    //             project: {
    //                 type: Schema.Types.ObjectId,
    //                 ref: 'Project'
    //             },
    //             task: {
    //                 type: Schema.Types.ObjectId,
    //                 ref: 'Task'
    //             },
    //             label: {
    //                 type: Schema.Types.ObjectId,
    //                 ref: 'Label'
    //             },
    //             user: {
    //                 type: Schema.Types.ObjectId,
    //                 ref: 'User'
    //             },
    //         }
    //     }]
    // },
    timeStamp: String,
    oldData: String,
    updatedData: String
});

export interface ActivityInterface {
    key: 'task' | 'project' | 'label';
    type: 'createTask' | 'updateTask';
    task: string;
    updatedData: string;
    content: string;
    users: [{user: UserInterface}];
    message: Object;
    timeStamp: string;
}

interface ActivityDocument extends ActivityInterface, Document {}

export interface ActivityModel extends Model<ActivityDocument> {}

export default  mongoose.model<ActivityDocument, ActivityModel>('Activity', activitySchema);
