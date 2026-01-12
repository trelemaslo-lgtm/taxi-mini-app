console.log("APP JS LOADED");

document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM READY");

  if (window.Telegram && Telegram.WebApp) {
    Telegram.WebApp.ready();
    Telegram.WebApp.expand();
  }

  const loading = document.getElementById("loading");
  const app = document.getElementById("app");
  const screens = document.querySelectorAll(".screen");

  function showScreen(id) {
    screens.forEach(s => s.classList.remove("active"));
    const el = document.getElementById(id);
    if (el) el.classList.add("active");
  }

  // INIT
  setTimeout(() => {
    loading.style.display = "none";
    app.style.display = "block";

    if (!localStorage.getItem("lang")) {
      showScreen("screen-language");
    } else if (!localStorage.getItem("role")) {
      showScreen("screen-role");
    } else {
      showScreen("screen-home");
    }
  }, 1000);

  // LANGUAGE
  document.querySelectorAll(".lang-btn").forEach(btn => {
    btn.onclick = () => {
      localStorage.setItem("lang", btn.dataset.lang);
      showScreen("screen-role");
    };
  });

  // ROLE
  window.selectRole = function(role) {
    localStorage.setItem("role", role);
    showScreen("screen-home");
  };

  // NAV
  document.getElementById("btn-home").onclick = () => showScreen("screen-home");
  document.getElementById("btn-add").onclick = () => showScreen("screen-add");
  document.getElementById("btn-profile").onclick = () => showScreen("screen-profile");
  document.getElementById("btn-settings").onclick = () => showScreen("screen-settings");
});
// ===== PROFILE LOGIC =====
function saveProfile() {
  const name = document.getElementById("profile-name").value.trim();
  const phone = document.getElementById("profile-phone").value.trim();
  const car = document.getElementById("profile-car").value.trim();
  const role = localStorage.getItem("role");

  if (!name || !phone) {
    alert("Iltimos, ism va telefonni kiriting");
    return;
  }

  const profile = { name, phone, role };

  if (role === "driver") {
    profile.car = car;
  }

  localStorage.setItem("profile", JSON.stringify(profile));
  renderProfile();
  showScreen("screen-home");
}

function renderProfile() {
  const data = localStorage.getItem("profile");
  if (!data) return;

  const profile = JSON.parse(data);

  document.getElementById("profile-name").style.display = "none";
  document.getElementById("profile-phone").style.display = "none";
  document.getElementById("profile-car").style.display = "none";

  document.getElementById("profile-view").style.display = "block";

  document.getElementById("view-name").innerText = profile.name;
  document.getElementById("view-phone").innerText = profile.phone;

  if (profile.role === "driver" && profile.car) {
    document.getElementById("view-car").innerText = profile.car;
    document.getElementById("view-car-wrap").style.display = "block";
  } else {
    document.getElementById("view-car-wrap").style.display = "none";
  }
}

function editProfile() {
  document.getElementById("profile-view").style.display = "none";

  document.getElementById("profile-name").style.display = "block";
  document.getElementById("profile-phone").style.display = "block";

  const role = localStorage.getItem("role");
  document.getElementById("profile-car").style.display =
    role === "driver" ? "block" : "none";
}
