const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

router.get("/login", userController.user_login);

router.post("/signup", userController.user_signup);

router.put("/", userController.account_update);

router.delete("/", userController.account_delete);

module.exports = router;
