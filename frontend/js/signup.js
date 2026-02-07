import { apiRequest } from "./api.js";

const form = document.querySelector("form");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  try {
    await apiRequest("/auth/register", "POST", { name, email, password });
    alert("Signup successful. Please login.");
    window.location.href = "login.html";
  } catch (err) {
    alert(err.message);
  }
});
