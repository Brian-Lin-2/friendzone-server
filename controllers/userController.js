const User = require("../models/user");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcrypt");

exports.user_login = (req, res) => {
  res.send("get user");
};

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
