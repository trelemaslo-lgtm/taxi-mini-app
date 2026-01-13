console.log("APP JS LOADED ✅");

document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM READY ✅");

  // Telegram WebApp safe init
  try {
    if (window.Telegram && Telegram.WebApp) {
      Telegram.WebApp.ready();
      Telegram.WebApp.expand();
    }
  } catch (e) {
    console.log("Telegram init skipped");
  }

  const loading = document.getElementById("loading");
  const app = document.getElementById("app");

  if (!loading || !app) {
    alert("HTML ERROR: loading/app not found");
    return;
  }

  const screens = document.querySelectorAll(".screen");

  function showScreen(id) {
    screens.forEach(s => s.classList.remove("active"));
    const el = document.getElementById(id);
    if (!el) {
      console.error("Screen not found:", id);
      return;
    }
    el.classList.add("active");
  }

  window.showScreen = showScreen;

  // ===== SETTINGS FUNCTIONS =====
  window.goToLanguage = function () {
    showScreen("screen-language");
  };

  window.goToAbout = function () {
    showScreen("screen-about");
  };

  window.supportCreators = function () {
    alert("💛 Donat: 711 GROUP\nKeyin Click/Payme qo‘shamiz");
  };

  // ===== GEOLOCATION =====
  window.requestLocation = function () {
    if (!navigator.geolocation) {
      alert("Geolokatsiya qo‘llab-quvvatlanmaydi");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        localStorage.setItem("geo", JSON.stringify({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        }));

        const geoStatus = document.getElementById("geo-status");
        if (geoStatus) geoStatus.innerText = "✅ Geo: yoqilgan";

        alert("✅ Geolokatsiya yoqildi");
      },
      () => {
        const geoStatus = document.getElementById("geo-status");
        if (geoStatus) geoStatus.innerText = "❌ Geo: ruxsat berilmadi";
        alert("❌ Geolokatsiya ruxsat berilmadi");
      }
    );
  };

  // ===== PROFILE FUNCTIONS =====
  window.saveProfile = function () {
    try {
      const name = document.getElementById("profile-name").value.trim();
      const phone = document.getElementById("profile-phone").value.trim();
      const car = document.getElementById("profile-car").value.trim();
      const role = localStorage.getItem("role");

      if (!name || !phone) {
        alert("Iltimos ism va telefon kiriting");
        return;
      }

      const profile = { name, phone, role };
      if (role === "driver") profile.car = car;

      localStorage.setItem("profile", JSON.stringify(profile));
      renderProfile();
      showScreen("screen-home");
    } catch (e) {
      console.error("saveProfile error:", e);
      alert("Profile save error");
    }
  };

  function renderProfile() {
    const data = localStorage.getItem("profile");
    if (!data) return;

    const profile = JSON.parse(data);

    const view = document.getElementById("profile-view");
    if (!view) return;

    document.getElementById("view-name").innerText = profile.name;
    document.getElementById("view-phone").innerText = profile.phone;

    const wrap = document.getElementById("view-car-wrap");
    if (profile.role === "driver" && profile.car) {
      document.getElementById("view-car").innerText = profile.car;
      wrap.style.display = "block";
    } else {
      wrap.style.display = "none";
    }

    // hide inputs after save
    document.getElementById("profile-name").style.display = "none";
    document.getElementById("profile-phone").style.display = "none";
    document.getElementById("profile-car").style.display = "none";

    view.style.display = "block";
  }

  window.editProfile = function () {
    document.getElementById("profile-view").style.display = "none";

    document.getElementById("profile-name").style.display = "block";
    document.getElementById("profile-phone").style.display = "block";

    const role = localStorage.getItem("role");
    document.getElementById("profile-car").style.display =
      role === "driver" ? "block" : "none";
  };

  // ===== ROLE FUNCTION =====
  window.selectRole = function (role) {
    console.log("ROLE SELECTED:", role);
    localStorage.setItem("role", role);

    const carInput = document.getElementById("profile-car");
    if (carInput) carInput.style.display = role === "driver" ? "block" : "none";

    showScreen("screen-profile");
  };

  // ===== LANGUAGE BUTTONS =====
  document.querySelectorAll(".lang-btn").forEach(btn => {
    btn.onclick = () => {
      const lang = btn.dataset.lang;
      console.log("LANG SELECTED:", lang);
      localStorage.setItem("lang", lang);
      showScreen("screen-role");
    };
  });

  // ===== NAVIGATION =====
  document.getElementById("btn-home").onclick = () => showScreen("screen-home");
  document.getElementById("btn-add").onclick = () => showScreen("screen-add");
  document.getElementById("btn-profile").onclick = () => {
    showScreen("screen-profile");
    renderProfile();
  };
  document.getElementById("btn-settings").onclick = () => showScreen("screen-settings");

  // ===== INIT FLOW =====
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
  }, 1000);
});
