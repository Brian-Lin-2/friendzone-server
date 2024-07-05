exports.isLoggedIn = (req, res, next, err) => {
  if (err) {
    res.json.status(400).json({
      status: "failure",
      message: "an error occured",
    });
  }

  if (req.user) {
    res.json.status(403).json({
      status: "failure",
      message: "already logged in",
    });
  }

  // User is not logged in, we call the next middleware.
  next();
};
