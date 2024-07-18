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
      .populate("pending_requests")
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

    // Create a socket for the user.
    require("../socket/user_events");

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
  body("password", "Password is required.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("new_password", "New password is required.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("confirm_password", "Confirm your password.")
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
        errors: { errors: [{ msg: "Invalid password.", path: "password" }] },
      });
      return;
    }

    // Make sure user's password is correct.
    if (req.body.new_password !== req.body.confirm_password) {
      res.status(400).json({
        status: "failure",
        message: "passwords don't match",
        errors: {
          errors: [
            { msg: "Passwords don't match.", path: "new_password" },
            { msg: "Passwords don't match.", path: "confirm_password" },
          ],
        },
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
        message: "password updated",
        user: user,
      });
    });
  }),
];

exports.account_update = [
  body("username", "Username must be between 3-20 characters.")
    .trim()
    .isLength({ min: 3, max: 20 }),
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
      message: "User successfully updated.",
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

  if (user.pending_requests.includes(req.user._id)) {
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

  if (user.username === req.user.username) {
    res.status(400).json({
      status: "failure",
      message: "Make friends with other people, not yourself.",
    });

    return;
  }

  await User.findByIdAndUpdate(
    user._id,
    {
      $push: { pending_requests: req.user._id },
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

  if (
    !req.user.pending_requests.some((friend) => friend._id.equals(friendId))
  ) {
    res.status(400).json({
      status: "failure",
      message: "Request doesn't exist.",
    });

    return;
  }

  // Add user to friend list and remove from friend requests list.
  const user = await User.findByIdAndUpdate(
    req.user.id,
    {
      $pull: { pending_requests: friendId },
      $push: { friends: friendId },
    },
    { new: true }
  )
    .populate("friends")
    .populate("pending_requests")
    .exec();

  // Also add user to the friend's friend list.
  await User.findByIdAndUpdate(friendId, {
    $push: { friends: req.user.id },
  });

  res.status(200).json({
    status: "success",
    message: "Friend added.",
    user,
  });
});

exports.decline_friend_request = asyncHandler(async (req, res) => {
  const friendId = req.params.friendId;

  console.log(req.user._id);

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $pull: { pending_requests: friendId },
    },
    { new: true }
  )
    .populate("friends")
    .populate("pending_requests")
    .exec();

  res.status(200).json({
    status: "success",
    message: "Request declined.",
    user,
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
    message: "Friend removed.",
  });
});

exports.get_user = asyncHandler(async (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Info retrieved.",
    user: req.user,
  });
});
