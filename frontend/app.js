/*************************************************
 * INGICHKA TAKSI — MONOLITH APP.JS (VARIANT B)
 * Full logic, defensive, no crashes
 *************************************************/

(function () {
  "use strict";

  /***********************
   * SAFE HELPERS
   ***********************/
  const $ = (id) => document.getElementById(id);
  const log = (...a) => console.log("🚕", ...a);

  /***********************
   * TELEGRAM INIT
   ***********************/
  try {
    if (window.Telegram && Telegram.WebApp) {
      Telegram.WebApp.ready();
      Telegram.WebApp.expand();
    }
  } catch (e) {
    log("Telegram API not available");
  }

  /***********************
   * STORAGE
   ***********************/
  const STORAGE_KEY = "ingichka_taxi_state";

  const defaultState = {
    profile: null,
    ads: [],
    location: null
  };

  let state = defaultState;

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) state = JSON.parse(saved);
  } catch {
    state = defaultState;
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {}
  }

  /***********************
   * SCREENS
   ***********************/
  const screens = [
    "screen-home",
    "screen-add",
    "screen-profile",
    "screen-settings"
  ];

  function showScreen(id) {
    screens.forEach(s => {
      const el = $(s);
      if (el) el.style.display = "none";
    });
    const target = $(id);
    if (target) target.style.display = "block";
  }

  /***********************
   * LOADER → APP
   ***********************/
  document.addEventListener("DOMContentLoaded", () => {
    const loader = $("loader");
    const app = $("app");

    if (!loader || !app) {
      alert("HTML structure error");
      return;
    }

    setTimeout(() => {
      loader.style.display = "none";
      app.style.display = "block";
      showScreen("screen-home");
      renderProfile();
      renderAds();
      requestLocation();
    }, 1200);
  });

  /***********************
   * NAVIGATION
   ***********************/
  const navMap = {
    "nav-home": "screen-home",
    "nav-add": "screen-add",
    "nav-profile": "screen-profile",
    "nav-settings": "screen-settings"
  };

  Object.keys(navMap).forEach(btnId => {
    const btn = $(btnId);
    if (btn) {
      btn.onclick = () => showScreen(navMap[btnId]);
    }
  });

  /***********************
   * PROFILE
   ***********************/
  window.saveProfile = function () {
    const name = $("profile-name")?.value?.trim();
    const phone = $("profile-phone")?.value?.trim();
    const car = $("profile-car")?.value?.trim();

    if (!name || !phone) {
      alert("Заполните профиль");
      return;
    }

    state.profile = {
      name,
      phone,
      car: car || "",
      rating: state.profile?.rating || 5
    };

    saveState();
    renderProfile();
    showScreen("screen-home");
  };

  function renderProfile() {
    if (!state.profile) return;

    if ($("p-name")) $("p-name").innerText = state.profile.name;
    if ($("p-phone")) $("p-phone").innerText = state.profile.phone;
    if ($("p-car")) $("p-car").innerText = state.profile.car;
    if ($("p-rating")) $("p-rating").innerText = state.profile.rating;
  }

  /***********************
   * GEOLOCATION
   ***********************/
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
      () => {}
    );
  }

  function distanceKm(a, b, c, d) {
    const R = 6371;
    const dLat = (c - a) * Math.PI / 180;
    const dLon = (d - b) * Math.PI / 180;
    const x =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(a * Math.PI / 180) *
      Math.cos(c * Math.PI / 180) *
      Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
  }

  /***********************
   * ADS
   ***********************/
  window.createAd = function () {
    const from = prompt("Точка A");
    const to = prompt("Точка B");
    const price = prompt("Цена");
    const seats = prompt("Свободные места");

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
    showScreen("screen-home");
  };

  function renderAds() {
    const list = $("ads-list");
    if (!list) return;

    list.innerHTML = "";

    const now = Date.now();
    state.ads = state.ads.filter(a => now - a.created < 60 * 60 * 1000);
    saveState();

    if (state.ads.length === 0) {
      list.innerHTML = "<p style='opacity:.6'>Объявлений нет</p>";
      return;
    }

    state.ads.forEach(ad => {
      let dist = "";
      if (state.location && ad.lat) {
        dist = distanceKm(
          state.location.lat,
          state.location.lng,
          ad.lat,
          ad.lng
        ).toFixed(1) + " км";
      }

      const div = document.createElement("div");
      div.className = "ad-card";
      div.innerHTML = `
        <b>${ad.from} → ${ad.to}</b><br>
        💰 ${ad.price}<br>
        🪑 ${ad.seats || "-"}<br>
        ${dist}<br>
        <a href="tel:${state.profile?.phone || ""}">📞 Позвонить</a>
      `;
      list.appendChild(div);
    });
  }

})();
