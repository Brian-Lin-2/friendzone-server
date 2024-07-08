const passport = require("passport");
const { validationResult } = require("express-validator");

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
