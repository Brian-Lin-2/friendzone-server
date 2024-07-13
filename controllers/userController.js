const User = require("../models/user");
const asyncHandler = require("express-async-handler");
const { body } = require("express-validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { validate } = require("../misc/utils");
require("dotenv").config();

exports.user_login = [
  body("username", "Username must be between 3-20 characters.")
    .trim()
    .isLength({ min: 3, max: 20 })
    .escape(),
  body("password", "Password is required.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  asyncHandler(async (req, res) => {
    if (!validate(req, res)) {
      return;
    }

    const user = await User.findOne({ username: req.body.username })
      .populate("friends")
      .exec();

    if (!user) {
      res.status(400).json({
        status: "failure",
        message: "user was not found",
      });
      return;
    }

    const match = await bcrypt.compare(req.body.password, user.password);

    if (!match) {
      res.status(400).json({
        status: "failure",
        message: "invalid password",
      });
      return;
    }

    // Create a jwt for user authorization.
    jwt.sign({ id: user._id }, process.env.JWT_KEY, (err, token) => {
      if (err) {
        res.send(err);
        return;
      }

      res
        .status(200)
        .json({ status: "success", message: "user logged in", token, user });

      console.log("logged in");
    });
  }),
];

exports.user_signup = [
  body("username", "Username must be between 3-20 characters.")
    .trim()
    .isLength({ min: 3, max: 20 })
    .escape(),
  body("password", "Password is required.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("first_name")
    .trim()
    .isLength({ min: 1 })
    .withMessage("First name cannot be empty.")
    .isLength({ max: 20 })
    .withMessage("First name must be less than 20 characters"),
  body("last_name")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Last name cannot be empty.")
    .isLength({ max: 20 })
    .withMessage("Last name must be less than 20 characters"),
  (req, res) => {
    if (!validate(req, res)) {
      return;
    }

    bcrypt.hash(
      req.body.password,
      10,
      asyncHandler(async (err, encrypted_password) => {
        if (err) {
          console.log(err);
          res.status(400).json({
            status: "failure",
            message: "password could not be encrypted",
          });
          return;
        } else {
          const user = new User({
            username: req.body.username,
            password: encrypted_password,
            first_name: req.body.first_name.toLowerCase(),
            last_name: req.body.last_name.toLowerCase(),
          });

          const new_user = await user.save();

          res.status(201).json({
            status: "sucesss",
            user: "user created!",
            new_user: new_user,
          });
        }
      })
    );
  },
];

exports.change_password = [
  body("new_password", "Password is required.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  asyncHandler(async (req, res) => {
    if (!validate(req, res)) {
      return;
    }

    // User must enter correct password before being able to update.
    const match = await bcrypt.compare(req.body.password, req.user.password);

    if (!match) {
      res.status(400).json({
        status: "failure",
        message: "invalid password",
      });
      return;
    }

    bcrypt.hash(req.body.new_password, 10, async (err, encrypted_password) => {
      if (err) {
        res.status(400).json({
          status: "failure",
          message: "unable to encrypt password",
        });
        return;
      }

      const updated_user = new User({
        password: encrypted_password,
        _id: req.user._id,
      });

      const user = await User.findByIdAndUpdate(req.user._id, updated_user, {
        new: true,
      });

      res.status(200).json({
        status: "success",
        user: user,
      });
    });
  }),
];

exports.account_update = [
  body("username", "Username must be between 3-20 characters.")
    .trim()
    .isLength({ min: 3, max: 20 })
    .escape(),
  body("first_name")
    .trim()
    .isLength({ min: 1 })
    .withMessage("First name cannot be empty.")
    .isLength({ max: 20 })
    .withMessage("First name must be less than 20 characters"),
  body("last_name")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Last name cannot be empty.")
    .isLength({ max: 20 })
    .withMessage("Last name must be less than 20 characters"),
  asyncHandler(async (req, res) => {
    if (!validate(req, res)) {
      return;
    }

    const updated_user = new User({
      username: req.body.username,
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      _id: req.user._id,
    });

    const user = await User.findByIdAndUpdate(req.user._id, updated_user, {
      new: true,
    });
    res.status(200).json({
      status: "success",
      message: "user successfully updated",
      user: user,
    });
  }),
];

exports.account_delete = asyncHandler(async (req, res) => {
  const deleted_user = await User.findByIdAndDelete(req.user._id);

  res.status(200).json({
    status: "success",
    message: "user successfully deleted",
    deleted_user: deleted_user,
  });
});

exports.send_friend_request = asyncHandler(async (req, res) => {
  // Make sure request hasn't already been sent.
  const user = await User.findOne({ username: req.body.name });

  if (!user) {
    res.status(400).json({
      status: "failure",
      message: "User wasn't found.",
    });

    return;
  }

  if (user.pending_requests.includes(user._id)) {
    res.status(400).json({
      status: "failure",
      message: "Request already sent.",
    });

    return;
  }

  if (user.friends.includes(user._id)) {
    res.status(400).json({
      status: "failure",
      message: "User is already a friend.",
    });

    return;
  }

  await User.findByIdAndUpdate(
    user._id,
    {
      $push: { pending_requests: user._id },
    },
    { new: true }
  );

  res.status(200).json({
    status: "success",
    message: "request sent",
  });
});

exports.accept_friend_request = asyncHandler(async (req, res) => {
  const friendId = req.params.friendId;

  if (!req.user.pending_requests.includes(friendId)) {
    res.status(400).json({
      status: "failure",
      message: "request doesn't exist",
    });

    return;
  }

  // Add user to friend list and remove from friend requests list.
  await User.findByIdAndUpdate(req.user.id, {
    $pull: { pending_requests: friendId },
    $push: { friends: friendId },
  });

  // Also add user to the friend's friend list.
  await User.findByIdAndUpdate(friendId, {
    $push: { friends: req.user.id },
  });

  res.status(200).json({
    status: "success",
    message: "friend added",
  });
});

exports.remove_friend = asyncHandler(async (req, res) => {
  const friendId = req.params.friendId;

  await User.findByIdAndUpdate(req.user.id, {
    $pull: { friends: friendId },
  });

  await User.findByIdAndUpdate(friendId, {
    $pull: { friends: req.user.id },
  });

  res.status(200).json({
    status: "received",
    message: "friend removed",
  });
});

exports.get_user = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  res.status(200).json({
    status: "success",
    message: "info retrieved",
    user: user,
  });
});
