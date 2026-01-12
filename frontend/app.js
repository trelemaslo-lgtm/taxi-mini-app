const tg = window.Telegram.WebApp;
tg.expand();

const API = "https://taxi-backend-5kl2.onrender.com";
let currentTab = "drivers";

/* START */
window.onload = () => {
  setTimeout(() => {
    document.getElementById("loader").style.display = "none";
    document.getElementById("app").classList.remove("hidden");
    loadAds();
  }, 1200);
};

function switchTab(tab) {
  currentTab = tab;
  document.querySelectorAll(".tab").forEach(b => b.classList.remove("active"));
  event.target.classList.add("active");
  loadAds();
}

function loadAds() {
  fetch(API + "/api/ads")
    .then(r => r.json())
    .then(data => {
      const box = document.getElementById("ads");
      box.innerHTML = "";

      data.forEach(a => {
        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `
          <b>${a.route}</b><br>
          🚗 ${a.car || ""}<br>
          👥 ${a.seats} мест<br>
          💰 ${a.price}<br>
          📞 <a href="tel:${a.phone}" style="color:#ffd400">${a.phone}</a>
        `;
        box.appendChild(card);
      });
    });
}

/* CREATE */
function openCreate() {
  document.getElementById("createSheet").classList.remove("hidden");
}
function closeCreate() {
  document.getElementById("createSheet").classList.add("hidden");
}

function publish() {
  fetch(API + "/api/ads", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      route: route.value,
      car: car.value,
      seats: seats.value,
      price: price.value,
      phone: phone.value,
      role: currentTab
    })
  }).then(() => {
    closeCreate();
    loadAds();
  });
}

/* SETTINGS */
function openSettings() {
  document.getElementById("settings").classList.remove("hidden");
}
function closeSettings() {
  document.getElementById("settings").classList.add("hidden");
}
function setLang(l) {
  alert("Язык переключён: " + l);
}

