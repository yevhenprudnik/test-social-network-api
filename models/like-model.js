const { Schema } = require('mongoose');

const LikeSchema = new Schema({
  likedBy: { type: String, required: true},
  date: { type: Date, default: () => new Date()},
})

module.exports = LikeSchema;