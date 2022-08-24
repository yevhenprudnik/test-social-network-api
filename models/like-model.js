const { Schema, SchemaTypes } = require('mongoose');

const LikeSchema = new Schema({
  authorId: { type: SchemaTypes.ObjectId, ref: "User" },
},{ timestamps: true })

module.exports = LikeSchema;