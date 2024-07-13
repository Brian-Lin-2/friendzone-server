const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const MessageSchema = new Schema({
  from: { type: Schema.Types.ObjectId, ref: "user" },
  to: { type: Schema.Types.ObjectId, ref: "user" },
  text: { type: String, required: true },
  // ISODate ensures the date is always in an appropriate format.
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model("message", MessageSchema);
