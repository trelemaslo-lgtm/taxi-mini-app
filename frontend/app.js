/*********************************************************
 * INGICHKA TAKSI — STABLE BASE APP.JS
 * GUARANTEED NO LOADING FREEZE
 *********************************************************/

// === CONFIG ===
const API = "https://taxi-backend-5kl2.onrender.com"; // ← ОБЯЗАТЕЛЬНО замени

// === TELEGRAM ===
const tg = window.Telegram.WebApp;
tg.expand();

// === DOM ELEMENTS ===
let loader, app, ads, form, settings;

// === STATE ===
let currentTab = "driver";

// === INIT ===
document.addEventListener("DOMContentLoaded", () => {
  // bind elements
  loader = document.getElementById("loader");
  app = document.getElementById("app");
  ads = document.getElementById("ads");
  form = document.getElementById("form");
  settings = document.getElementById("settings");

  // safety check
  if (!loader || !app || !ads) {
    alert("❌ HTML elements not found. Check index.html IDs.");
    return;
  }

  // show app after loading
  setTimeout(() => {
    loader.style.display = "none";
    app.style.display = "block";
    loadAds();
  }, 800);
});

// === LOAD ADS ===
function loadAds() {
  ads.innerHTML = "<div class='glass card'>Загрузка...</div>";

  fetch(API + "/api/ads")
    .then(res => res.json())
    .then(data => {
      ads.innerHTML = "";

      const list = data.filter(a => a.role === currentTab);

      if (list.length === 0) {
        ads.innerHTML = "<div class='glass card'>Нет объявлений</div>";
        return;
      }

      list.forEach(a => {
        const card = document.createElement("div");
        card.className = "glass card";
        card.innerHTML = `
          <b>${a.route || "-"}</b><br>
          💰 ${a.price || "-"}<br>
          🪑 ${a.seats || "-"}<br>
          📞 <a href="tel:${a.phone}">${a.phone || "-"}</a>
        `;
        ads.appendChild(card);
      });
    })
    .catch(err => {
      ads.innerHTML = "<div class='glass card'>Ошибка загрузки</div>";
      console.error(err);
    });
}

// === TABS ===
function switchTab(tab) {
  currentTab = tab;
  loadAds();
}

// === FORM ===
function openForm() {
  form.style.display = "block";
}
function closeForm() {
  form.style.display = "none";
}

// === PUBLISH AD ===
function publishAd() {
  const role = document.getElementById("role").value;
  const route = document.getElementById("route").value;
  const time = document.getElementById("time").value;
  const seats = document.getElementById("seats").value;
  const price = document.getElementById("price").value;
  const phone = document.getElementById("phone").value;
  const comment = document.getElementById("comment").value;

  if (!route || !phone) {
    alert("Заполни маршрут и телефон");
    return;
  }

  fetch(API + "/api/ads", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      role,
      route,
      time,
      seats,
      price,
      phone,
      comment
    })
  })
    .then(() => {
      closeForm();
      loadAds();
    })
    .catch(err => {
      alert("Ошибка публикации");
      console.error(err);
    });
}

// === SETTINGS ===
function openSettings() {
  settings.style.display = "block";
}
function closeSettings() {
  settings.style.display = "none";
}

