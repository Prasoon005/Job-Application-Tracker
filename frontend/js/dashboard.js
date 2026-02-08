const API_URL = "http://localhost:5000/api/jobs";
const token = localStorage.getItem("token");
const logoutBtn = document.querySelector(".logout-btn");

logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "login.html";
});


if (!token) {
  alert("Please login first");
  window.location.href = "login.html";
}

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
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const jobs = await res.json();
    console.log("Jobs from backend:", jobs);

    /* Clear old cards */
    Object.values(columns).forEach(col => {
      col.querySelectorAll(".job-card").forEach(card => card.remove());
    });

    /* Render cards */
    jobs.forEach(job => {
      const card = document.createElement("div");
      card.className = "job-card";

     card.innerHTML = `
  <div class="job-card-header">
    <strong>${job.company}</strong>
    <span class="delete-btn" data-id="${job._id}">✖</span>
  </div>
  <small>${job.role}</small>
`;


      if (columns[job.status]) {
        columns[job.status].appendChild(card);
      }
    });

    updateStats(jobs);

  } catch (error) {
    console.error("Dashboard Error:", error.message);
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

/* ================= STATS LOGIC ================= */
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

document.addEventListener("click", async (e) => {
  if (e.target.classList.contains("delete-btn")) {
    const jobId = e.target.dataset.id;

    const confirmDelete = confirm("Delete this job?");
    if (!confirmDelete) return;

    try {
      await fetch(`http://localhost:5000/api/jobs/${jobId}`, {
        method: "DELETE",
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      });

      loadJobs(); 
    } catch {
      alert("Failed to delete job");
    }
  }
});
