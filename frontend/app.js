document.addEventListener("DOMContentLoaded", () => {
  console.log("STAGE 2 START");

  if (window.Telegram && Telegram.WebApp) {
    Telegram.WebApp.ready();
    Telegram.WebApp.expand();
  }

  const loading = document.getElementById("loading");
  const app = document.getElementById("app");

  const screens = document.querySelectorAll(".screen");

 function showScreen(id) {
  document.querySelectorAll(".screen").forEach(s => {
    s.classList.remove("active");
  });

  const el = document.getElementById(id);
  if (el) el.classList.add("active");
}

  // ===== I18N =====
  const dict = {
    uz: {
      choose_lang: "Tilni tanlang",
      home: "Bosh sahifa",
      home_desc: "Asosiy ekran",
      add: "Qo‘shish",
      add_desc: "E’lon joylash",
      profile: "Profil",
      profile_desc: "Profil sahifasi",
      settings: "Sozlamalar",
      settings_desc: "Ilova sozlamalari"
    },
    ru: {
      choose_lang: "Выберите язык",
      home: "Главная",
      home_desc: "Главный экран",
      add: "Добавить",
      add_desc: "Размещение",
      profile: "Профиль",
      profile_desc: "Экран профиля",
      settings: "Настройки",
      settings_desc: "Настройки приложения"
    },
    uzk: {
      choose_lang: "Тилни танланг",
      home: "Бош саҳифа",
      home_desc: "Асосий экран",
      add: "Қўшиш",
      add_desc: "Эълон жойлаш",
      profile: "Профил",
      profile_desc: "Профил саҳифаси",
      settings: "Созламалар",
      settings_desc: "Илова созламалари"
    }
  };

  let lang = localStorage.getItem("lang");

  function applyLang() {
    document.querySelectorAll("[data-i18n]").forEach(el => {
      const key = el.dataset.i18n;
      if (dict[lang] && dict[lang][key]) {
        el.innerText = dict[lang][key];
      }
    });
  }

  // ===== LOADING =====
  setTimeout(() => {
    loading.style.display = "none";
    app.style.display = "block";

    if (!lang) {
      showScreen("screen-language");
    } else {
      applyLang();
      showScreen("screen-home");
    }
  }, 1000);

  // ===== LANGUAGE BUTTONS =====
  document.querySelectorAll(".lang-btn").forEach(btn => {
    btn.onclick = () => {
      lang = btn.dataset.lang;
      localStorage.setItem("lang", lang);
      applyLang();
      showScreen("screen-home");
    };
  });

  // ===== NAV =====
  document.getElementById("btn-home").onclick = () => showScreen("screen-home");
  document.getElementById("btn-add").onclick = () => showScreen("screen-add");
  document.getElementById("btn-profile").onclick = () => showScreen("screen-profile");
  document.getElementById("btn-settings").onclick = () => showScreen("screen-settings");
});
// ROLE LOGIC
function selectRole(role) {
  localStorage.setItem("role", role);
  showScreen("screen-profile");
}
console.log("APP JS LOADED");

// === SCREEN SYSTEM ===
const screens = document.querySelectorAll(".screen");

function showScreen(id) {
  console.log("Switch to:", id);

  screens.forEach(s => s.classList.remove("active"));

  const target = document.getElementById(id);
  if (!target) {
    console.error("Screen not found:", id);
    return;
  }

  target.classList.add("active");
}

// === LANGUAGE ===
document.querySelectorAll(".lang-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const lang = btn.dataset.lang;
    localStorage.setItem("lang", lang);
    showScreen("screen-role");
  });
});

// === ROLE ===
function selectRole(role) {
  console.log("ROLE SELECTED:", role);
  localStorage.setItem("role", role);
  showScreen("screen-profile");
}

// === INIT ===
document.addEventListener("DOMContentLoaded", () => {
  showScreen("screen-language");
});
