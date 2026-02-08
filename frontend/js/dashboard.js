/* ================= CONFIG & AUTH ================= */

const API_URL = "http://localhost:5000/api/jobs";
const token = localStorage.getItem("token");

if (!token) {
  window.location.href = "login.html";
}

/* Logout */
const logoutBtn = document.querySelector(".logout-btn");
logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "login.html";
});

/* ================= COLUMN MAPPING ================= */

const columns = {
  Wishlist: document.querySelector(".column.wishlist"),
  Applied: document.querySelector(".column.applied"),
  Interview: document.querySelector(".column.interview"),
  Offer: document.querySelector(".column.offer"),
  Rejected: document.querySelector(".column.rejected"),
};

/* ================= LOAD JOBS ================= */

async function loadJobs() {
  try {
    const res = await fetch(API_URL, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const jobs = await res.json();
    console.log("Jobs from backend:", jobs);

    /* Clear existing cards */
    Object.values(columns).forEach(col => {
      col.querySelectorAll(".job-card").forEach(card => card.remove());
    });

    /* Render job cards */
    jobs.forEach(job => {
      const card = document.createElement("div");
      card.className = "job-card";

      card.innerHTML = `
        <div class="job-card-header">
          <strong>${job.company}</strong>
          <div class="card-actions">
            <span class="edit-btn" data-id="${job._id}" data-status="${job.status}">✏️</span>
            <span class="delete-btn" data-id="${job._id}">✖</span>
          </div>
        </div>
        <small>${job.role}</small>
      `;

      if (columns[job.status]) {
        columns[job.status].appendChild(card);
      }
    });

    updateStats(jobs);

  } catch (err) {
    console.error("Dashboard Error:", err.message);
  }
}

loadJobs();

/* ================= ADD JOB MODAL ================= */

const modal = document.getElementById("job-modal");
const openBtn = document.querySelector(".cta");
const closeBtn = document.getElementById("close-modal");
const jobForm = document.getElementById("job-form");

openBtn.addEventListener("click", () => modal.classList.add("show"));
closeBtn.addEventListener("click", () => modal.classList.remove("show"));

jobForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const company = document.getElementById("job-company").value.trim();
  const role = document.getElementById("job-role").value.trim();
  const status = document.getElementById("job-status").value;

  try {
    await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ company, role, status }),
    });

    modal.classList.remove("show");
    jobForm.reset();
    loadJobs();

  } catch {
    alert("Failed to add job");
  }
});

/* ================= DELETE & EDIT HANDLERS ================= */

document.addEventListener("click", async (e) => {

  /* DELETE */
  if (e.target.classList.contains("delete-btn")) {
    const jobId = e.target.dataset.id;
    if (!confirm("Delete this job?")) return;

    await fetch(`${API_URL}/${jobId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    loadJobs();
  }

  /* EDIT */
  if (e.target.classList.contains("edit-btn")) {
    const jobId = e.target.dataset.id;
    const currentStatus = e.target.dataset.status;

    const newStatus = prompt(
      "Update status (Wishlist, Applied, Interview, Offer, Rejected):",
      currentStatus
    );

    if (!newStatus) return;

    await fetch(`${API_URL}/${jobId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status: newStatus }),
    });

    loadJobs();
  }
});

/* ================= STATS & COUNTERS ================= */

function updateStats(jobs) {
  const stats = {
    total: jobs.length,
    Wishlist: 0,
    Applied: 0,
    Interview: 0,
    Offer: 0,
    Rejected: 0,
  };

  jobs.forEach(job => stats[job.status]++);

  const counters = document.querySelectorAll(".counter");
  const values = [
    stats.total,
    stats.Wishlist,
    stats.Applied,
    stats.Interview,
    stats.Offer,
    stats.Rejected,
  ];

  counters.forEach((el, i) => animateCounter(el, values[i]));


}

function animateCounter(el, target) {
  el.textContent = "0";
  let count = 0;
  const step = Math.max(700 / (target || 1), 40);

  const tick = () => {
    count++;
    el.textContent = count;
    if (count < target) setTimeout(tick, step);
    else el.textContent = target;
  };

  tick();
}

/* ================= CHARTS ================= */

let statusChart, pieChart;

function renderCharts(stats) {
  const labels = ["Wishlist", "Applied", "Interview", "Offer", "Rejected"];
  const data = [
    stats.Wishlist,
    stats.Applied,
    stats.Interview,
    stats.Offer,
    stats.Rejected,
  ];

  if (statusChart) statusChart.destroy();
  if (pieChart) pieChart.destroy();

  statusChart = new Chart(document.getElementById("statusChart"), {
    type: "bar",
    data: {
      labels,
      datasets: [{
        label: "Applications",
        data,
        backgroundColor: ["#a78bfa", "#60a5fa", "#facc15", "#4ade80", "#f87171"],
      }],
    },
    options: { plugins: { legend: { display: false } } },
  });

  pieChart = new Chart(document.getElementById("pieChart"), {
    type: "pie",
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: ["#a78bfa", "#60a5fa", "#facc15", "#4ade80", "#f87171"],
      }],
    },
  });
}
