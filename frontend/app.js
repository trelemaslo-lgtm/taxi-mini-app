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
  fetch(API + "/api/ads", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({
      role: role.value,
      route: route.value,
      time: time.value,
      seats: seats.value,
      price: price.value,
      phone: phone.value
    })
  }).then(() => {
    document.getElementById("form").style.display = "none";
    loadAds();
  });
}

loadAds();
