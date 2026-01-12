/* =======================
   TELEGRAM INIT
======================= */
const tg = window.Telegram?.WebApp;
if (tg) {
  tg.ready();
  tg.expand();
}

/* =======================
   STATE + STORAGE
======================= */
const STORAGE_KEY = "ingichka_app_state";

let state = {
  lang: null,
  role: null,
  profile: null,
  ads: [],
  location: null
};

// load from storage
const saved = localStorage.getItem(STORAGE_KEY);
if (saved) state = JSON.parse(saved);

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

/* =======================
   SCREENS
======================= */
const screens = document.querySelectorAll(".screen");

function go(id) {
  screens.forEach(s => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

/* =======================
   LOADING FLOW
======================= */
setTimeout(() => {
  if (!state.lang) go("language");
  else if (!state.role) go("role");
  else if (!state.profile) go("profileSetup");
  else go("home");
}, 2000);

/* =======================
   LANGUAGE
======================= */
function setLang(l) {
  state.lang = l;
  saveState();
  go("role");
}

/* =======================
   ROLE
======================= */
function setRole(r) {
  state.role = r;
  saveState();
  go("profileSetup");
}

/* =======================
   PROFILE
======================= */
function saveProfile() {
  const name = document.getElementById("name").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const car = document.getElementById("car").value.trim();

  if (!name || !phone) {
    alert("Profilni to‘ldiring");
    return;
  }

  state.profile = {
    name,
    phone,
    car: state.role === "driver" ? car : "",
    rating: state.profile?.rating || 5
  };

  saveState();
  renderProfile();
  go("home");
}

function renderProfile() {
  if (!state.profile) return;
  document.getElementById("pName").innerText = state.profile.name;
  document.getElementById("pPhone").innerText = state.profile.phone;
  document.getElementById("pCar").innerText =
    state.role === "driver" ? state.profile.car : "";
}

/* =======================
   GEOLOCATION
======================= */
function requestLocation() {
  if (!navigator.geolocation) return;

  navigator.geolocation.getCurrentPosition(
    pos => {
      state.location = {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude
      };
      saveState();
      renderAds();
    },
    () => {
      state.location = null;
      saveState();
    }
  );
}
requestLocation();

function distanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/* =======================
   ADS
======================= */
function createAd() {
  if (state.role !== "driver") {
    alert("Faqat haydovchi e’lon joylaydi");
    return;
  }

  const from = prompt("Qayerdan?");
  const to = prompt("Qayerga?");
  const price = prompt("Narx?");
  const seats = prompt("Bo‘sh joylar?");

  if (!from || !to || !price) return;

  const ad = {
    id: Date.now(),
    from,
    to,
    price,
    seats,
    created: Date.now(),
    lat: state.location?.lat || null,
    lng: state.location?.lng || null
  };

  state.ads.push(ad);
  saveState();
  renderAds();
  go("home");
}

function renderAds() {
  const list = document.getElementById("adsList");
  if (!list) return;
  list.innerHTML = "";

  // auto delete 60 min
  state.ads = state.ads.filter(
    a => Date.now() - a.created < 60 * 60 * 1000
  );
  saveState();

  state.ads.forEach(ad => {
    let distText = "";
    if (state.location && ad.lat) {
      const km = distanceKm(
        state.location.lat,
        state.location.lng,
        ad.lat,
        ad.lng
      ).toFixed(1);
      distText = `📍 ${km} km`;
    }

    const div = document.createElement("div");
    div.className = "profile-card";
    div.innerHTML = `
      🚕 ${ad.from} → ${ad.to}<br>
      💰 ${ad.price}<br>
      🪑 ${ad.seats || "-"}<br>
      ${distText}<br>
      <a href="tel:${state.profile.phone}">📞 Qo‘ng‘iroq</a>
    `;
    list.appendChild(div);
  });
}

/* =======================
   INIT
======================= */
renderProfile();
renderAds();

