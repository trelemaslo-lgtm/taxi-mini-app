// ================================
// TELEGRAM INIT
// ================================
const tg = window.Telegram.WebApp;
tg.expand();

// ================================
// CONFIG
// ================================
const API = "https://taxi-backend-5kl2.onrender.com"; // НЕ МЕНЯЙ, если backend тут

// ================================
// DOM
// ================================
const loader = document.getElementById("loader");
const app = document.getElementById("app");
const adsBox = document.getElementById("ads");
const btnDrivers = document.getElementById("btnDrivers");
const btnClients = document.getElementById("btnClients");

// ================================
// STATE
// ================================
let currentTab = "client";

// ================================
// START
// ================================
document.addEventListener("DOMContentLoaded", () => {
  // показать приложение
  if (app) app.style.display = "block";

  // скрыть loader гарантированно
  setTimeout(hideLoader, 1000);

  // кнопки
  if (btnDrivers) btnDrivers.onclick = () => switchTab("driver");
  if (btnClients) btnClients.onclick = () => switchTab("client");

  // загрузка объявлений
  loadAds();
});

// ================================
// LOADER
// ================================
function hideLoader() {
  if (!loader) return;
  loader.style.opacity = "0";
  setTimeout(() => {
    loader.style.display = "none";
  }, 400);
}

// ================================
// TABS
// ================================
function switchTab(role) {
  currentTab = role;

  if (btnDrivers) btnDrivers.classList.toggle("active", role === "driver");
  if (btnClients) btnClients.classList.toggle("active", role === "client");

  loadAds();
}

// ================================
// LOAD ADS
// ================================
function loadAds() {
  adsBox.innerHTML = `<p style="opacity:.6;text-align:center">Загрузка...</p>`;

  fetch(API + "/api/ads")
    .then(r => r.json())
    .then(data => {
      adsBox.innerHTML = "";

      const list = data.filter(a => a.role === currentTab);

      if (list.length === 0) {
        adsBox.innerHTML = `
          <p style="opacity:.5;text-align:center;margin-top:40px">
            Пока нет объявлений
          </p>
        `;
        return;
      }

      list.forEach(a => {
        const card = document.createElement("div");
        card.className = "glass card";
        card.innerHTML = `
          <b>${a.role === "driver" ? "🚕 Водитель" : "👤 Клиент"}</b><br>
          <small>${a.route || "-"}</small><br>
          ⏰ ${a.time || "-"}<br>
          💰 ${a.price || "-"} | 👥 ${a.seats || "-"}<br>
          <a href="tel:${a.phone}" style="display:inline-block;margin-top:6px">
            📞 ${a.phone}
          </a>
        `;
        adsBox.appendChild(card);
      });
    })
    .catch(err => {
      console.error(err);
      adsBox.innerHTML = `
        <p style="color:#ff6b6b;text-align:center">
          Ошибка загрузки данных
        </p>
      `;
    });
}

