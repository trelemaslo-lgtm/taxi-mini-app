document.addEventListener("DOMContentLoaded", () => {
  const API = "https://taxi-backend-5kl2.onrender.com";
  const tg = window.Telegram.WebApp;
  tg.expand();

  const screens = document.querySelectorAll(".screen");

  function show(id) {
    screens.forEach(s => s.classList.remove("active"));
    const el = document.getElementById(id);
    if (el) el.classList.add("active");
  }

  const user = { lang:null, name:null, phone:null, role:null };
  let currentTab = "driver";
  const points = {};

  /* ===== START ===== */
  setTimeout(() => show("screen-lang"), 1200);

  /* ===== STEPS ===== */
  window.setLang = (lang) => {
    user.lang = lang;
    show("screen-profile-input");
  };

  window.saveProfile = () => {
    const nameInput = document.getElementById("name");
    const phoneInput = document.getElementById("phone");
    if (!nameInput || !phoneInput) return;

    user.name = nameInput.value;
    user.phone = phoneInput.value;
    show("screen-role");
  };

  window.setRole = (role) => {
    user.role = role;
    show("screen-main");
    loadAds();
  };

  /* ===== NAV ===== */
  window.goMain = () => show("screen-main");
  window.goAds = () => show("screen-main");
  window.openForm = () => show("screen-form");
  window.goSettings = () => show("screen-settings");

  window.goProfile = () => {
    document.getElementById("p-name").innerText = user.name || "";
    document.getElementById("p-phone").innerText = user.phone || "";
    document.getElementById("p-role").innerText = user.role || "";
    document.getElementById("p-points").innerText = points[user.phone] || 0;
    show("screen-profile-view");
  };

  window.switchTab = (tab) => {
    currentTab = tab;
    loadAds();
  };

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
          box.innerHTML = "<p>Нет объявлений</p>";
          return;
        }

        list.forEach(a => {
          const card = document.createElement("div");
          card.className = "glass card";

          const likes = points[a.phone] || 0;

          card.innerHTML = `
            <b>${a.route}</b><br>
            💰 ${a.price} | 👥 ${a.seats}<br>
            <a href="tel:${a.phone}">📞 ${a.phone}</a>
            <div class="like">
              <button onclick="like('${a.phone}')">❤️</button>
              <span>${likes}</span>
            </div>
          `;
          box.appendChild(card);
        });
      })
      .catch(() => {
        box.innerHTML = "<p>Ошибка загрузки</p>";
      });
  }

  window.like = (phone) => {
    points[phone] = (points[phone] || 0) + 1;
    loadAds();
  };

  window.publishAd = () => {
    fetch(API + "/api/ads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        role: user.role,
        route: document.getElementById("route").value,
        price: document.getElementById("price").value,
        seats: document.getElementById("seats").value,
        phone: user.phone,
        mode: document.getElementById("mode").value,
        car: document.getElementById("car").value,
        comment: document.getElementById("comment").value
      })
    }).then(() => {
      show("screen-main");
      loadAds();
    });
  };
});

