const { Schema, SchemaTypes } = require('mongoose');

const CommentSchema = new Schema({
  writtenBy: { type: SchemaTypes.ObjectId, ref: "User" },
  comment: { type: String, required: true}
},{ timestamps: true })

module.exports = CommentSchema;