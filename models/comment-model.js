const { Schema } = require('mongoose');

const CommentSchema = new Schema({
  writtenBy: { type: String, required: true},
  comment: { type: String, required: true},
  date: { type: Date, default: () => new Date()},
})

module.exports = CommentSchema;