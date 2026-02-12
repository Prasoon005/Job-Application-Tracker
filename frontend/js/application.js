/* ================= APPLICATION LOGIC ================= */

const applicationsList = document.getElementById("applications-list");
const filterStatus = document.getElementById("filter-status");
const searchInput = document.getElementById("search-applications");

/* ================= RENDER APPLICATIONS ================= */

function renderApplications(jobs) {
  applicationsList.innerHTML = "";

  if (!jobs || jobs.length === 0) {
    applicationsList.innerHTML =
      "<p style='opacity:0.7;'>No applications found.</p>";
    return;
  }

  jobs.forEach(job => {
    const card = document.createElement("div");
    card.className = "application-card";

    card.innerHTML = `
      <h4>${job.company}</h4>
      <small>${job.role}</small><br/>
      <small>Status: ${job.status}</small>
    `;

    applicationsList.appendChild(card);
  });
}

/* ================= SEARCH + FILTER ================= */

function applyFilters() {
  let filteredJobs = [...allJobs];

  const status = filterStatus.value;
  const query = searchInput.value.trim().toLowerCase();

  if (status !== "All") {
    filteredJobs = filteredJobs.filter(j => j.status === status);
  }

  if (query) {
    filteredJobs = filteredJobs.filter(j =>
      j.company.toLowerCase().includes(query) ||
      j.role.toLowerCase().includes(query)
    );
  }

  renderApplications(filteredJobs);
}

/* ================= EVENTS ================= */

filterStatus.addEventListener("change", applyFilters);
searchInput.addEventListener("input", applyFilters);
