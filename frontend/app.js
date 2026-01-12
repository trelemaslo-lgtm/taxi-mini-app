/*************************************************
 * INGICHKA TAKSI — FINAL STABLE APP.JS
 * created by 711 GROUP
 *************************************************/

// ===== CONFIG =====
const API_URL = "https://YOUR-BACKEND.onrender.com"; // ← ОБЯЗАТЕЛЬНО ЗАМЕНИ
const ADMIN_ID = 123456789; // ← твой Telegram user_id
const ADS_TTL_MIN = 30;

// ===== TELEGRAM =====
const tg = window.Telegram.WebApp;
tg.expand();

// ===== STORAGE =====
const store = {
  get: (k) => JSON.parse(localStorage.getItem(k)),
  set: (k, v) => localStorage.setItem(k, JSON.stringify(v)),
  del: (k) => localStorage.removeItem(k)
};

// ===== I18N =====
const i18n = {
  ru: {
    chooseLang: "Выберите язык",
    whoAreYou: "Кто вы?",
    driver: "Водитель",
    client: "Клиент",
    profile: "Профиль",
    name: "Имя",
    phone: "Телефон",
    continue: "Продолжить",
    addAd: "Разместить объявление",
    settings: "Настройки"
  },
  uz: {
    chooseLang: "Tilni tanlang",
    whoAreYou: "Siz kimsiz?",
    driver: "Haydovchi",
    client: "Mijoz",
    profile: "Profil",
    name: "Ism",
    phone: "Telefon",
    continue: "Davom etish",
    addAd: "E’lon joylash",
    settings: "Sozlamalar"
  },
  uzk: {
    chooseLang: "Тилни танланг",
    whoAreYou: "Сиз кимсиз?",
    driver: "Ҳайдовчи",
    client: "Мижоз",
    profile: "Профил",
    name: "Исм",
    phone: "Телефон",
    continue: "Давом этиш",
    addAd: "Эълон жойлаш",
    settings: "Созламалар"
  }
};

function t(key) {
  const lang = store.get("lang") || "ru";
  return i18n[lang][key] || key;
}

// ===== SCREEN NAV =====
function show(id) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
  applyTexts();
}

// ===== APPLY TEXTS =====
function applyTexts() {
  document.querySelectorAll("[data-i18n]").forEach(el => {
    el.innerText = t(el.dataset.i18n);
  });
  document.querySelectorAll("[data-i18n-ph]").forEach(el => {
    el.placeholder = t(el.dataset.i18nPh);
  });
}

// ===== START APP =====
window.addEventListener("DOMContentLoaded", () => {
  setTimeout(startFlow, 1200);
});

function startFlow() {
  if (!store.get("lang")) return show("screen-lang");
  if (!store.get("role")) return show("screen-role");
  if (!store.get("profile")) return show("screen-profile");
  show("screen-main");

  if (isAdmin()) {
    const btn = document.getElementById("admin-btn");
    if (btn) btn.style.display = "block";
  }

  loadAds();
}

// ===== ONBOARDING =====
function setLang(lang) {
  store.set("lang", lang);
  show("screen-role");
}

function setRole(role) {
  store.set("role", role);
  show("screen-profile");
}

function saveProfile() {
  const name = document.getElementById("name").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const username = document.getElementById("tg-username").value.trim();
  const file = document.getElementById("photo-input").files[0];

  if (!name || !phone) {
    alert("Заполните данные");
    return;
  }

  const save = (photo) => {
    store.set("profile", {
      name,
      phone,
      username: username || null,
      photo,
      points: 0,
      rating: 0
    });
    show("screen-main");
    loadAds();
  };

  if (file) {
    const r = new FileReader();
    r.onload = () => save(r.result);
    r.readAsDataURL(file);
  } else {
    save(null);
  }
}

// ===== PROFILE VIEW =====
function openProfile() {
  const p = store.get("profile");
  document.getElementById("profile-name").innerText = p.name;
  document.getElementById("profile-phone").innerText = p.phone;

  const avatar = document.getElementById("profile-avatar");
  avatar.innerHTML = p.photo ? `<img src="${p.photo}">` : "👤";

  show("screen-profile-view");
}

// ===== ADS =====
let adsMode = "driver";

function switchAds(mode) {
  adsMode = mode;
  loadAds();
}

function loadAds() {
  fetch(API_URL + "/api/ads")
    .then(r => r.json())
    .then(data => {
      const box = document.getElementById("ads-list");
      box.innerHTML = "";

      const filtered = data.filter(a => a.role === adsMode);

      if (filtered.length === 0) {
        box.innerHTML = "<p style='opacity:.6'>Нет объявлений</p>";
        return;
      }

      filtered.forEach(ad => {
        const el = document.createElement("div");
        el.className = "glass card";
        el.onclick = () => openAdDetails(ad);

        el.innerHTML = `
          <b>${ad.route}</b><br>
          💰 ${ad.price}<br>
          ${ad.seats ? "🪑 " + ad.seats + " мест<br>" : ""}
          ${ad.isVIP ? "<div class='vip-badge'>👑 VIP</div>" : ""}
        `;
        box.appendChild(el);
      });
    });
}

// ===== CREATE AD =====
function publishAd() {
  const profile = store.get("profile");

  const data = {
    role: store.get("role"),
    route: document.getElementById("ad-route").value,
    price: document.getElementById("ad-price").value,
    seats: document.getElementById("ad-seats").value,
    mode: document.getElementById("ad-mode").value,
    isVIP: document.getElementById("ad-vip").checked,
    phone: profile.phone,
    name: profile.name
  };

  if (!data.route || !data.price) {
    alert("Заполните маршрут и цену");
    return;
  }

  fetch(API_URL + "/api/ads", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  }).then(() => {
    show("screen-main");
    loadAds();
  });
}

// ===== BOTTOM SHEET =====
function openAdDetails(ad) {
  document.getElementById("d-route").innerText = ad.route.replace("-", " → ");
  document.getElementById("d-name").innerText = ad.name || "Водитель";
  document.getElementById("d-car").innerText = ad.carNumber || "—";
  document.getElementById("d-price").innerText = ad.price + " сум";

  const phone = document.getElementById("d-phone");
  phone.href = "tel:" + ad.phone;

  const avatar = document.getElementById("d-avatar");
  const p = store.get("profile");
  avatar.innerHTML = p?.photo ? `<img src="${p.photo}">` : "👤";

  const tgBtn = document.getElementById("tg-chat-btn");
  if (ad.username) {
    tgBtn.style.display = "block";
    tgBtn.onclick = () => window.open("https://t.me/" + ad.username);
  } else {
    tgBtn.style.display = "none";
  }

  document.getElementById("ad-overlay").classList.remove("hidden");
  const sheet = document.getElementById("ad-sheet");
  sheet.classList.remove("hidden");
  setTimeout(() => sheet.classList.add("show"), 10);
}

function closeAdSheet() {
  const sheet = document.getElementById("ad-sheet");
  sheet.classList.remove("show");
  setTimeout(() => {
    sheet.classList.add("hidden");
    document.getElementById("ad-overlay").classList.add("hidden");
  }, 300);
}

// ===== ADMIN =====
function isAdmin() {
  return Telegram.WebApp.initDataUnsafe?.user?.id === ADMIN_ID;
}

function loadAdminAds() {
  fetch(API_URL + "/api/ads")
    .then(r => r.json())
    .then(data => {
      const box = document.getElementById("admin-ads");
      box.innerHTML = "";
      data.forEach(ad => {
        const el = document.createElement("div");
        el.className = "glass card";
        el.innerHTML = `
          <b>${ad.route}</b><br>
          ${ad.phone}<br>
          <button onclick="deleteAd(${ad.id})">❌ Удалить</button>
        `;
        box.appendChild(el);
      });
    });
}

function deleteAd(id) {
  fetch(API_URL + "/api/ads/" + id, { method: "DELETE" })
    .then(loadAdminAds);
}

// ===== DONATE =====
function donate(amount) {
  alert("Донат: " + amount + " сум (подключим позже)");
}
