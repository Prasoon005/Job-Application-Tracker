const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    type: {
      type: String,
      enum: ["Interview", "Website"],
      required: true,
    },

    role: {
      type: String,
      required: true,
    },

    company: {
      type: String,
    },

    outcome: {
      type: String,
      enum: ["Selected", "Rejected", "In Progress"],
      required: true,
    },

    message: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Feedback", feedbackSchema);
