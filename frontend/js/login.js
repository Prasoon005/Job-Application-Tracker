import { apiRequest } from "./api.js";

const form = document.querySelector("form");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  try {
    const res = await apiRequest("/auth/login", "POST", { email, password });

    localStorage.setItem("token", res.token);
    localStorage.setItem("user", JSON.stringify(res.user));

    // Temporary redirect (dashboard later)
    window.location.href = "dashboard.html";
  } catch (err) {
    alert(err.message);
  }
});
