const tg = window.Telegram?.WebApp;
if (tg) {
  tg.ready();
  tg.expand();
}

const screens = document.querySelectorAll('.screen');

const state = {
  lang: null,
  role: null,
  profile: {},
  ads: []
};

const i18n = {
  uz: {
    lang_title: "Tilni tanlang",
    role_title: "Rolni tanlang",
    driver: "Haydovchi",
    client: "Mijoz",
    profile_title: "Profil",
    name: "Ism Familiya",
    phone: "Telefon",
    car: "Avto raqam",
    continue: "Davom etish",
    ads: "E’lonlar",
    settings: "Sozlamalar",
    language: "Til",
    notifications: "Bildirishnomalar",
    donate: "Donat",
    about: "Biz haqimizda",
    about_text: "Lokal taksi xizmati kichik shaharlar uchun"
  },
  ru: {
    lang_title: "Выберите язык",
    role_title: "Выберите роль",
    driver: "Водитель",
    client: "Клиент",
    profile_title: "Профиль",
    name: "Имя Фамилия",
    phone: "Телефон",
    car: "Номер авто",
    continue: "Продолжить",
    ads: "Объявления",
    settings: "Настройки",
    language: "Язык",
    notifications: "Уведомления",
    donate: "Донат",
    about: "О нас",
    about_text: "Локальный сервис такси для небольших городов"
  },
  uzk: {
    lang_title: "Тилни танланг",
    role_title: "Ролни танланг",
    driver: "Ҳайдовчи",
    client: "Мижоз",
    profile_title: "Профил",
    name: "Исм Фамилия",
    phone: "Телефон",
    car: "Авто рақам",
    continue: "Давом этиш",
    ads: "Эълонлар",
    settings: "Созламалар",
    language: "Тил",
    notifications: "Билдиришномалар",
    donate: "Донат",
    about: "Биз ҳақимизда",
    about_text: "Кичик шаҳарлар учун локал такси хизмати"
  }
};

function go(id) {
  screens.forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

setTimeout(() => go('language'), 2200);

function applyLang() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.innerText = i18n[state.lang][el.dataset.i18n];
  });
  document.querySelectorAll('[data-i18n-ph]').forEach(el => {
    el.placeholder = i18n[state.lang][el.dataset.i18nPh];
  });
}

function setLang(l) {
  state.lang = l;
  applyLang();
  go('role');
}

function setRole(r) {
  state.role = r;
  go('profileSetup');
}

function saveProfile() {
  state.profile.name = name.value;
  state.profile.phone = phone.value;
  state.profile.car = car.value;
  renderProfile();
  go('home');
}

function renderProfile() {
  pName.innerText = state.profile.name;
  pPhone.innerText = state.profile.phone;
  pCar.innerText = state.role === 'driver' ? state.profile.car : '';
}

function createAd() {
  const ad = {
    from: "A",
    to: "B",
    price: "25000",
    time: Date.now()
  };
  state.ads.push(ad);
  renderAds();
}

function renderAds() {
  adsList.innerHTML = '';
  state.ads = state.ads.filter(a => Date.now() - a.time < 3600000);
  state.ads.forEach(a => {
    const d = document.createElement('div');
    d.className = 'profile-card';
    d.innerHTML = `
      🚕 ${a.from} → ${a.to}<br>
      💰 ${a.price}<br>
      <a href="tel:+998901234567">📞</a>
    `;
    adsList.appendChild(d);
  });
}

