document.addEventListener("DOMContentLoaded", () => {
  console.log("APP STARTED");

  // Telegram init (без ошибок, даже если не Telegram)
  if (window.Telegram && Telegram.WebApp) {
    Telegram.WebApp.ready();
    Telegram.WebApp.expand();
  }

  const loading = document.getElementById("loading");
  const app = document.getElementById("app");

  // Защита
  if (!loading || !app) {
    alert("HTML структура сломана");
    return;
  }

  // Имитируем загрузку
  setTimeout(() => {
    loading.style.display = "none";
    app.style.display = "block";
    console.log("APP SHOWN");
  }, 1200);
});
