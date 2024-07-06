const passport = require("passport");

exports.isLoggedIn = (req, res, next) => {
  passport.authenticate("jwt", { session: false }, (err, user) => {
    if (err) {
      return next(err);
    }

    if (user) {
      // If user is authenticated, restrict access to the login route
      return res.status(403).json({
        status: "failure",
        message: "User already logged in.",
      });
    }
    // If user is not authenticated, proceed to the next middleware
    next();
  })(req, res, next);
};
