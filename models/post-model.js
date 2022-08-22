const { Schema, model } = require('mongoose');

const PostSchema = new Schema({
  postedBy: { type: String, required: true },
  header: { type: String, required: true },
  text: { type: String, required: true },
  date: { type: Date},
  // TODO: add model
  likedBy: [ String ],
  comments: [{
    writtenBy: { type: String },
    comment: { type: String }
  }]
})


module.exports = model('Post', PostSchema);