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

