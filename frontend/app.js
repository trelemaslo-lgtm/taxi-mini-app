function sendAd() {
  const role = document.getElementById("role").value;
  const route = document.getElementById("route").value;
  const time = document.getElementById("time").value;
  const seats = document.getElementById("seats").value;
  const price = document.getElementById("price").value;
  const phone = document.getElementById("phone").value;

  if (!route || !price || !phone) {
    alert("Заполни все поля ❗");
    return;
  }

  // 🔥 СООБЩАЕМ TELEGRAM, ЧТО ДЕЙСТВИЕ РАЗРЕШЕНО
  if (window.Telegram && window.Telegram.WebApp) {
    window.Telegram.WebApp.HapticFeedback.impactOccurred("medium");
  }

  fetch(API + "/api/ads", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      role,
      route,
      time,
      seats,
      price,
      phone
    })
  })
    .then(res => res.json())
    .then(() => {
      document.getElementById("form").style.display = "none";
      loadAds();

      // ✅ УСПЕХ — говорим Telegram
      if (window.Telegram && window.Telegram.WebApp) {
        window.Telegram.WebApp.showAlert("✅ Объявление опубликовано");
      }
    })
    .catch(err => {
      if (window.Telegram && window.Telegram.WebApp) {
        window.Telegram.WebApp.showAlert("❌ Ошибка публикации");
      } else {
        alert("Ошибка публикации ❌");
      }
      console.error(err);
    });
}
