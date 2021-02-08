import mongoose, {Document, Model} from 'mongoose';
import User, {UserInterface} from "./User";
const Schema = mongoose.Schema;

const projectSchema = new Schema({
    type: String,
    color: String,
    content: {
        type: String,
        required: true
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    users: [{
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        },
        role: String
    }],
    deleted: Number
});

export interface ProjectInterface {
    type: string;
    color: string;
    content: string;
    users: [{user: UserInterface, role: 'owner' | 'can_edit' | 'can_view'}];
    deleted: number;
    owner: string;
}

interface ProjectDocument extends ProjectInterface, Document {}

export interface ProjectModel extends Model<ProjectDocument> {}

export default  mongoose.model<ProjectDocument, ProjectModel>('Project', projectSchema);
