import mongoose, {Document, Model} from 'mongoose';
import {UserInterface} from "./User";
import {ProjectInterface} from "./Project";
const Schema = mongoose.Schema;

const ticketSchema = new Schema({
	data: {
		project: {
			type: Schema.Types.ObjectId,
			ref: 'Project'
		}
	},
	timeStamp: String,
	active: Boolean,
	duration: String,
	owner: {
		type: Schema.Types.ObjectId,
		ref: 'User'
	},
	toUserId: {
		type: Schema.Types.ObjectId,
		ref: 'User'
	},
});

export interface TicketInterface {
	data: {
		project: ProjectInterface | string;
	},
	timeStamp: string;
	active: boolean;
	duration: string;
	owner: UserInterface | string;
	toUserId: UserInterface | string;
}

interface TicketDocument extends TicketInterface, Document {}

export interface TicketModel extends Model<TicketDocument> {}

export default mongoose.model<TicketDocument, TicketModel>('Ticket', ticketSchema);
