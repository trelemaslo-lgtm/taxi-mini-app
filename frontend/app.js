const tg = window.Telegram.WebApp;
tg.expand();

const API_URL = "https://taxi-backend-5kl2.onrender.com"; // 🔴 ПРОВЕРЬ URL

// --- ЯЗЫКИ ---
const translations = {
  ru: {
    title: "📢 Объявления",
    add: "➕ Разместить объявление",
    client: "Клиент",
    driver: "Водитель",
    route: "Маршрут",
    time: "Время",
    price: "Цена",
    send: "Опубликовать",
    call_driver: "📞 Позвонить водителю",
    call_client: "📞 Позвонить клиенту"
  },
  uz: {
    title: "📢 E’lonlar",
    add: "➕ E’lon joylash",
    client: "Mijoz",
    driver: "Haydovchi",
    route: "Yo‘nalish",
    time: "Vaqt",
    price: "Narx",
    send: "Joylash",
    call_driver: "📞 Haydovchiga qo‘ng‘iroq",
    call_client: "📞 Mijozga qo‘ng‘iroq"
  },
  uzc: {
    title: "📢 Эълонлар",
    add: "➕ Эълон жойлаш",
    client: "Мижоз",
    driver: "Ҳайдовчи",
    route: "Йўналиш",
    time: "Вақт",
    price: "Нарх",
    send: "Жойлаш",
    call_driver: "📞 Ҳайдовчига қўнғироқ",
    call_client: "📞 Мижозга қўнғироқ"
  }
};

// --- ЯЗЫК ИЗ TELEGRAM ---
let lang = "ru";
if (tg.initDataUnsafe?.user?.language_code === "uz") {
  lang = "uz";
}

function t(key) {
  return translations[lang][key] || key;
}

// --- ПЕРЕВОДЫ ---
document.getElementById("title").innerText = t("title");
document.getElementById("addBtn").innerText = t("add");
document.getElementById("optClient").innerText = t("client");
document.getElementById("optDriver").innerText = t("driver");
document.getElementById("sendBtn").innerText = t("send");

document.getElementById("route").placeholder = t("route");
document.getElementById("time").placeholder = t("time");
document.getElementById("price").placeholder = t("price");

// --- ПОКАЗ ФОРМЫ ---
document.getElementById("addBtn").onclick = () => {
  document.getElementById("form").style.display = "block";
};

// --- ЗАГРУЗКА ОБЪЯВЛЕНИЙ ---
function loadAds() {
  fetch(API_URL + "/api/ads")
    .then(r => r.json())
    .then(data => {
      const box = document.getElementById("ads");
      box.innerHTML = "";

      data.forEach(ad => {
        const callText = ad.role === "driver"
          ? t("call_driver")
          : t("call_client");

        box.innerHTML += `
          <div class="card">
            <b>${ad.role === "driver" ? "🚕 Водитель" : "🧍 Клиент"}</b><br>
            📍 ${ad.route}<br>
            ⏰ ${ad.time}<br>
            💰 ${ad.price}<br>
            📞 <a href="tel:${ad.phone}">${callText}</a>
          </div>
        `;
      });
    });
}

// --- ОТПРАВКА ОБЪЯВЛЕНИЯ ---
function sendAd() {
  fetch(API_URL + "/api/ads", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      initData: tg.initData,
      role: document.getElementById("role").value,
      route: document.getElementById("route").value,
      time: document.getElementById("time").value,
      price: document.getElementById("price").value,
      phone: document.getElementById("phone").value
    })
  }).then(() => {
    document.getElementById("form").style.display = "none";
    loadAds();
  });
}

loadAds();
