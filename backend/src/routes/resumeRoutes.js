const express = require("express");
const router = express.Router();

const { protect } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadMiddleware");
const resumeController = require("../controllers/resumeController");

// POST /api/resume/upload
router.post(
  "/upload",
  protect,
  upload.single("resume"),
  resumeController.uploadResume
);
// GET /api/resume
router.get("/", protect, resumeController.getResume);
// PUT /api/resume/replace
router.put(
  "/replace",
  protect,
  upload.single("resume"),
  resumeController.replaceResume
);

//DELETE
router.delete("/", protect, resumeController.deleteResume);

module.exports = router;
