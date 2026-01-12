/***********************
 * CONFIG
 ***********************/
const AD_LIFE_MIN = 30;

/***********************
 * GLOBAL STATE
 ***********************/
let currentLang = localStorage.getItem("lang");
let role = localStorage.getItem("role");
let profile = JSON.parse(localStorage.getItem("profile") || "null");
let userLocation = null;

/***********************
 * START APP
 ***********************/
window.onload = () => {
  getUserLocation();

  setTimeout(() => {
    hide("loading-screen");

    if (!currentLang) return show("lang-screen");
    if (!role) return show("role-screen");
    if (!profile) return show("profile-form-screen");

    show("main-screen");
    show("bottom-nav");
  }, 1000);
};

/***********************
 * BASIC HELPERS
 ***********************/
function show(id) {
  document.getElementById(id).classList.remove("hidden");
}
function hide(id) {
  document.getElementById(id).classList.add("hidden");
}

/***********************
 * LANGUAGE
 ***********************/
function setLang(lang) {
  currentLang = lang;
  localStorage.setItem("lang", lang);
  hide("lang-screen");
  show("role-screen");
}

/***********************
 * ROLE
 ***********************/
function selectRole(r) {
  role = r;
  localStorage.setItem("role", r);
  hide("role-screen");
  show("profile-form-screen");
}

/***********************
 * PROFILE
 ***********************/
function saveProfile() {
  profile = {
    name: document.getElementById("pf-name").value,
    phone: document.getElementById("pf-phone").value,
    car: document.getElementById("pf-car").value,
    role: role,
    points: profile?.points || 0
  };

  localStorage.setItem("profile", JSON.stringify(profile));

  hide("profile-form-screen");
  show("main-screen");
  show("bottom-nav");
}

/***********************
 * NAVIGATION
 ***********************/
function navTo(screen) {
  document.querySelectorAll(".screen").forEach(s => s.classList.add("hidden"));
  show(screen + "-screen");

  if (screen === "ads") openAds();
  if (screen === "profile") openProfile();
}

/***********************
 * PROFILE VIEW
 ***********************/
function openProfile() {
  const p = JSON.parse(localStorage.getItem("profile"));
  if (!p) return;

  document.getElementById("profile-name").innerText = p.name;
  document.getElementById("profile-phone").innerText = p.phone;
  document.getElementById("profile-car").innerText = p.car || "-";

  const points = p.points || 0;
  document.getElementById("profile-rating").innerText = Math.min(5, points).toFixed(1);
  document.getElementById("profile-points").innerText = `(${points})`;
}

/***********************
 * GEOLOCATION
 ***********************/
function getUserLocation() {
  if (!navigator.geolocation) return;

  navigator.geolocation.getCurrentPosition(
    pos => {
      userLocation = {
        lat: pos.coords.latitude,
        lon: pos.coords.longitude
      };
      console.log("📍 Location:", userLocation);
    },
    err => {
      console.log("❌ Geo denied");
    },
    { enableHighAccuracy: true }
  );
}

/***********************
 * DISTANCE (HAVERSINE)
 ***********************/
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

/***********************
 * ADS
 ***********************/
function openAds() {
  getUserLocation();
  cleanupAds();

  show("ads-screen");
  showSkeleton();

  setTimeout(() => {
    renderAds();
    hideSkeleton();
  }, 800);
}

function renderAds() {
  let ads = JSON.parse(localStorage.getItem("ads") || "[]");
  const box = document.getElementById("ads-list");
  box.innerHTML = "";

  // sort by distance
  if (userLocation) {
    ads.sort((a, b) => {
      if (!a.lat || !b.lat) return 0;
      const da = distanceKm(userLocation.lat, userLocation.lon, a.lat, a.lon);
      const db = distanceKm(userLocation.lat, userLocation.lon, b.lat, b.lon);
      return da - db;
    });
  }

  ads.forEach(ad => {
    const div = document.createElement("div");
    div.className = "ad";

    let distText = "";
    if (userLocation && ad.lat) {
      const km = distanceKm(
        userLocation.lat,
        userLocation.lon,
        ad.lat,
        ad.lon
      ).toFixed(1);
      distText = `<span>📍 ${km} км от вас</span>`;
    }

    div.innerHTML = `
      <b>${ad.from || "Точка А"} → ${ad.to || "Точка Б"}</b>
      <span>💰 ${ad.price || "-"}</span>
      <span>🪑 ${ad.seats || "-"}</span>
      ${distText}
    `;

    box.appendChild(div);
  });

  box.classList.remove("hidden");
}

/***********************
 * CREATE AD (HELPER)
 ***********************/
function createAd(ad) {
  if (userLocation) {
    ad.lat = userLocation.lat;
    ad.lon = userLocation.lon;
  }

  ad.createdAt = Date.now();

  const ads = JSON.parse(localStorage.getItem("ads") || "[]");
  ads.unshift(ad);
  localStorage.setItem("ads", JSON.stringify(ads));
}

/***********************
 * AUTO DELETE ADS
 ***********************/
function cleanupAds() {
  const now = Date.now();
  let ads = JSON.parse(localStorage.getItem("ads") || "[]");

  ads = ads.filter(ad => {
    return (now - ad.createdAt) / 60000 <= AD_LIFE_MIN;
  });

  localStorage.setItem("ads", JSON.stringify(ads));
}

/***********************
 * SKELETON
 ***********************/
function showSkeleton() {
  document.getElementById("ads-skeleton").classList.remove("hidden");
  document.getElementById("ads-list").classList.add("hidden");
}

function hideSkeleton() {
  document.getElementById("ads-skeleton").classList.add("hidden");
}
