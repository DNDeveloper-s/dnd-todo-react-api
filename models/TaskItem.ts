import mongoose, {Document, Model} from 'mongoose';
const Schema = mongoose.Schema;

const taskItemSchema = new Schema({
    status: Number,
    content: String,
    completedAt: String,
    id: Schema.Types.ObjectId,
    deleted: Number
});
export interface TaskItemInterface {
    status: number;
    content: string;
    completedAt: string;
    deleted: number;
}

interface TaskItemDocument extends TaskItemInterface, Document {}

export interface TaskItemModel extends Model<TaskItemDocument> {}

export default  mongoose.model<TaskItemDocument, TaskItemModel>('TaskItem', taskItemSchema);
