const { Schema, model } = require('mongoose');
const CommentSchema = require('./comment-model');
const LikeSchema = require('./like-model');

const PostSchema = new Schema({
  postedBy: { type: String, required: true },
  header: { type: String, required: true },
  text: { type: String, required: true },
  date: { type: Date},
  likedBy: [ LikeSchema ],
  comments: [ CommentSchema ]
})


module.exports = model('Post', PostSchema);