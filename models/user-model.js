const { Schema, model } = require('mongoose')

const UserSchema = new Schema({
  username: { type: String, unique: true, required: true},
  email: { type: String, unique: true, required: true},
  password: { type: String, required: true},
  token: { type: String},
})

module.exports = model('User', UserSchema)