const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const util = require("../misc/util");

router.get("/login", userController.user_login);

router.post("/signup", userController.user_signup);

router.put("/", util.userAuth, userController.account_update);

router.delete("/", util.userAuth, userController.account_delete);

module.exports = router;
