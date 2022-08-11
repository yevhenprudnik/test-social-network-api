const { Schema, model } = require('mongoose');
const mongoose = require('mongoose');

const UserSchema = new Schema({
  username: { type: String, unique: true, required: true},
  email: { type: String, unique: true, required: true},
  password: { type: String, required: true},
  token: { type: String},
  confirmedEmail: {type: Boolean, default: false},
  emailConfirmationLink: {type: String},
  memberSince: { type: Date},
  following: [{ type: mongoose.SchemaTypes.ObjectId, ref: "User"}],
  followers: [{ type: mongoose.SchemaTypes.ObjectId, ref: "User"}],
  avatar: {type: String, default: 'http://tachyons.io/img/avatar_1.jpg'}
})

module.exports = model('User', UserSchema);