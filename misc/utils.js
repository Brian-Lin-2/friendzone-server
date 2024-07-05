const passport = require("passport");
const { validationResult } = require("express-validator");

exports.userAuth = passport.authenticate("jwt", { session: false });

exports.isLoggedIn = () => {
  if (req.user) {
    res.json.status(403).json({
      status: "failure",
      message: "already logged in",
    });
  }

  // User is not logged in, we call the next middleware.
  next();
};

exports.validate = (req) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    res.status(400).json({
      status: "failure",
      message: "invalid credentials",
      errors: errors,
    });
  }
};
