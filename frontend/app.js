const tg = window.Telegram.WebApp;
tg.expand();

/* ===== Utils ===== */
function show(id) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

/* ===== Storage ===== */
const store = {
  get: (k) => JSON.parse(localStorage.getItem(k)),
  set: (k, v) => localStorage.setItem(k, JSON.stringify(v))
};

/* ===== FLOW ===== */
window.addEventListener("DOMContentLoaded", () => {
  setTimeout(startApp, 1200);
});

function startApp() {
  if (!store.get("lang")) return show("screen-lang");
  if (!store.get("role")) return show("screen-role");
  if (!store.get("profile")) return show("screen-profile");
  show("screen-main");
}

/* ===== Actions ===== */
function setLang(lang) {
  store.set("lang", lang);
  show("screen-role");
}

function setRole(role) {
  store.set("role", role);
  show("screen-profile");
}

function saveProfile() {
  const name = document.getElementById("name").value;
  const phone = document.getElementById("phone").value;

  if (!name || !phone) {
    alert("Заполните данные");
    return;
  }

  store.set("profile", {
    name,
    phone,
    points: 0,
    rating: 0
  });

  show("screen-main");
}

/* ===== Menu ===== */
function openProfile() {
  alert("Профиль — следующий шаг");
}

function openSettings() {
  alert("Настройки — следующий шаг");
}
