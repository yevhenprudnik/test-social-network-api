const { Schema, model } = require('mongoose')

const UserSchema = new Schema({
  username: { type: String, unique: true, required: true},
  email: { type: String, unique: true, required: true},
  password: { type: String, required: true},
  token: { type: String},
  confirmedEmail: {type: Boolean, default: false},
  emailConfirmationLink: {type: String},
})

module.exports = model('User', UserSchema)