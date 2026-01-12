console.log("APP JS LOADED");

document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM READY");

  if (window.Telegram && Telegram.WebApp) {
    Telegram.WebApp.ready();
    Telegram.WebApp.expand();
  }

  const loading = document.getElementById("loading");
  const app = document.getElementById("app");
  const screens = document.querySelectorAll(".screen");

  function showScreen(id) {
    screens.forEach(s => s.classList.remove("active"));
    const el = document.getElementById(id);
    if (el) el.classList.add("active");
  }

  // INIT
  setTimeout(() => {
    loading.style.display = "none";
    app.style.display = "block";

    if (!localStorage.getItem("lang")) {
      showScreen("screen-language");
    } else if (!localStorage.getItem("role")) {
      showScreen("screen-role");
    } else {
      showScreen("screen-home");
    }
  }, 1000);

  // LANGUAGE
  document.querySelectorAll(".lang-btn").forEach(btn => {
    btn.onclick = () => {
      localStorage.setItem("lang", btn.dataset.lang);
      showScreen("screen-role");
    };
  });

  // ROLE
  window.selectRole = function(role) {
    localStorage.setItem("role", role);
    showScreen("screen-home");
  };

  // NAV
  document.getElementById("btn-home").onclick = () => showScreen("screen-home");
  document.getElementById("btn-add").onclick = () => showScreen("screen-add");
  document.getElementById("btn-profile").onclick = () => showScreen("screen-profile");
  document.getElementById("btn-settings").onclick = () => showScreen("screen-settings");
});
