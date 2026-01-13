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
  console.log("Screens found:", screens.length);

  function showScreen(id) {
    screens.forEach(s => s.classList.remove("active"));
    const el = document.getElementById(id);
    if (!el) {
      console.error("Screen not found:", id);
      return;
    }
    el.classList.add("active");
  }

  // ====== PROFILE FUNCTIONS (GLOBAL) ======
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
    document.getElementById("profile-car").style.display =
      localStorage.getItem("role") === "driver" ? "none" : "none";

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

  // ====== ROLE FUNCTION (GLOBAL) ======
  window.selectRole = function (role) {
    console.log("ROLE SELECTED:", role);
    localStorage.setItem("role", role);
    showScreen("screen-profile");

    // show/hide car input depending on role
    const carInput = document.getElementById("profile-car");
    if (carInput) carInput.style.display = role === "driver" ? "block" : "none";
  };

  // ====== LANGUAGE BUTTONS ======
  document.querySelectorAll(".lang-btn").forEach(btn => {
    btn.onclick = () => {
      const lang = btn.dataset.lang;
      console.log("LANG SELECTED:", lang);
      localStorage.setItem("lang", lang);
      showScreen("screen-role");
    };
  });

  // ===== NAVIGATION (BOTTOM BAR) =====
  const homeBtn = document.getElementById("btn-home");
  const addBtn = document.getElementById("btn-add");
  const profileBtn = document.getElementById("btn-profile");
  const settingsBtn = document.getElementById("btn-settings");

  if (homeBtn) homeBtn.onclick = () => showScreen("screen-home");
  if (addBtn) addBtn.onclick = () => showScreen("screen-add");
   if (profileBtn) profileBtn.onclick = () => {
    showScreen("screen-profile");
    renderProfile();
  };
  if (settingsBtn) settingsBtn.onclick = () => showScreen("screen-settings");

  // ====== INIT FLOW ======
  setTimeout(() => {
    console.log("HIDE LOADING ✅");
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
