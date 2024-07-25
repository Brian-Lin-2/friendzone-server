const User = require("../models/user");
const Message = require("../models/message");
const passport = require("passport");
const { validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");

exports.userAuth = passport.authenticate("jwt", { session: false });

exports.validate = (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    res.status(400).json({
      status: "failure",
      message: "invalid credentials",
      errors: errors,
    });

    return false;
  }

  return true;
};

exports.bot_message = asyncHandler(async (bot, user) => {
  // Create a message.
  const message_1 = new Message({
    from: bot._id,
    to: user._id,
    text: "Hello, welcome to Friendzone!",
  });

  const message_2 = new Message({
    from: bot._id,
    to: user._id,
    text: `Ask me any question below by texting its corresponding number:
      1. How was your day?
      2. Why was this app created?
      3. What can I do on this app?
      4. What is your purpose?`,
  });

  await message_1.save();
  await message_2.save();
});
