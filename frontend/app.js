const translations = {
  ru: {
    title: "📢 Объявления",
    add: "➕ Разместить объявление",
    client: "Клиент",
    driver: "Водитель",
    route: "Маршрут",
    time: "Время",
    price: "Цена",
    publish: "Опубликовать",
    cancel: "Отмена"
  },

  uz: {
    title: "📢 E’lonlar",
    add: "➕ E’lon joylash",
    client: "Mijoz",
    driver: "Haydovchi",
    route: "Yo‘nalish",
    time: "Vaqt",
    price: "Narx",
    publish: "Joylash",
    cancel: "Bekor qilish"
  },

  uzc: {
    title: "📢 Эълонлар",
    add: "➕ Эълон жойлаш",
    client: "Мижоз",
    driver: "Ҳайдовчи",
    route: "Йўналиш",
    time: "Вақт",
    price: "Нарх",
    publish: "Жойлаш",
    cancel: "Бекор қилиш"
  }
};
const tg = window.Telegram.WebApp;
tg.expand();

let currentLang = "ru";

// автоязык из Telegram
if (tg.initDataUnsafe?.user?.language_code === "uz") {
  currentLang = "uz";
}
function t(key) {
  return translations[currentLang][key] || key;
}

const tg = window.Telegram.WebApp;
tg.expand();

const API = "https://taxi-backend-5kl2.onrender.com"; // твой backend

function loadAds() {
  fetch(API + "/api/ads")
    .then(r => r.json())
    .then(data => {
      const box = document.getElementById("ads");
      box.innerHTML = "";
      data.forEach(ad => {
        box.innerHTML += `
          <div>
            <b>${ad.role}</b><br>
            ${ad.route}<br>
            ${ad.time}<br>
            ${ad.price}
          </div>
        `;
      });
    });
}

function openForm() {
  document.getElementById("form").style.display = "block";
}

function sendAd() {
  fetch(API + "/api/ads", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      initData: tg.initData,
      role: document.getElementById("role").value,
      route: document.getElementById("route").value,
      time: document.getElementById("time").value,
      price: document.getElementById("price").value
    })
  }).then(() => loadAds());
}

loadAds();
function applyTranslations() {
  document.getElementById("title").innerText = t("title");
  document.getElementById("addBtn").innerText = t("add");
  document.getElementById("optClient").innerText = t("client");
  document.getElementById("optDriver").innerText = t("driver");
}

applyTranslations();

