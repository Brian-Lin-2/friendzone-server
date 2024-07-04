const User = require("../models/user");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
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
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.status(400).json({
        status: "failure",
        message: "invalid credentials",
        errors: errors,
      });
      return;
    }

    const user = await User.findOne({ username: req.body.username });

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
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.status(400).json({
        status: "failure",
        message: "invalid credentials",
        errors: errors,
      });
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
          const new_user = new User({
            username: req.body.username,
            password: encrypted_password,
            first_name: req.body.first_name.toLowerCase(),
            last_name: req.body.last_name.toLowerCase(),
            friends: [],
          });

          await new_user.save();

          res.status(201).json({
            status: "sucesss",
            user: "user created!",
            user: new_user,
          });
        }
      })
    );
  },
];

exports.account_update = (req, res) => {
  res.send("update user");
};

exports.account_delete = (req, res) => {
  res.send("delete user");
};
