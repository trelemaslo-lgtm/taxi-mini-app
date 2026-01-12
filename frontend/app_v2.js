// === TELEGRAM INIT ===
const tg = window.Telegram.WebApp;
tg.expand();

// === CONFIG ===
const API = "https://taxi-backend-5kl2.onrender.com"; // ⚠️ ОБЯЗАТЕЛЬНО замени
const adsBox = document.getElementById("ads");
const btnDrivers = document.getElementById("btnDrivers");
const btnClients = document.getElementById("btnClients");
const loader = document.getElementById("loader");
const formOverlay = document.getElementById("formOverlay");

// === STATE ===
let currentTab = "driver";
let userLat = null;
let userLon = null;

// === TAB SWITCH ===
btnDrivers.onclick = () => switchTab("driver");
btnClients.onclick = () => switchTab("client");

function switchTab(role){
  currentTab = role;
  btnDrivers.classList.toggle("active", role === "driver");
  btnClients.classList.toggle("active", role === "client");
  loadAds();
}

// === LOADER CONTROL ===
function hideLoader(){
  if (!loader) return;
  loader.style.opacity = "0";
  setTimeout(() => {
    loader.style.display = "none";
  }, 400);
}

// === LOAD ADS (ANTI-FREEZE) ===
function loadAds(){
  let url = API + "/api/ads";
  if (userLat && userLon) {
    url += `?lat=${userLat}&lon=${userLon}`;
  }

  fetch(url)
    .then(r => {
      if (!r.ok) throw new Error("API error");
      return r.json();
    })
    .then(data => {
      adsBox.innerHTML = "";

      const filtered = data.filter(a => a.role === currentTab);

      if (filtered.length === 0) {
        adsBox.innerHTML = `
          <p style="opacity:.5;text-align:center;margin-top:40px">
            Пока нет объявлений
          </p>
        `;
      }

      filtered.forEach(a => {
        const d = document.createElement("div");
        d.className = "glass card";
        d.innerHTML = `
          <b>${a.name}</b> 🏆 ${a.points}<br>
          <small>${a.route}</small><br>
          ${a.distance ? `📍 ${a.distance} км<br>` : ""}
          💰 ${a.price || "-"} | 👥 ${a.seats || 0}<br>
          <div style="margin-top:6px">
            <button class="like" onclick="like(${a.id}, this)">👍</button>
            <a href="tel:${a.phone}" style="margin-left:10px">📞</a>
          </div>
        `;
        adsBox.appendChild(d);
      });
    })
    .catch(err => {
      console.error("LOAD ERROR:", err);
      adsBox.innerHTML = `
        <p style="color:#ff5c5c;text-align:center;margin-top:40px">
          Ошибка загрузки данных
        </p>
      `;
    })
    .finally(() => {
      hideLoader();
    });
}

// === GEOLOCATION (OPTIONAL) ===
if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(
    pos => {
      userLat = pos.coords.latitude;
      userLon = pos.coords.longitude;
      loadAds(); // перезагрузка с дистанцией
    },
    err => {
      console.log("Геолокация не получена");
    }
  );
}

// === FORM ===
function openForm(){
  formOverlay.classList.remove("hidden");
}
function closeForm(){
  formOverlay.classList.add("hidden");
}

function sendAd(){
  const data = {
    role: document.getElementById("role").value,
    name: document.getElementById("name").value,
    phone: document.getElementById("phone").value,
    route: document.getElementById("route").value,
    mode: document.getElementById("mode").value,
    price: document.getElementById("price").value,
    seats: document.getElementById("seats").value,
    comment: document.getElementById("comment").value,
    lat: userLat,
    lon: userLon
  };

  fetch(API + "/api/ads", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  })
    .then(r => {
      if (!r.ok) throw new Error("POST error");
      return r.json();
    })
    .then(() => {
      closeForm();
      loadAds();
    })
    .catch(err => {
      alert("Ошибка публикации");
      console.error(err);
    });
}

// === LIKE ===
function like(id, btn){
  btn.classList.add("liked");

  fetch(API + "/api/like", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ad_id: id,
      user_id: tg.initDataUnsafe?.user?.id || "anon"
    })
  })
    .then(() => {
      setTimeout(() => btn.classList.remove("liked"), 200);
      loadAds();
    })
    .catch(err => {
      console.error("LIKE ERROR:", err);
    });
}

// === FALLBACK: NEVER STUCK LOADING ===
setTimeout(() => {
  hideLoader();
}, 5000);

// === INITIAL LOAD ===
loadAds();
