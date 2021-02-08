import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const notificationSchema = new Schema({
	flag: String,
	type: String,
	category: String,
	message: {
		text: String,
		entity: [{
			index: Number,
			el: String,
			classes: [{type: String}],
			data: {
				project: {
					type: Schema.Types.ObjectId,
					ref: 'Project'
				},
				user: {
					type: Schema.Types.ObjectId,
					ref: 'User'
				},
			}
		}]
	},
	ticket: {
		type: Schema.Types.ObjectId,
		ref: 'Ticket'
	},
	data: Object,
	unread: Boolean,
	fromUserId: {
		type: Schema.Types.ObjectId,
		ref: 'User'
	},
	toUserId: {
		type: Schema.Types.ObjectId,
		ref: 'User'
	},
	timeStamp: String
});

export default mongoose.model('Notification', notificationSchema);
