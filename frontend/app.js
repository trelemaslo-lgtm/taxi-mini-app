/***********************
 * Telegram Mini App
 ***********************/
let tg = null;
if (window.Telegram && window.Telegram.WebApp) {
  tg = window.Telegram.WebApp;
  tg.expand();
}

/***********************
 * Backend URL
 ***********************/
const API = "https://taxi-backend-5kl2.onrender.com";

/***********************
 * DOM elements
 ***********************/
const addBtn = document.getElementById("addBtn");
const form = document.getElementById("form");
const adsBox = document.getElementById("ads");

/***********************
 * Show form
 ***********************/
addBtn.onclick = () => {
  form.style.display = "block";
};

/***********************
 * Load ads
 ***********************/
function loadAds() {
  fetch(API + "/api/ads")
    .then(res => res.json())
    .then(data => {
      adsBox.innerHTML = "";

      if (!Array.isArray(data) || data.length === 0) {
        adsBox.innerHTML = "<p style='text-align:center;'>📭 Пока нет объявлений</p>";
        return;
      }

      data.slice().reverse().forEach(ad => {
        adsBox.innerHTML += `
          <div class="card">
            <div><b>${ad.role === "driver" ? "🚕 Водитель" : "👤 Клиент"}</b></div>
            <div>📍 ${ad.route || "-"}</div>
            <div>⏰ ${ad.time || "-"}</div>
            <div>🚕 ${ad.seats || "-"}</div>
            <div>💰 ${ad.price || "-"}</div>
            <div>
              📞 <a href="tel:${ad.phone}" style="color:#ffd400;">Позвонить</a>
            </div>
          </div>
        `;
      });
    })
    .catch(err => {
      console.error("Ошибка загрузки объявлений:", err);
    });
}

/***********************
 * Send ad
 ***********************/
function sendAd() {
  const role = document.getElementById("role").value;
  const route = document.getElementById("route").value;
  const time = document.getElementById("time").value;
  const seats = document.getElementById("seats").value;
  const price = document.getElementById("price").value;
  const phone = document.getElementById("phone").value;

  if (!route || !price || !phone) {
    if (tg) tg.showAlert("❗ Заполни все поля");
    else alert("Заполни все поля");
    return;
  }

  // Telegram feedback (разрешённое действие)
  if (tg && tg.HapticFeedback) {
    tg.HapticFeedback.impactOccurred("medium");
  }

  fetch(API + "/api/ads", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
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

      if (tg) {
        tg.showAlert("✅ Объявление опубликовано");
      }
    })
    .catch(err => {
      console.error("POST error:", err);
      if (tg) {
        tg.showAlert("❌ Ошибка публикации");
      } else {
        alert("Ошибка публикации");
      }
    });
}

/***********************
 * Make function global
 ***********************/
window.sendAd = sendAd;

/***********************
 * Start app
 ***********************/
loadAds();
