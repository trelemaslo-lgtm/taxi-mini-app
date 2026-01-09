// Telegram Mini App init
const tg = window.Telegram.WebApp;
tg.expand();

// 🔗 BACKEND URL (НЕ МЕНЯТЬ, ЕСЛИ РАБОТАЕТ)
const API = "https://taxi-backend-5kl2.onrender.com";

// Кнопка "Разместить объявление"
document.getElementById("addBtn").onclick = () => {
  document.getElementById("form").style.display = "block";
};

// Загрузка объявлений
function loadAds() {
  fetch(API + "/api/ads", { method: "GET" })
    .then(res => res.json())
    .then(data => {
      const box = document.getElementById("ads");
      box.innerHTML = "";

      if (data.length === 0) {
        box.innerHTML = "<p style='text-align:center;'>📭 Пока нет объявлений</p>";
        return;
      }

      data.reverse().forEach(ad => {
        box.innerHTML += `
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
      console.error("Ошибка загрузки объявлений:", err);
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
    mode: "cors",
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
      document.getElementById("form").style.display = "none";
      loadAds();
    })
    .catch(err => {
      alert("Ошибка публикации ❌");
      console.error("POST error:", err);
    });
}

// Загружаем объявления при старте
loadAds();

