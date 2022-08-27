const { Schema, SchemaTypes, model } = require('mongoose');

const FriendSchema = new Schema({
  requesterId : { type: SchemaTypes.ObjectId, ref: "User" },
  receiverId: { type: SchemaTypes.ObjectId, ref: "User" },
  status: { type: String}
},{ timestamps: true })

module.exports = model('Friend', FriendSchema);