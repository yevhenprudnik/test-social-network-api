const { Schema, SchemaTypes } = require('mongoose');

const FriendSchema = new Schema({
  username: { type: String, required: true },
  friendSince: { type: Date, default: () => new Date()},
  additionalInfo: { type: SchemaTypes.ObjectId, ref: "User" }
})

module.exports = FriendSchema;