const { Schema, model } = require('mongoose');
const mongoose = require('mongoose');

const PostSchema = new Schema({
  postedBy: { type: mongoose.SchemaTypes.ObjectId, ref: "User", required: true},
  text: { type: String, required: true},
  date: { type: Date},
  likedBy: [{ type: mongoose.SchemaTypes.ObjectId, ref: "User"}],
  comments: [{
    writtenBy: { type: mongoose.SchemaTypes.ObjectId, ref: "User"},
    comment: { type: String }
  }]
})


module.exports = model('Post', PostSchema);