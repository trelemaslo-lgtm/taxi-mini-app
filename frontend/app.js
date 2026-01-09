/*************************
 * SAFE TELEGRAM INIT
 *************************/
let tg = null;
if (window.Telegram && window.Telegram.WebApp) {
  tg = window.Telegram.WebApp;
  tg.expand();
}

/*************************
 * BACKEND URL
 *************************/
const API = "https://taxi-backend-5kl2.onrender.com";

/*************************
 * DOM
 *************************/
const addBtn = document.getElementById("addBtn");
const form = document.getElementById("form");
const adsBox = document.getElementById("ads");

/*************************
 * SHOW FORM
 *************************/
addBtn.onclick = () => {
  form.style.display = "block";
};

/*************************
 * LOAD ADS
 *************************/
function loadAds() {
  fetch(API + "/api/ads")
    .then(r => r.text())
    .then(text => {
      let data = [];
      try {
        data = JSON.parse(text);
      } catch {
        data = [];
      }

      adsBox.innerHTML = "";

      if (!data.length) {
        adsBox.innerHTML = "<p style='text-align:center;'>📭 Пока нет объявлений</p>";
        return;
      }

      data.reverse().forEach(ad => {
        adsBox.innerHTML += `
          <div class="card">
            <b>${ad.role === "driver" ? "🚕 Водитель" : "👤 Клиент"}</b><br>
            📍 ${ad.route || "-"}<br>
            ⏰ ${ad.time || "-"}<br>
            🚕 ${ad.seats || "-"}<br>
            💰 ${ad.price || "-"}<br>
            📞 <a href="tel:${ad.phone}" style="color:#ffd400;">Позвонить</a>
          </div>
        `;
      });
    })
    .catch(() => {
      adsBox.innerHTML = "<p style='text-align:center;'>⚠️ Ошибка загрузки</p>";
    });
}

/*************************
 * SEND AD (ULTRA SAFE)
 *************************/
function sendAd() {
  const role = document.getElementById("role").value;
  const route = document.getElementById("route").value;
  const time = document.getElementById("time").value;
  const seats = document.getElementById("seats").value;
  const price = document.getElementById("price").value;
  const phone = document.getElementById("phone").value;

  if (!route || !price || !phone) {
    tg ? tg.showAlert("❗ Заполни все поля") : alert("Заполни все поля");
    return;
  }

  tg?.HapticFeedback?.impactOccurred("medium");

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
    .then(() => {
      form.style.display = "none";
      loadAds();
      tg?.showAlert("✅ Объявление опубликовано");
    })
    .catch(() => {
      tg ? tg.showAlert("❌ Ошибка публикации") : alert("Ошибка публикации");
    });
}

/*************************
 * EXPORT
 *************************/
window.sendAd = sendAd;

/*************************
 * START
 *************************/
loadAds();

