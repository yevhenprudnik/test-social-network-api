const { Schema, SchemaTypes, model } = require('mongoose');

const UserSchema = new Schema({
  username: { type: String, unique: true, required: true},
  fullName: { type: String},
  email: { type: String, unique: true, required: true},
  password: { type: String},
  token: { type: String},
  confirmedEmail: {type: Boolean, default: false},
  emailConfirmationLink: {type: String},
  avatar: {type: String, default: 'http://tachyons.io/img/avatar_1.jpg'},
  createdVia : { type: String },
  oauthId : { type: String, }
},{ timestamps: true })

module.exports = model('User', UserSchema);