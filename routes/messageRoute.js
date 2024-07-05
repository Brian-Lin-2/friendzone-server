const express = require("express");
const router = express.Router();
const messageController = require("../controllers/messageController");
const { userAuth } = require("../misc/utils");

router.get("/all/:friendId", userAuth, messageController.get_message_history);

router.post("/:friendId", userAuth, messageController.send_message);

router.put("/:messageId", userAuth, messageController.update_message);

router.delete("/:messageId", userAuth, messageController.delete_message);

module.exports = module.exports = router;
