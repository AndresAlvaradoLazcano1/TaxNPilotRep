const express = require("express");
const router = express.Router();

const User = require("../models/User");

router.get("/api/users", async (req, res) => {
  try {
    const users = await User.find({}, "username createdAt").sort({ createdAt: -1 });

    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
