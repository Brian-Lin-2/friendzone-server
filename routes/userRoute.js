const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { userAuth } = require("../misc/utils");
const { isLoggedIn } = require("../misc/middleware");

router.get("/", userAuth, userController.get_user);

router.post("/login", isLoggedIn, userController.user_login);

router.post("/signup", isLoggedIn, userController.user_signup);

router.post("/friend-request", userAuth, userController.send_friend_request);

router.put(
  "/friend-request/:friendId",
  userAuth,
  userController.accept_friend_request
);

router.put("/", userAuth, userController.account_update);

router.put("/change-password", userAuth, userController.change_password);

router.delete("/", userAuth, userController.account_delete);

router.delete("/friend/:friendId", userAuth, userController.remove_friend);

router.delete(
  "/friend-request/:friendId",
  userAuth,
  userController.decline_friend_request
);

module.exports = router;
