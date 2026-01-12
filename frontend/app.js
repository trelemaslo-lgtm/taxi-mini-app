console.log("APP JS LOADED");

document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM READY");

  const screens = document.querySelectorAll(".screen");
  console.log("Screens found:", screens.length);

  function showScreen(id) {
    console.log("Show:", id);
    screens.forEach(s => s.classList.remove("active"));

    const el = document.getElementById(id);
    if (!el) {
      console.error("NO SCREEN:", id);
      return;
    }

    el.classList.add("active");
  }

  window.selectRole = function(role) {
    console.log("ROLE:", role);
    showScreen("screen-profile");
  };

  document.querySelectorAll(".lang-btn").forEach(btn => {
    btn.onclick = () => {
      console.log("LANG:", btn.dataset.lang);
      showScreen("screen-role");
    };
  });
});
