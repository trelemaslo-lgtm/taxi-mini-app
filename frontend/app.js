// Безопасная инициализация Telegram WebApp
let tg = null;
if (window.Telegram && window.Telegram.WebApp) {
  tg = window.Telegram.WebApp;
  tg.expand();
}

// Backend URL
const API = "https://taxi-backend-5kl2.onrender.com";

// DOM elements
const addBtn = document.getElementById("addBtn");
const form = document.getElementById("form");
const adsBox = document.getElementById("ads");

// Показ формы
addBtn.onclick = () => {
  form.style.display = "block";
};

// Загрузка объявлений
function loadAds() {
  fetch(API + "/api/ads")
    .then(res => res.json())
    .then(data => {
      adsBox.innerHTML = "";

      if (!data || data.length === 0) {
        adsBox.innerHTML = "<p style='text-align:center;'>📭 Пока нет объявлений</p>";
        return;
      }

      data.reverse().forEach(ad => {
        adsBox.innerHTML += `
          <div class="card">
            <b>${ad.role === "driver" ? "🚕 Водитель" : "👤 Клиент"}</b><br>
            📍 ${ad.route}<br>
            ⏰ ${ad.time}<br>
            🚕 ${ad.seats}<br>
            💰 ${ad.price}<br>
            📞 <a href="tel:${ad.phone}" style="color:#ffd400;">Позвонить</a>
          </div>
        `;
      });
    })
    .catch(err => {
      console.error("Ошибка загрузки:", err);
    });
}

// Отправка объявления
function sendAd() {
  const role = document.getElementById("role").value;
  const route = document.getElementById("route").value;
  const time = document.getElementById("time").value;
  const seats = document.getElementById("seats").value;
  const price = document.getElementById("price").value;
  const phone = document.getElementById("phone").value;

  if (!route || !price || !phone) {
    alert("Заполни все поля ❗");
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
      phone
    })
  })
    .then(res => {
      if (!res.ok) throw new Error("POST failed");
      return res.json();
    })
    .then(() => {
      form.style.display = "none";
      loadAds();
    })
    .catch(err => {
      alert("Ошибка публикации ❌");
      console.error(err);
    });
}

// Глобально, чтобы HTML видел функцию
window.sendAd = sendAd;

// Старт
loadAds();


