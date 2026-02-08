const express = require("express");
const {
  createJob,
  getJobs,
  updateJob,
  deleteJob,
} = require("../controllers/jobController.js");

const { protect } = require("../middlewares/authMiddleware.js");

const router = express.Router();

router.route("/")
  .post(protect, createJob)
  .get(protect, getJobs);

router.route("/:id")
  .put(protect, updateJob)
  .delete(protect, deleteJob);


router.delete("/:id", protect, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    if (job.user.toString() !== req.user.id) {
      return res.status(401).json({ message: "Not authorized" });
    }

    await job.deleteOne();
    res.json({ message: "Job removed" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});



module.exports = router;
