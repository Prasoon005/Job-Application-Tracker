const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    company: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
    },
    location: {
      type: String,
    },
    status: {
      type: String,
      enum: ["Wishlist", "Applied", "Interview", "Offer", "Rejected"],
      default: "Applied",
    },
    appliedDate: {
      type: Date,
    },
    notes: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Job", jobSchema);
