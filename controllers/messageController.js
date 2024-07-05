const Message = require("../models/message");
const asyncHandler = require("express-async-handler");

exports.get_message_history = asyncHandler(async (req, res) => {
  // This will return all messages between the user and their friend.
  const history = await Message.find({
    from: req.user,
    to: req.params.friendId,
  });

  res.status(200).json({
    status: "success",
    history: history,
  });
});

exports.send_message = (req, res) => {
  res.send("send message");
};

exports.update_message = (req, res) => {
  res.send("update message");
};

exports.delete_message = (req, res) => {
  res.send("delete message");
};
