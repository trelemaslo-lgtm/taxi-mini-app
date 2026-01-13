console.log("APP JS LOADED ✅");

document.addEventListener("DOMContentLoaded", () => {
  try {
    if (window.Telegram && Telegram.WebApp) {
      Telegram.WebApp.ready();
      Telegram.WebApp.expand();
    }
  } catch {}

  const loading = document.getElementById("loading");
  const app = document.getElementById("app");
  const screens = document.querySelectorAll(".screen");

  function showScreen(id) {
    screens.forEach(s => s.classList.remove("active"));
    const el = document.getElementById(id);
    if (el) el.classList.add("active");
  }
  window.showScreen = showScreen;

  // ===== SETTINGS =====
  window.goToLanguage = () => showScreen("screen-language");
  window.goToAbout = () => showScreen("screen-about");
  window.supportCreators = () => alert("💛 Donat: 711 GROUP\nKeyin Click/Payme qo‘shamiz");

  // ===== GEO =====
  window.requestLocation = function () {
    if (!navigator.geolocation) return alert("Geo yo‘q");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        localStorage.setItem("geo", JSON.stringify({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        }));
        const st = document.getElementById("geo-status");
        if (st) st.innerText = "✅ Geo: yoqilgan";
        renderAds();
      },
      () => {
        const st = document.getElementById("geo-status");
        if (st) st.innerText = "❌ Geo: ruxsat yo‘q";
      }
    );
  };

  function getGeo() {
    try { return JSON.parse(localStorage.getItem("geo")); }
    catch { return null; }
  }

  // ===== LANGUAGE =====
  document.querySelectorAll(".lang-btn").forEach(btn => {
    btn.onclick = () => {
      localStorage.setItem("lang", btn.dataset.lang);
      showScreen("screen-role");
    };
  });

  // ===== ROLE =====
  window.selectRole = function(role) {
    localStorage.setItem("role", role);
    const carInput = document.getElementById("profile-car");
    if (carInput) carInput.style.display = role === "driver" ? "block" : "none";
    showScreen("screen-profile");
  };

  // ===== PROFILE =====
  window.saveProfile = function () {
    const name = document.getElementById("profile-name").value.trim();
    const phone = document.getElementById("profile-phone").value.trim();
    const car = document.getElementById("profile-car").value.trim();
    const role = localStorage.getItem("role");

    if (!name || !phone) {
      alert("Ism va telefon shart!");
      return;
    }

    const profile = { name, phone, role, rating: 5 };
    if (role === "driver") profile.car = car;

    localStorage.setItem("profile", JSON.stringify(profile));
    renderProfile();
    showScreen("screen-home");
    renderAds();
  };

  function renderProfile() {
    const data = localStorage.getItem("profile");
    if (!data) return;

    const profile = JSON.parse(data);

    document.getElementById("view-name").innerText = profile.name;
    document.getElementById("view-phone").innerText = profile.phone;
    document.getElementById("view-rating").innerText = profile.rating;

    const wrap = document.getElementById("view-car-wrap");
    if (profile.role === "driver" && profile.car) {
      document.getElementById("view-car").innerText = profile.car;
      wrap.style.display = "block";
    } else {
      wrap.style.display = "none";
    }

    document.getElementById("profile-name").style.display = "none";
    document.getElementById("profile-phone").style.display = "none";
    document.getElementById("profile-car").style.display = "none";
    document.getElementById("profile-view").style.display = "block";
  }

  window.editProfile = function () {
    document.getElementById("profile-view").style.display = "none";
    document.getElementById("profile-name").style.display = "block";
    document.getElementById("profile-phone").style.display = "block";

    const role = localStorage.getItem("role");
    document.getElementById("profile-car").style.display =
      role === "driver" ? "block" : "none";
  };

  // ===== ADS TAB =====
  let adsTab = "driver";
  window.setAdsTab = function(tab) {
    adsTab = tab;
    document.getElementById("tab-driver").classList.toggle("active", tab === "driver");
    document.getElementById("tab-client").classList.toggle("active", tab === "client");
    renderAds();
  };

  function loadAds() {
    try { return JSON.parse(localStorage.getItem("ads")) || []; }
    catch { return []; }
  }

  function saveAds(arr) {
    localStorage.setItem("ads", JSON.stringify(arr));
  }

  // ===== CREATE AD (FIXED) =====
  window.createAd = function () {
  const profileData = localStorage.getItem("profile");
  if (!profileData) {
    alert("❌ Avval profil to‘ldiring!");
    showScreen("screen-profile");
    return;
  }

  const profile = JSON.parse(profileData);
  const role = localStorage.getItem("role") || "driver";

  const fromEl = document.getElementById("ad-from");
  const toEl = document.getElementById("ad-to");
  const typeEl = document.getElementById("ad-type");
  const priceEl = document.getElementById("ad-price");
  const seatsEl = document.getElementById("ad-seats");

  if (!fromEl  !toEl  !typeEl  !priceEl  !seatsEl) {
    alert("❌ HTML id xato! inputlar topilmadi");
    return;
  }

  const from = fromEl.value.trim();
  const to = toEl.value.trim();
  const type = typeEl.value;
  const price = priceEl.value.trim();
  const seats = seatsEl.value.trim();

  if (!from || !to || !price) {
  alert("❌ Qayerdan, qayerga va narx shart!");
  return;
}

  let seatsNum = parseInt(seats || "0", 10);
  if (Number.isNaN(seatsNum)) seatsNum = 0;
  if (seatsNum > 4) seatsNum = 4;
  if (seatsNum < 0) seatsNum = 0;

  let geo = null;
  try { geo = JSON.parse(localStorage.getItem("geo")); } catch {}

  const ad = {
    id: Date.now(),
    kind: role,
    from,
    to,
    type,
    price,
    seats: seatsNum,
    name: profile.name,
    phone: profile.phone,
    car: profile.car || "",
    createdAt: Date.now(),
    lat: geo?.lat || null,
    lng: geo?.lng || null
  };

  const ads = JSON.parse(localStorage.getItem("ads") || "[]");
  ads.push(ad);
  localStorage.setItem("ads", JSON.stringify(ads));

  fromEl.value = "";
  toEl.value = "";
  priceEl.value = "";
  seatsEl.value = "";

  alert("✅ E’lon joylandi!");
  showScreen("screen-home");
  renderAds();
};
    } catch (e) {
      console.error("createAd ERROR:", e);
      alert("❌ Xatolik! Console ni tekshir");
    }
  };

  // ===== AUTO DELETE 60 MIN =====
  function filterExpired(ads) {
    const now = Date.now();
    return ads.filter(a => now - a.createdAt < 60 * 60 * 1000);
  }

  // ===== DISTANCE =====
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

  // ===== RENDER ADS =====
  function renderAds() {
    const box = document.getElementById("ads-list");
    const empty = document.getElementById("empty-ads");
    if (!box) return;

    let ads = filterExpired(loadAds());
    saveAds(ads);

    ads = ads.filter(a => a.kind === adsTab);

    const geo = getGeo();
    if (geo) {
      ads.forEach(a => {
        if (a.lat && a.lng) a.dist = distanceKm(geo.lat, geo.lng, a.lat, a.lng);
        else a.dist = 9999;
      });
      ads.sort((a, b) => a.dist - b.dist);
    }

    box.innerHTML = "";

    if (ads.length === 0) {
      if (empty) empty.style.display = "block";
      return;
    } else {
      if (empty) empty.style.display = "none";
    }

    ads.forEach(ad => {
      const div = document.createElement("div");
      div.className = "ad-card";

      const distText = (geo && ad.dist < 9999) ? 📍 ${ad.dist.toFixed(1)} km : "";

      div.innerHTML = `
        <div class="ad-title">${ad.from} → ${ad.to}</div>
        <div class="ad-row">👤 ${ad.name}</div>
        <div class="ad-row">🚗 ${ad.car || "-"}</div>
        <div class="ad-row">💰 ${ad.price}</div>
        <div class="ad-row">🪑 ${ad.seats}</div>
        <div class="ad-row">${distText}</div>

        <div class="ad-actions">
          <a class="call-btn" href="tel:${ad.phone}">📞 Qo‘ng‘iroq</a>
          <button class="msg-btn" onclick="sendTelegramMsg('${ad.phone}','${ad.name}')">💬 Telegram</button>
        </div>
      `;
      box.appendChild(div);
    });
  }
  window.renderAds = renderAds;

  window.sendTelegramMsg = function(phone, name) {
    alert("✅ Telegram xabar:\n" + name + "\n" + phone);
  };

  // ===== NAV =====
  document.getElementById("btn-home").onclick = () => { showScreen("screen-home"); renderAds(); };
  document.getElementById("btn-add").onclick = () => showScreen("screen-add");
  document.getElementById("btn-profile").onclick = () => { showScreen("screen-profile"); renderProfile(); };
  document.getElementById("btn-settings").onclick = () => showScreen("screen-settings");

  // ===== INIT =====
  setTimeout(() => {
    loading.style.display = "none";
    app.style.display = "block";

    const lang = localStorage.getItem("lang");
    const role = localStorage.getItem("role");
    const profile = localStorage.getItem("profile");

    if (!lang) return showScreen("screen-language");
    if (!role) return showScreen("screen-role");
    if (!profile) return showScreen("screen-profile");

    renderProfile();
    showScreen("screen-home");
    renderAds();
  }, 900);
});
