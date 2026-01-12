document.addEventListener("DOMContentLoaded", () => {
  console.log("STAGE 1 START");

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

  setTimeout(() => {
    loading.style.display = "none";
    app.style.display = "block";
    showScreen("screen-home");
  }, 1000);

  document.getElementById("btn-home").onclick = () => showScreen("screen-home");
  document.getElementById("btn-add").onclick = () => showScreen("screen-add");
  document.getElementById("btn-profile").onclick = () => showScreen("screen-profile");
  document.getElementById("btn-settings").onclick = () => showScreen("screen-settings");
});
