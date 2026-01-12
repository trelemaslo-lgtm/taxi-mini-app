document.addEventListener("DOMContentLoaded", () => {
  const API = "https://taxi-backend-5kl2.onrender.com";
  const tg = window.Telegram?.WebApp;
  if (tg) tg.expand();

  const loader = document.getElementById("loader");
  const app = document.getElementById("app");
  const screens = document.querySelectorAll(".screen");

  function show(id) {
    screens.forEach(s => s.classList.remove("active"));
    const el = document.getElementById(id);
    if (el) el.classList.add("active");
  }

  // ===== INIT =====
  setTimeout(() => {
    if (loader) loader.style.display = "none";
    if (app) app.style.display = "block";
    show("screen-lang");
  }, 900);

  // ===== STATE =====
  const user = {
    lang: null,
    name: null,
    phone: null,
    role: null
  };

  let currentTab = "driver";
  const points = {};

  // ===== LANGUAGE =====
  window.setLang = (lang) => {
    user.lang = lang;
    show("screen-profile-input");
  };

  // ===== PROFILE =====
  window.saveProfile = () => {
    const name = document.getElementById("name")?.value;
    const phone = document.getElementById("phone")?.value;
    if (!name || !phone) {
      alert("Введите имя и телефон");
      return;
    }
    user.name = name;
    user.phone = phone;
    show("screen-role");
  };

  // ===== ROLE =====
  window.setRole = (role) => {
    user.role = role;
    show("screen-main");
    loadAds();
  };

  // ===== NAV =====
  window.goMain = () => show("screen-main");
  window.openForm = () => show("screen-form");
  window.goSettings = () => show("screen-settings");

  window.goProfile = () => {
    document.getElementById("p-name").innerText = user.name || "";
    document.getElementById("p-phone").innerText = user.phone || "";
    document.getElementById("p-role").innerText = user.role || "";
    document.getElementById("p-points").innerText = points[user.phone] || 0;
    show("screen-profile-view");
  };

  // ===== TABS =====
  window.switchTab = (tab) => {
    currentTab = tab;
    loadAds();
  };

  // ===== LOAD ADS =====
  function loadAds() {
    const box = document.getElementById("ads");
    if (!box) return;

    box.innerHTML = `
      <div class="skeleton"></div>
      <div class="skeleton"></div>
    `;

    fetch(API + "/api/ads")
      .then(r => r.json())
      .then(data => {
        box.innerHTML = "";
        const list = data.filter(a => a.role === currentTab);

        if (!list.length) {
          box.innerHTML = "<p>Пока нет объявлений</p>";
          return;
        }

        list.forEach(a => {
          const card = document.createElement("div");
          card.className = "glass card";

          const likeCount = points[a.phone] || 0;

          card.innerHTML = `
            <b>${a.route}</b><br>
            💰 ${a.price} | 👥 ${a.seats}<br>
            🚗 ${a.car || "-"}<br>
            📞 <a href="tel:${a.phone}">${a.phone}</a>
            <div class="like">
              <button onclick="like('${a.phone}')">❤️</button>
              <span>${likeCount}</span>
            </div>
          `;
          box.appendChild(card);
        });
      })
      .catch(() => {
        box.innerHTML = "<p>Ошибка загрузки</p>";
      });
  }

  // ===== LIKE =====
  window.like = (phone) => {
    points[phone] = (points[phone] || 0) + 1;
    loadAds();
  };

  // ===== PUBLISH =====
  window.publishAd = () => {
    const payload = {
      role: user.role,
      route: document.getElementById("route")?.value,
      price: document.getElementById("price")?.value,
      seats: document.getElementById("seats")?.value,
      phone: user.phone,
      mode: document.getElementById("mode")?.value,
      car: document.getElementById("car")?.value,
      comment: document.getElementById("comment")?.value
    };

    fetch(API + "/api/ads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
      .then(() => {
        show("screen-main");
        loadAds();
      })
      .catch(() => {
        alert("Ошибка публикации");
      });
  };
});
