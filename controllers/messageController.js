const User = require("../models/user");
const Message = require("../models/message");
const asyncHandler = require("express-async-handler");
const { body } = require("express-validator");
const { validate } = require("../misc/utils");

exports.get_message_history = asyncHandler(async (req, res) => {
  // This will return all messages between the user and their friend.
  const friend = await User.findById(req.params.friendId);

  const [userMessages, friendMessages] = await Promise.all([
    Message.find({
      from: req.user,
      to: friend,
    }),
    Message.find({
      from: friend,
      to: req.user,
    }),
  ]);

  const history = [...userMessages, ...friendMessages];

  history.sort((a, b) => a.timestamp - b.timestamp);

  res.status(200).json({
    status: "success",
    history: history,
  });
});

exports.send_message = [
  asyncHandler(async (req, res) => {
    const friend = await User.findById(req.params.friendId);

    const message = new Message({
      from: req.user,
      to: friend,
      text: req.body.text,
    });

    const sent_message = await message.save();

    res.status(200).json({
      status: "success",
      message: "message sent",
      sent_message: sent_message,
    });
  }),
];

exports.update_message = [
  body("text").escape(),
  asyncHandler(async (req, res) => {
    validate(req);

    const new_message = new Message({
      text: req.body.text,
      _id: req.params.messageId,
    });

    const message = await Message.findByIdAndUpdate(
      req.params.messageId,
      new_message,
      { new: true }
    );

    res.status(200).json({
      status: "success",
      message: "message updated",
      new_message: message,
    });
  }),
];

exports.delete_message = asyncHandler(async (req, res) => {
  const message = await Message.findByIdAndDelete(req.params.messageId);

  res.json({
    status: "success",
    message: "message deleted",
    deleted_message: message,
  });
});
