const express = require("express");
const router = express.Router();
const { getOrCreateGlobalSession, processGlobalQuery, clearGlobalChat } = require("../controllers/globalChat.controllers");

router.get("/global/session", getOrCreateGlobalSession);
router.post("/global/query", processGlobalQuery);
router.delete("/global/clear/:sessionId", clearGlobalChat);

module.exports = router;