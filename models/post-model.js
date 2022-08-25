const { Schema, SchemaTypes, model } = require('mongoose');
const CommentSchema = require('./comment-model');
const LikeSchema = require('./like-model');

const PostSchema = new Schema({
  postedBy: { type: SchemaTypes.ObjectId, ref: "User" },
  header: { type: String, required: true },
  text: { type: String, required: true },
  likes: [{
    type: SchemaTypes.ObjectId, 
    ref: "Like"
  }],
  comments: [{
    type: SchemaTypes.ObjectId, 
    ref: "Comment"
  }]
},{ timestamps: true })


module.exports = model('Post', PostSchema);