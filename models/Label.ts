import mongoose, {Document, Model} from 'mongoose';
import {ProjectInterface} from "./Project";
import {ActivityInterface} from "./Activity";
import {UserInterface} from "./User";
import {TaskInterface} from "./Task";
const Schema = mongoose.Schema;

const labelSchema = new Schema({
    type: String,
    taskIds: [{
        type: Schema.Types.ObjectId,
        ref: 'Task'
    }],
    icon: String,
    color: String,
    content: {
        type: String,
        required: true
    },
    deleted: Number
});

export interface LabelInterface {
    type: string;
    icon: string;
    color: string;
    content: string;
    taskIds: Array<string | TaskInterface>;
    deleted: number;
}

interface LabelDocument extends LabelInterface, Document {}

export interface LabelModel extends Model<LabelDocument> {}

export default  mongoose.model<LabelDocument, LabelModel>('Label', labelSchema);
