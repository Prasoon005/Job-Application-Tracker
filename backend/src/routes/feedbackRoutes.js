const express = require("express");
const router = express.Router();

const Feedback = require("../models/feedback");
 // here error may be possible //const Feedback = require("../models/Feedback");
const authMiddleware = require("../middleware/authMiddleware");

/* CREATE FEEDBACK */
router.post("/", authMiddleware, async (req, res) => {
  try {
    const feedback = await Feedback.create({
      ...req.body,
      user: req.user.id,
    });

    res.status(201).json(feedback);
  } catch (error) {
    res.status(500).json({ message: "Failed to submit feedback" });
  }
});

/* GET USER FEEDBACKS */
router.get("/", authMiddleware, async (req, res) => {
  try {
    const feedbacks = await Feedback.find({ user: req.user.id }).sort({
      createdAt: -1,
    });

    res.json(feedbacks);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch feedbacks" });
  }
});

module.exports = router;
