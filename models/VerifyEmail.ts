const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const verifyEmailSchema = new Schema({
	email: String,
	token: String
}, {timeStamps: true});


export default mongoose.model('VerifyEmail', verifyEmailSchema);
