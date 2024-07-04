const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const UserSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    minLength: 3,
    maxLength: 20,
  },
  password: { type: String, required: true },
  first_name: { type: String, required: true, maxLength: 20 },
  last_name: { type: String, required: true, maxLength: 20 },
  friends: [{ type: Schema.Types.ObjectId, ref: "User" }],
});

UserSchema.virtual("full_name").get(function () {
  return `${first_name} ${last_name}`;
});

UserSchema.virtual("url").get(function () {
  return `/user/${this._id}`;
});

module.exports = mongoose.model("user", UserSchema);
