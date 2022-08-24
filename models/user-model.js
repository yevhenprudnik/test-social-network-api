const { Schema, SchemaTypes, model } = require('mongoose');
const FriendSchema = require('./friend-model');

const UserSchema = new Schema({
  username: { type: String, unique: true, required: true},
  fullName: { type: String},
  email: { type: String, unique: true, required: true},
  password: { type: String},
  token: { type: String},
  confirmedEmail: {type: Boolean, default: false},
  emailConfirmationLink: {type: String},
  friends : [ FriendSchema ],
  outcomingRequests: [{
    type: SchemaTypes.ObjectId, 
    ref: "User"
  }],
  incomingRequests: [{
    type: SchemaTypes.ObjectId, 
    ref: "User"
  }],
  avatar: {type: String, default: 'http://tachyons.io/img/avatar_1.jpg'},
  createdVia : { type: String },
  oauthId : { type: String, }
},{ timestamps: true })

module.exports = model('User', UserSchema);