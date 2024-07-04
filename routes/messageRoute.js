const express = require("express");
const router = express.Router();
const messageController = require("../controllers/messageController");

router.get("/history", messageController.get_message_history);

router.post("/", messageController.send_message);

router.put("/", messageController.update_message);

router.delete("/", messageController.delete_message);

module.exports = module.exports = router;
