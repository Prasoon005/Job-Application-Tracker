const express = require("express");
const router = express.Router();

const Feedback = require("../models/feedback.js");
 // here error may be possible //const Feedback = require("../models/Feedback");
const { protect } = require("../middlewares/authMiddleware.js");


/* CREATE FEEDBACK */
router.post("/", protect , async (req, res) => {
  try {
    const feedback = await Feedback.create({
      ...req.body,
      user: req.user._id,
    });

    res.status(201).json(feedback);
  } catch (error) {
  console.error("FEEDBACK ERROR:", error);
  res.status(500).json({ message: error.message });
  }
});

/* GET USER FEEDBACKS */
router.get("/", protect , async (req, res) => {
  try {
    const feedbacks = await Feedback.find({ user: req.user._id }).sort({
      createdAt: -1,
    });

    res.json(feedbacks);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch feedbacks" });
  }
});

module.exports = router;
