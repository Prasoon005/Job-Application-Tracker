const cloudinary = require("../config/cloudinary.js");

/* ================= UPLOAD RESUME ================= */
// POST /api/resume/upload
exports.uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No resume file provided" });
    }

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "job-tracker/resumes",
      resource_type: "auto", // upload ke liye OK
    });

    req.user.resume = {
      url: result.secure_url,
      publicId: result.public_id,
      resourceType: result.resource_type, // 🔥 IMPORTANT
      originalName: req.file.originalname,
      uploadedAt: new Date(),
    };

    await req.user.save();

    res.json({
      message: "Resume uploaded successfully",
      resume: req.user.resume,
    });
  } catch (error) {
    console.error("UPLOAD RESUME ERROR:", error);
    res.status(500).json({ message: "Resume upload failed" });
  }
};

/* ================= GET RESUME ================= */
// GET /api/resume
exports.getResume = async (req, res) => {
  try {
    if (!req.user.resume || !req.user.resume.url) {
      return res.status(404).json({
        message: "No resume uploaded yet",
        resume: null,
      });
    }

    res.json({ resume: req.user.resume });
  } catch (error) {
    console.error("GET RESUME ERROR:", error);
    res.status(500).json({ message: "Failed to fetch resume" });
  }
};

/* ================= REPLACE RESUME ================= */
// PUT /api/resume/replace
exports.replaceResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No resume file provided" });
    }

    // 🔥 OLD resume delete (PDF = raw)
    if (req.user.resume?.publicId) {
      await cloudinary.uploader.destroy(
        req.user.resume.publicId,
        {
          resource_type: req.user.resume.resourceType || "raw",
          invalidate: true,
        }
      );
    }

    // Upload new resume
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "job-tracker/resumes",
      resource_type: "auto",
    });

    req.user.resume = {
      url: result.secure_url,
      publicId: result.public_id,
      resourceType: result.resource_type, // 🔥 save this
      originalName: req.file.originalname,
      uploadedAt: new Date(),
    };

    await req.user.save();

    res.json({
      message: "Resume replaced successfully",
      resume: req.user.resume,
    });
  } catch (error) {
    console.error("REPLACE RESUME ERROR:", error);
    res.status(500).json({ message: "Failed to replace resume" });
  }
};

/* ================= DELETE RESUME ================= */
// DELETE /api/resume
exports.deleteResume = async (req, res) => {
  try {
    if (!req.user.resume?.publicId) {
      return res.status(404).json({ message: "No resume to delete" });
    }

    await cloudinary.uploader.destroy(
      req.user.resume.publicId,
      {
        resource_type: req.user.resume.resourceType || "raw",
        invalidate: true,
      }
    );

    req.user.resume = undefined;
    await req.user.save();

    res.json({ message: "Resume deleted successfully" });
  } catch (error) {
    console.error("DELETE RESUME ERROR:", error);
    res.status(500).json({ message: "Failed to delete resume" });
  }
};
