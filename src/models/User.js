const { Schema, model } = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new Schema({
    email: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    username: { type: String, required: true },
    password: { type: String, required: true },
    created_at: { type: Date, default: Date.now },
    is_deleted: { type: Boolean, default: false },
    image: { type: Schema.ObjectId, ref: 'Image', default: null }
});

UserSchema.methods.generateHash = (password) => {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
}

module.exports = model('User', UserSchema);