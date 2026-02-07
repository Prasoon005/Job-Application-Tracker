import { apiRequest } from "./api.js";

const form = document.querySelector("form");
const feedbackList = document.querySelector(".feedback-list");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const token = localStorage.getItem("token");
  if (!token) {
    alert("Please login first");
    window.location.href = "login.html";
    return;
  }

  const feedbackData = {
    type: document.getElementById("type").value,
    role: document.getElementById("role").value.trim(),
    company: document.getElementById("company").value.trim(),
    outcome: document.getElementById("outcome").value,
    message: document.getElementById("message").value.trim(),
  };

  // Basic validation
  if (!feedbackData.role || !feedbackData.message) {
    alert("Please fill all required fields");
    return;
  }

  try {
    await apiRequest("/feedback", "POST", feedbackData, token);
    alert("Feedback submitted successfully");

    form.reset();
    loadFeedbacks(); // refresh list
  } catch (err) {
    alert(err.message);
  }
});

/* FETCH USER FEEDBACKS */
async function loadFeedbacks() {
  const token = localStorage.getItem("token");
  if (!token) return;

  try {
    const feedbacks = await apiRequest("/feedback", "GET", null, token);

    feedbackList.innerHTML = "<h2>Your Feedback</h2>";

    feedbacks.forEach((f) => {
      const card = document.createElement("div");
      card.className = "feedback-card";
      card.innerHTML = `
        <p>${f.message}</p>
        <span>${f.role} · ${f.outcome}</span>
      `;
      feedbackList.appendChild(card);
    });
  } catch (err) {
    console.error(err.message);
  }
}

// Load feedbacks on page load
loadFeedbacks();
