const tg = window.Telegram.WebApp;
tg.expand();

const API = "https://taxi-backend-5kl2.onrender.com";

document.getElementById("addBtn").onclick = () => {
  document.getElementById("form").style.display = "block";
};

function loadAds() {
  fetch(API + "/api/ads")
    .then(r => r.json())
    .then(data => {
      const box = document.getElementById("ads");
      box.innerHTML = "";
      data.forEach(ad => {
        box.innerHTML += `
          <div class="card">
            <b>${ad.role === "driver" ? "🚕 Водитель" : "👤 Клиент"}</b><br>
            📍 ${ad.route}<br>
            ⏰ ${ad.time}<br>
            🚕 ${ad.seats}<br>
            💰 ${ad.price}<br>
            📞 <a style="color:#ffd400" href="tel:${ad.phone}">Позвонить</a>
          </div>
        `;
      });
    });
}

function sendAd() {
  const roleEl = document.getElementById("role");
  const routeEl = document.getElementById("route");
  const timeEl = document.getElementById("time");
  const seatsEl = document.getElementById("seats");
  const priceEl = document.getElementById("price");
  const phoneEl = document.getElementById("phone");

  fetch(API + "/api/ads", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      role: roleEl.value,
      route: routeEl.value,
      time: timeEl.value,
      seats: seatsEl.value,
      price: priceEl.value,
      phone: phoneEl.value
    })
  })
  .then(res => res.json())
  .then(() => {
    document.getElementById("form").style.display = "none";
    loadAds();
  })
  .catch(err => {
    alert("Ошибка публикации ❌");
    console.error(err);
  });
}
