const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    // ================= RESUME DETAILS =================
    resume: {
      url: {
        type: String,          // Cloudinary / S3 URL
        default: null,
      },
      publicId: {
        type: String,          // Used for delete / replace
        default: null,
      },
      originalName: {
        type: String,          // resume.pdf
        default: null,
      },
      uploadedAt: {
        type: Date,
        default: null,
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
