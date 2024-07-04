const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const MessageSchema = new Schema({
  from: { type: Schema.Types.ObjectId, ref: "User" },
  to: { type: Schema.Types.ObjectId, ref: "User" },
  text: { type: String, required: true },
  // ISODate ensures the date is always in an appropriate format.
  timestamp: "ISODate('2023-01-01T00:00:00Z')",
});

MessageSchema.virtual("url").get(function () {
  return `/user/${this._id}`;
});

exports.module = mongoose.model("message", MessageSchema);
