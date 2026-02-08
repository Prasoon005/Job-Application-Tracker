const express = require("express");
const {
  createJob,
  getJobs,
  updateJob,
  deleteJob,
} = require("../controllers/jobController.js");

const { protect } = require("../middlewares/authMiddleware.js");

const router = express.Router();

/* ================= JOB ROUTES ================= */

// Create job + Get all jobs
router.route("/")
  .post(protect, createJob)
  .get(protect, getJobs);

// Update job + Delete job
router.route("/:id")
  .put(protect, updateJob)
  .delete(protect, deleteJob);

module.exports = router;
