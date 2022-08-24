const { Schema, SchemaTypes } = require('mongoose');

const FriendSchema = new Schema({
  addresseeId: { type: SchemaTypes.ObjectId, ref: "User" }
},{ timestamps: true })

module.exports = FriendSchema;