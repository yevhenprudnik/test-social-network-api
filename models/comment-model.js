const { Schema, SchemaTypes, model } = require('mongoose');

const CommentSchema = new Schema({
  postId: { type: SchemaTypes.ObjectId, ref: "Post" },
  writtenBy: { type: SchemaTypes.ObjectId, ref: "User" },
  text: { type: String, required: true}
},{ timestamps: true })

module.exports = model('Comment', CommentSchema);