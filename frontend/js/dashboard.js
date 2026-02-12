/* ================= CONFIG & AUTH ================= */

const API_URL = "http://localhost:5000/api/jobs";
const token = localStorage.getItem("token");

if (!token) {
  window.location.href = "login.html";
}

/* ================= USER INFO ================= */

const user = JSON.parse(localStorage.getItem("user") || "{}");

const userNameEl = document.getElementById("user-name");
const userEmailEl = document.getElementById("user-email");

if (userNameEl && userEmailEl) {
  userNameEl.textContent = user.name || "User";
  userEmailEl.textContent = user.email || "";
}

/* ================= GLOBAL STATE ================= */

let allJobs = [];
let trendChart = null;

/* ================= VIEW ELEMENTS ================= */

const dashboardView = document.getElementById("dashboard-view");
const analyticsView = document.getElementById("analytics-view");
const pageTitle = document.getElementById("page-title");
const addJobBtn = document.getElementById("add-job-btn");
const navLinks = document.querySelectorAll(".sidebar nav a");

/* Default View */
dashboardView.classList.remove("hidden");
analyticsView.classList.add("hidden");
pageTitle.textContent = "Dashboard";
addJobBtn.style.display = "inline-block";

/* ================= LOGOUT ================= */

document.querySelector(".logout-btn").addEventListener("click", () => {
  localStorage.clear();
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

    allJobs = await res.json();

    /* Clear old cards */
    Object.values(columns).forEach(col =>
      col.querySelectorAll(".job-card").forEach(card => card.remove())
    );

    /* Render cards */
    allJobs.forEach(job => {
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

      columns[job.status]?.appendChild(card);
    });

    updateDashboardStats(allJobs);

  } catch (err) {
    console.error("Dashboard Error:", err.message);
  }
}

loadJobs();

/* ================= ADD JOB ================= */

const modal = document.getElementById("job-modal");
const jobForm = document.getElementById("job-form");

addJobBtn.addEventListener("click", () => modal.classList.add("show"));
document.getElementById("close-modal").addEventListener("click", () => modal.classList.remove("show"));

jobForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const company = jobForm["job-company"].value.trim();
  const role = jobForm["job-role"].value.trim();
  const status = jobForm["job-status"].value;

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
});

/* ================= DELETE & EDIT ================= */

document.addEventListener("click", async (e) => {

  if (e.target.classList.contains("delete-btn")) {
    if (!confirm("Delete this job?")) return;

    await fetch(`${API_URL}/${e.target.dataset.id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    loadJobs();
  }

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

/* ================= DASHBOARD STATS ================= */

function updateDashboardStats(jobs) {
  const stats = {
    total: jobs.length,
    Wishlist: 0,
    Applied: 0,
    Interview: 0,
    Offer: 0,
    Rejected: 0,
  };

  jobs.forEach(j => stats[j.status]++);

  const values = Object.values(stats);
  document.querySelectorAll(".counter").forEach((el, i) => {
    el.textContent = values[i] || 0;
  });
}

/* ================= ANALYTICS ================= */

function buildTimeline(jobs) {
  const map = {};
  jobs.forEach(j => {
    const d = new Date(j.updatedAt || j.createdAt).toISOString().split("T")[0];
    map[d] ??= { Applied: 0, Interview: 0, Offer: 0, Rejected: 0 };
    map[d][j.status]++;
  });
  return map;
}

function renderTrendChart(jobs) {
  if (!jobs.length) return;

  const timeline = buildTimeline(jobs);
  const dates = Object.keys(timeline).sort();

  const cumulative = { Applied: [], Interview: [], Offer: [], Rejected: [] };
  const running = { Applied: 0, Interview: 0, Offer: 0, Rejected: 0 };

  dates.forEach(d => {
    Object.keys(running).forEach(k => {
      running[k] += timeline[d][k];
      cumulative[k].push(running[k]);
    });
  });

  trendChart?.destroy();

  trendChart = new Chart(document.getElementById("trendChart"), {
    type: "line",
    data: {
      labels: dates,
      datasets: [
        { label: "Applied", data: cumulative.Applied, borderColor: "#60a5fa", tension: 0.4 },
        { label: "Interview", data: cumulative.Interview, borderColor: "#facc15", tension: 0.4 },
        { label: "Offer", data: cumulative.Offer, borderColor: "#4ade80", tension: 0.4 },
        { label: "Rejected", data: cumulative.Rejected, borderColor: "#f87171", tension: 0.4 },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: "#e5e7eb" } },
      },
      scales: {
        x: { ticks: { color: "#c7d2fe" } },
        y: { beginAtZero: true, ticks: { color: "#c7d2fe" } },
      },
    },
  });
}

function updateAnalyticsCards(jobs) {
  const total = jobs.length;
  const rejected = jobs.filter(j => j.status === "Rejected").length;
  const offers = jobs.filter(j => j.status === "Offer").length;
  const active = jobs.filter(j => ["Applied", "Interview"].includes(j.status)).length;

  totalApps.textContent = total;
  totalOffers.textContent = offers;
  rejectionRate.textContent = total ? Math.round((rejected / total) * 100) + "%" : "0%";
  activePipeline.textContent = active;
}

function updateInsight(jobs) {
  analyticsInsight.textContent =
    jobs.some(j => j.status === "Offer")
      ? `Great work! You received ${jobs.filter(j => j.status === "Offer").length} offer(s).`
      : "Keep applying — progress builds momentum.";
}

/* ================= SIDEBAR NAV ================= */

navLinks.forEach(link => {
  link.addEventListener("click", () => {
    navLinks.forEach(l => l.classList.remove("active"));
    link.classList.add("active");

    if (link.textContent.trim() === "Analytics") {
      dashboardView.classList.add("hidden");
      analyticsView.classList.remove("hidden");
      pageTitle.textContent = "Analytics";
      addJobBtn.style.display = "none";

      updateAnalyticsCards(allJobs);
      updateInsight(allJobs);
      setTimeout(() => renderTrendChart(allJobs), 100);
    }

    if (link.textContent.trim() === "Dashboard") {
      analyticsView.classList.add("hidden");
      dashboardView.classList.remove("hidden");
      pageTitle.textContent = "Dashboard";
      addJobBtn.style.display = "inline-block";
    }
  });
});

/* ================= CURSOR GLOW ================= */

const body = document.querySelector(".dashboard-body");

document.addEventListener("mousemove", (e) => {
  const x = (e.clientX / innerWidth) * 100;
  const y = (e.clientY / innerHeight) * 100;

  body.style.background = `
    radial-gradient(circle at ${x}% ${y}%, rgba(109,93,252,0.18), transparent 40%),
    radial-gradient(circle at bottom right, #2563eb 0%, transparent 40%),
    linear-gradient(180deg, #05070f, #0b0f1a)
  `;
});
