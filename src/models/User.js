const { Schema, model } = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new Schema({
    email: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    username: { type: String, required: true },
    password: { type: String, required: true, minlength: 4 },
    created_at: { type: Date, default: Date.now },
    is_deleted: { type: Boolean, default: false }
});

UserSchema.methods.generateHash = (password) => {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
}

// NO ANDA
UserSchema.methods.validPassword = (password) => {
    return bcrypt.compareSync(password, this.password);
}

module.exports = model('User', UserSchema);