const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const User = new Schema({
  username: { type: String, required: true, minLength: 3, maxLength: 20 },
  first_name: { type: String, required: true, maxLength: 20 },
  last_name: { type: String, required: true, maxLength: 20 },
  friends: [{ type: Schema.Types.ObjectId, ref: "User" }],
});

const Message = new Schema({
  from: { type: Schema.Types.ObjectId, ref: "User" },
  to: { type: Schema.Types.ObjectId, ref: "User" },
  text: { type: String, required: true },
  // ISODate ensures the date is always in an appropriate format.
  timestamp: "ISODate('2023-01-01T00:00:00Z')",
});
