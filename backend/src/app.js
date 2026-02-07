const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes.js");
const app = express();
const jobRoutes = require("./routes/jobRoutes.js");
const feedbackRoutes = require("./routes/feedbackRoutes.js");

// middlewares
app.use(cors());
app.use(express.json());
app.use("/api/feedback", feedbackRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("Job Tracker API is running ...");
});

module.exports = app;
