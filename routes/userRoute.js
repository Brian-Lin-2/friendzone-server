const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { userAuth } = require("../misc/utils");
const { isLoggedIn } = require("../misc/middleware");

router.get("/login", isLoggedIn, userController.user_login);

router.post("/signup", isLoggedIn, userController.user_signup);

router.put("/", userAuth, userController.account_update);

router.put("/change-password", userAuth, userController.change_password);

router.delete("/", userAuth, userController.account_delete);

module.exports = router;
