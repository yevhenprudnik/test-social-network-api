const { Schema, SchemaTypes, model } = require('mongoose');

const LikeSchema = new Schema({
  postId: { type: SchemaTypes.ObjectId, ref: "Post" },
  authorId: { type: SchemaTypes.ObjectId, ref: "User" }
},{ timestamps: true })

module.exports = model('Like', LikeSchema);