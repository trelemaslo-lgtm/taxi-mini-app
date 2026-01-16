// ====== CONFIG ======
const API = "https://taxi-backend-5kl2.onrender.com"; // <-- твой backend
const AUTO_DELETE_SECONDS = 60 * 60; // 60 минут

// ====== I18N ======
const DICT = {
  uz: {
    choose_lang: "Tilni tanlang",
    lang_hint: "Tilni keyin sozlamalardan o‘zgartirsa bo‘ladi.",
    choose_role: "Rolin tanlang",
    role_driver: "Haydovchi",
    role_client: "Mijoz",
    profile_setup: "Profilni to‘ldirish",
    full_name: "Ism familiya",
    phone: "Telefon",
    car_brand: "Mashina markasi",
    car_number: "Mashina raqami",
    photo_url: "Foto (URL)",
    about_short: "Qisqa info",
    continue: "Davom etish",
    back: "Orqaga",

    drivers: "Haydovchilar",
    clients: "Mijozlar",
    sort: "Saralash",
    geo: "Geo",
    geo_off: "Geolokatsiya: OFF",
    sort_time: "Saralash: vaqt",

    create_ad: "E’lon yaratish",
    point_a: "TOCHKA A",
    point_b: "TOCHKA B",
    ad_type: "Tur",
    type_now: "SRAZU EDI",
    type_20: "20 daqiqada",
    type_fill: "Odam to‘lsa",
    price: "Narx",
    seats: "Bo‘sh joy",
    comment: "Izoh",
    publish: "E’lon berish",
    close: "Yopish",
    auto_delete: "E’lon 60 daqiqadan so‘ng avtomatik o‘chadi.",

    settings: "Sozlamalar",
    language: "Til",
    notifications: "Bildirishnomalar",
    donate: "Donat",
    about: "Biz haqimizda",
    about_text: "Bu mini-ilova kichik shahar uchun: tez e’lon, tez qo‘ng‘iroq, qulay tanlash.",
    donate_text: "Loyiha rivoji uchun qo‘llab-quvvatlang. Sizning donatingiz server va yangilanishlarga ketadi.",
    donate_btn: "Donat qilish",

    nav_home: "Bosh",
    nav_create: "Yaratish",
    nav_profile: "Profil",
    nav_settings: "Sozlamalar",

    rating: "Reyting",
    points: "Pointlar",
    edit_profile: "Profilni tahrirlash",
    my_ads: "Mening e’lonlarim",
    save: "Saqlash",

    geo_enable: "Geo yoqish",
    geo_update: "Joylashuvni yangilash",
    geo_hint: "Geo yoqilsa, e’lonlar sizga yaqinligi bo‘yicha saralanadi.",

    no_ads: "Hozircha e’lonlar yo‘q",
    call: "Qo‘ng‘iroq",
    message: "Yozish",
    published_ok: "✅ E’lon joylandi",
    publish_error: "❌ E’lon berishda xatolik",
    need_profile: "❗ Profilni to‘ldiring",
    fill_required: "❗ A, B va Narx shart!",
  },

  ru: {
    choose_lang: "Выберите язык",
    lang_hint: "Язык можно изменить позже в настройках.",
    choose_role: "Выберите роль",
    role_driver: "Водитель",
    role_client: "Клиент",
    profile_setup: "Заполните профиль",
    full_name: "Имя Фамилия",
    phone: "Телефон",
    car_brand: "Марка машины",
    car_number: "Номер машины",
    photo_url: "Фото (URL)",
    about_short: "Коротко о себе",
    continue: "Продолжить",
    back: "Назад",

    drivers: "Водители",
    clients: "Клиенты",
    sort: "Сортировать",
    geo: "Гео",
    geo_off: "Геолокация: OFF",
    sort_time: "Сортировка: по времени",

    create_ad: "Создать объявление",
    point_a: "ТОЧКА А",
    point_b: "ТОЧКА Б",
    ad_type: "Тип",
    type_now: "СРАЗУ ЕДУ",
    type_20: "Через 20 минут",
    type_fill: "Когда наберу людей",
    price: "Цена",
    seats: "Свободные места",
    comment: "Комментарий",
    publish: "Опубликовать",
    close: "Закрыть",
    auto_delete: "Объявление удалится автоматически через 60 минут.",

    settings: "Настройки",
    language: "Язык",
    notifications: "Уведомления",
    donate: "Донат",
    about: "О нас",
    about_text: "Это мини-приложение для маленького города: быстрое объявление, звонок и удобный выбор.",
    donate_text: "Поддержите развитие проекта. Донаты идут на сервер и обновления.",
    donate_btn: "Поддержать",

    nav_home: "Главная",
    nav_create: "Создать",
    nav_profile: "Профиль",
    nav_settings: "Настройки",

    rating: "Рейтинг",
    points: "Поинты",
    edit_profile: "Редактировать профиль",
    my_ads: "Мои объявления",
    save: "Сохранить",

    geo_enable: "Включить гео",
    geo_update: "Обновить местоположение",
    geo_hint: "Если гео включено — сортируем по дистанции.",

    no_ads: "Пока нет объявлений",
    call: "Позвонить",
    message: "Написать",
    published_ok: "✅ Объявление опубликовано",
    publish_error: "❌ Ошибка публикации",
    need_profile: "❗ Заполните профиль",
    fill_required: "❗ Точка A, B и цена обязательны!",
  },

  uzk: {
    choose_lang: "Тилни танланг",
    lang_hint: "Тилни кейин созламалардан ўзгартирса бўлади.",
    choose_role: "Ролингизни танланг",
    role_driver: "Ҳайдовчи",
    role_client: "Мижоз",
    profile_setup: "Профилни тўлдиринг",
    full_name: "Исм фамилия",
    phone: "Телефон",
    car_brand: "Машина маркаси",
    car_number: "Машина рақами",
    photo_url: "Фото (URL)",
    about_short: "Қисқа маълумот",
    continue: "Давом этиш",
    back: "Орқага",

    drivers: "Ҳайдовчилар",
    clients: "Мижозлар",
    sort: "Саралаш",
    geo: "Гео",
    geo_off: "Геолокация: OFF",
    sort_time: "Саралаш: вақт",

    create_ad: "Эълон яратиш",
    point_a: "ТОЧКА A",
    point_b: "ТОЧКА B",
    ad_type: "Тур",
    type_now: "ҲОЗИР ЙЎЛГА ЧИҚАМАН",
    type_20: "20 дақиқада",
    type_fill: "Одам тўлса",
    price: "Нарх",
    seats: "Бўш жой",
    comment: "Изоҳ",
    publish: "Чоп этиш",
    close: "Ёпиш",
    auto_delete: "Эълон 60 дақиқадан сўнг автоматик ўчади.",

    settings: "Созламалар",
    language: "Тил",
    notifications: "Билдиришномалар",
    donate: "Донат",
    about: "Биз ҳақимизда",
    about_text: "Бу мини-илова кичик шаҳар учун: тез эълон, тез қўнғироқ, қулай танлаш.",
    donate_text: "Лойиҳа ривожи учун қўллаб-қувватланг. Донатлар сервер ва янгиланишларга кетади.",
    donate_btn: "Донат қилиш",

    nav_home: "Бош",
    nav_create: "Яратиш",
    nav_profile: "Профил",
    nav_settings: "Созламалар",

    rating: "Рейтинг",
    points: "Поинтлар",
    edit_profile: "Профилни таҳрирлаш",
    my_ads: "Менинг эълонларим",
    save: "Сақлаш",

    geo_enable: "Геони ёқиш",
    geo_update: "Жойлашувни янгилаш",
    geo_hint: "Гео ёқилса — яқинлик бўйича сараланади.",

    no_ads: "Ҳозирча эълонлар йўқ",
    call: "Қўнғироқ",
    message: "Ёзиш",
    published_ok: "✅ Эълон жойланди",
    publish_error: "❌ Эълонда хатолик",
    need_profile: "❗ Профилни тўлдиринг",
    fill_required: "❗ A, B ва нарх шарт!",
  }
};

function t(key){
  const lang = localStorage.getItem("lang") || "uz";
  return (DICT[lang] && DICT[lang][key]) ? DICT[lang][key] : (DICT["uz"][key] || key);
}

function applyI18n(){
  document.querySelectorAll("[data-i18n]").forEach(el=>{
    const k = el.getAttribute("data-i18n");
    el.innerText = t(k);
  });
  const lang = localStorage.getItem("lang") || "uz";
  const badge = document.getElementById("langBadge");
  if(badge) badge.innerText = lang;
}

// ====== UI HELPERS ======
function showScreen(id){
  document.querySelectorAll(".screen").forEach(s=>s.classList.remove("active"));
  const el = document.getElementById(id);
  if(el) el.classList.add("active");
}

function setActiveNav(name){
  ["navHome","navCreate","navProfile","navSettings"].forEach(id=>{
    const b = document.getElementById(id);
    if(b) b.classList.remove("active");
  });
  if(name==="home") document.getElementById("navHome")?.classList.add("active");
  if(name==="profile") document.getElementById("navProfile")?.classList.add("active");
}

function openSheet(id){
  const el = document.getElementById(id);
  if(el) el.classList.add("open");
}
function closeSheet(id){
  const el = document.getElementById(id);
  if(el) el.classList.remove("open");
}
function sheetOutside(e,id){
  if(e.target.id===id) closeSheet(id);
}
window.openSheet = openSheet;
window.closeSheet = closeSheet;
window.sheetOutside = sheetOutside;

// ====== STATE ======
let FEED_MODE = "drivers"; // drivers | clients
let SORT_MODE = "time";    // time | distance

// likes saved locally
function getLikes(){
  try{ return JSON.parse(localStorage.getItem("likes")||"{}"); }catch{return {}}
}
function setLikes(obj){
  localStorage.setItem("likes", JSON.stringify(obj));
}

// points (sum of likes)
function pointsForPhone(phone){
  const likes = getLikes();
  return likes[phone] || 0;
}

// profile
function getProfile(){
  try{ return JSON.parse(localStorage.getItem("profile")||"null"); }catch{return null}
}
function setProfile(p){
  localStorage.setItem("profile", JSON.stringify(p));
}

// ====== GEO ======
function saveGeo(lat,lng){
  localStorage.setItem("geo", JSON.stringify({lat,lng,ts:Date.now()}));
}
function getGeo(){
  try{ return JSON.parse(localStorage.getItem("geo")||"null"); }catch{return null}
}
function distanceKm(lat1, lon1, lat2, lon2){
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat/2)**2 +
    Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) *
    Math.sin(dLon/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

// ====== BOOT ======
document.addEventListener("DOMContentLoaded", async ()=>{
  // Telegram init safe
  try{
    if(window.Telegram && Telegram.WebApp){
      Telegram.WebApp.ready();
      Telegram.WebApp.expand();
    }
  }catch(e){}

  // hide loading after 900ms (nice)
  setTimeout(()=>{
    document.getElementById("loading")?.classList.remove("active");
  }, 900);

  // choose start screen logic
  const lang = localStorage.getItem("lang");
  const role = localStorage.getItem("role");
  const profile = getProfile();

  applyI18n();

  // admin show
  checkAdmin();

  // toggles init
  initToggles();

  if(!lang){
    showScreen("screen-language");
  }else if(!role){
    showScreen("screen-role");
  }else if(!profile){
    showScreen("screen-profile");
    updateProfileUIRole();
  }else{
    // app ready
    showScreen("screen-home");
    nav("home");
    await loadAds();
    renderProfileView();
  }
});

// ====== LANGUAGE ======
window.setLang = (lang)=>{
  localStorage.setItem("lang", lang);
  applyI18n();

  // если язык выбирают в настройках — не выкидываем на старт
  // если это первый запуск — идём на role
  const role = localStorage.getItem("role");
  const profile = getProfile();
  if(!role) showScreen("screen-role");
  else if(!profile) showScreen("screen-profile");
};

// ====== ROLE ======
window.selectRole = (role)=>{
  localStorage.setItem("role", role);
  updateProfileUIRole();
  showScreen("screen-profile");
};

function updateProfileUIRole(){
  const role = localStorage.getItem("role");
  const driverExtra = document.getElementById("driver-extra");
  if(driverExtra){
    driverExtra.style.display = role==="driver" ? "block" : "none";
  }
}

window.goBackTo = (id)=> showScreen(id);

// ====== PROFILE SAVE ======
window.saveProfile = ()=>{
  const role = localStorage.getItem("role");
  const name = document.getElementById("p-name")?.value.trim();
  const phone = document.getElementById("p-phone")?.value.trim();
  const carBrand = document.getElementById("p-car-brand")?.value.trim();
  const carNumber = document.getElementById("p-car-number")?.value.trim();
  const photo = (document.getElementById("p-photo")?.value || "").trim();
  const bio = document.getElementById("p-bio")?.value.trim();

  if(!name || !phone){
    alert(t("need_profile"));
    return;
  }

  const profile = {
    role,
    name,
    phone,
    carBrand: role==="driver" ? (carBrand||"") : "",
    carNumber: role==="driver" ? (carNumber||"") : "",
    photo: photo || "",
    bio: bio || "",
  };

  setProfile(profile);
  showScreen("screen-home");
  nav("home");
  loadAds();
  renderProfileView();
};

// ====== NAV ======
window.nav = (where)=>{
  if(where==="home"){
    setActiveNav("home");
    showScreen("screen-home");
    loadAds();
  }
  if(where==="profile"){
    setActiveNav("profile");
    showScreen("screen-profile-view");
    renderProfileView();
  }
  if(where==="admin"){
    showScreen("screen-admin");
    adminRefresh();
  }
};

// ====== FEED SWITCH ======
window.switchFeed = (mode)=>{
  FEED_MODE = mode;
  document.getElementById("tabDrivers")?.classList.toggle("active", mode==="drivers");
  document.getElementById("tabClients")?.classList.toggle("active", mode==="clients");
  loadAds();
};

// ====== SORT ======
window.toggleSort = ()=>{
  // if geo ON then distance, else time
  const geoOn = document.getElementById("geoToggle")?.checked;
  if(geoOn){
    SORT_MODE = (SORT_MODE==="distance") ? "time" : "distance";
  }else{
    SORT_MODE = "time";
  }
  updateSortLine();
  loadAds();
};

function updateSortLine(){
  const el = document.getElementById("sortLine");
  if(!el) return;
  if(SORT_MODE==="distance"){
    el.innerHTML = `↕️ <span>${localStorage.getItem("lang")==="ru" ? "Сортировка: дистанция" : "Saralash: masofa"}</span>`;
  }else{
    el.innerHTML = `↕️ <span data-i18n="sort_time">${t("sort_time")}</span>`;
  }
}

// ====== LOAD ADS ======
async function loadAds(){
  const cards = document.getElementById("cards");
  if(!cards) return;
// cleanup + filter by feed
let list = Array.isArray(data) ? data : [];

// feed mapping:
list = list.filter(a => {
  if(FEED_MODE==="drivers") return a.role === "driver";
  return a.role === "client";
});
// ✅ показываем только объявления где есть маршрут A и B (чтобы выглядело идеально)
list = list.filter(a => {
  const from = String(a.from ?? a.pointA ?? a.a ?? "").trim();
  const to   = String(a.to ?? a.pointB ?? a.b ?? "").trim();
  return from.length > 1 && to.length > 1;
});

  // skeleton
  cards.innerHTML = `
    <div class="skeleton glass"></div>
    <div class="skeleton glass"></div>
    <div class="skeleton glass"></div>
  `;

  try{
    const res = await fetch(API + "/api/ads");
    const data = await res.json();

    // cleanup + filter by feed
    let list = Array.isArray(data) ? data : [];

    // feed mapping:
    // drivers feed shows driver ads
    // clients feed shows client ads
    list = list.filter(a => {
      if(FEED_MODE==="drivers") return a.role === "driver";
      return a.role === "client";
    });

    // sort
    const geo = getGeo();
    const geoEnabled = !!geo && (document.getElementById("geoToggle")?.checked);

    if(SORT_MODE==="distance" && geoEnabled){
      list.sort((a,b)=>{
        const da = (a.lat && a.lng) ? distanceKm(geo.lat, geo.lng, a.lat, a.lng) : 99999;
        const db = (b.lat && b.lng) ? distanceKm(geo.lat, geo.lng, b.lat, b.lng) : 99999;
        return da - db;
      });
    }else{
      list.sort((a,b)=>(b.created_at||0)-(a.created_at||0));
    }

    // render
    if(list.length===0){
      cards.innerHTML = `<div class="glass card"><div class="muted">${t("no_ads")}</div></div>`;
      return;
    }

    cards.innerHTML = "";
    list.forEach(ad => cards.appendChild(renderCard(ad, geo)));
  }catch(e){
    cards.innerHTML = `<div class="glass card"><div class="muted">⚠️ ${t("publish_error")}</div></div>`;
  }
}
function normalizeAd(ad){
  const role = ad.role || ad.userRole || "";

  const name =
    (ad.name || ad.full_name || ad.fullName || ad.username || "").toString().trim() ||
    (role === "driver" ? "🚘 Haydovchi" : "👤 Mijoz");

  const phone = (ad.phone || ad.tel || ad.contact || "").toString().trim();

  const photo =
    (ad.photo || ad.avatar || ad.image || ad.photo_url || ad.photoUrl || "").toString().trim();

  const carBrand = (ad.carBrand || ad.car_brand || ad.brand || "").toString().trim();
  const carNumber = (ad.carNumber || ad.car_number || ad.number || "").toString().trim();

  // маршрут (берём из разных вариантов)
  const from =
    (ad.from ?? ad.pointA ?? ad.a ?? ad.origin ?? ad.start ?? "").toString().trim();
  const to =
    (ad.to ?? ad.pointB ?? ad.b ?? ad.destination ?? ad.end ?? "").toString().trim();

  const type = (ad.type || ad.tripType || "fill").toString();
  const seats = ad.seats ?? ad.freeSeats ?? ad.places ?? 0;
  const price = ad.price ?? ad.cost ?? ad.sum ?? "";

  const comment = (ad.comment || ad.text || ad.note || "").toString().trim();

  const lat = ad.lat ?? ad.latitude ?? null;
  const lng = ad.lng ?? ad.longitude ?? null;

  const created_at = ad.created_at || ad.createdAt || Date.now();

  return {
    role, name, phone, photo, carBrand, carNumber,
    from, to, type, seats, price, comment,
    lat, lng, created_at,
    _raw: ad
  };
}


// ====== RENDER CARD ======
function renderCard(ad, geo){
  const A = normalizeAd(ad);
  const profileLikes = pointsForPhone(A.phone);

  const card = document.createElement("div");
  card.className = "glass card";

  const carLine = `${A.carBrand} ${A.carNumber}`.trim();

  // ✅ фото (если нет — красивый аватар)
  const avatarHtml = A.photo
    ? `<div class="card-avatar" style="background-image:url('${escapeHtml(A.photo)}')"></div>`
    : `<div class="card-avatar" style="display:grid;place-items:center;font-size:18px;">👤</div>`;

  // ✅ маршрут: если пусто — показываем “Не указано”
  const fromText = A.from ? A.from : "📍 A: yozilmagan";
  const toText = A.to ? A.to : "📍 B: yozilmagan";

  // ✅ тип
  const typeLabel = (()=>{
    if(A.type==="now") return t("type_now");
    if(A.type==="20") return t("type_20");
    return t("type_fill");
  })();

  // ✅ дистанция
  let distHtml = "";
  if(geo && geo.lat && geo.lng && A.lat && A.lng){
    const d = distanceKm(geo.lat, geo.lng, A.lat, A.lng);
    if(Number.isFinite(d)) distHtml = `<div class="badge">📍 ${d.toFixed(1)} km</div>`;
  }

  // ✅ время
  let timeHtml = "";
  if(A.created_at){
    const mins = Math.floor((Date.now() - Number(A.created_at)) / 60000);
    if(mins < 1) timeHtml = `<div class="card-sub">🟢 now</div>`;
    else if(mins < 60) timeHtml = `<div class="card-sub">⏱ ${mins} min ago</div>`;
    else timeHtml = `<div class="card-sub">⏱ ${Math.floor(mins/60)} h ago</div>`;
  }

  card.innerHTML = `
    <div class="card-head">
      <div class="card-left">
        ${avatarHtml}
        <div>
          <div class="card-name">${escapeHtml(A.name)}</div>
          ${carLine ? `<div class="card-sub">${escapeHtml(carLine)}</div>` : ""}
          ${timeHtml}
        </div>
      </div>

      <button class="like-btn" title="Like" onclick="likeDriver('${escapeJs(A.phone)}')">💛</button>
    </div>

    <div class="card-body">
      <div class="route-line">
        <span class="route-pill">${escapeHtml(fromText)}</span>
        <span>→</span>
        <span class="route-pill">${escapeHtml(toText)}</span>
      </div>

      <div class="card-info">
        <div class="badge">⏱ ${escapeHtml(typeLabel)}</div>
        <div class="badge">👥 ${escapeHtml(String(A.seats ?? "0"))}</div>
        <div class="badge">💰 ${escapeHtml(String(A.price ?? ""))}</div>
        ${distHtml}
        <div class="badge">🏆 ${profileLikes}</div>
      </div>

      ${A.comment ? `<div class="badge">💬 ${escapeHtml(A.comment)}</div>` : ""}

      <div class="card-actions">
        <button class="action call" onclick="callPhone('${escapeJs(A.phone)}')">${t("call")}</button>
        <button class="action msg" onclick="msgUser('${escapeJs(A.phone)}','${escapeJs(A.name)}')">${t("message")}</button>
      </div>
    </div>
  `;

  return card;
}



// ====== LIKE ======
window.likeDriver = (phone)=>{
  if(!phone) return;
  const likes = getLikes();
  likes[phone] = (likes[phone] || 0) + 1;
  setLikes(likes);
  loadAds();
  renderProfileView();
};

// ====== CALL / MSG ======
window.callPhone = (phone)=>{
  if(!phone) return;
  window.location.href = `tel:${phone}`;
};

window.msgUser = (phone,name)=>{
  // В MiniApp можем открыть TG юзеру (если он поделился контактами – чаще всего нет).
  // Поэтому делаем fallback: открыть чат с ботом и показать данные.
  try{
    if(window.Telegram && Telegram.WebApp){
      Telegram.WebApp.showPopup({
        title: "📩",
        message: `${name}\n${phone}`,
        buttons:[{type:"ok"}]
      });
      return;
    }
  }catch(e){}
  alert(`${name}\n${phone}`);
};

// ====== PUBLISH AD ======
window.publishAd = async ()=>{
  const profile = getProfile();
  if(!profile){
    alert(t("need_profile"));
    return;
  }

  const fromEl = document.getElementById("ad-from");
  const toEl = document.getElementById("ad-to");
  const typeEl = document.getElementById("ad-type");
  const priceEl = document.getElementById("ad-price");
  const seatsEl = document.getElementById("ad-seats");
  const commentEl = document.getElementById("ad-comment");

  if(!fromEl || !toEl || !typeEl || !priceEl || !seatsEl){
    alert("❌ HTML id xato!");
    return;
  }

 const from = (fromEl.value || "").trim();
const to = (toEl.value || "").trim();
const type = typeEl.value;
const price = (priceEl.value || "").trim();
const seats = (seatsEl.value || "").trim();
const comment = (commentEl?.value || "").trim();

// ✅ жёсткая проверка маршрута
if(from.length < 2 || to.length < 2 || price.length < 1){
  toast(t("fill_required"), true);
  return;
}


  let seatsNum = parseInt(seats || "0", 10);
  if(Number.isNaN(seatsNum) || seatsNum < 0) seatsNum = 0;
  if(seatsNum > 4) seatsNum = 4;

  // attach geo if enabled
  const geoEnabled = document.getElementById("geoToggle")?.checked;
  const geo = geoEnabled ? getGeo() : null;

 const payload = {
  role: profile.role,
  name: profile.name,
  phone: profile.phone,
  carBrand: profile.carBrand || "",
  carNumber: profile.carNumber || "",
  photo: profile.photo || "",

  from,
  to,
  type,
  price,
  seats: seatsNum,
  comment,

  lat: geo?.lat || null,
  lng: geo?.lng || null,

  // ✅ дубли для совместимости с любым backend
  full_name: profile.name,
  car_brand: profile.carBrand || "",
  car_number: profile.carNumber || "",
  photo_url: profile.photo || "",
  pointA: from,
  pointB: to,
  createdAt: Date.now(),
};

 

  try{
    const r = await fetch(API + "/api/ads", {
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body: JSON.stringify(payload)
    });

    const j = await r.json().catch(()=>({}));

    if(!r.ok){
      console.log("Publish error:", r.status, j);
      throw new Error("Publish failed");
    }

    closeSheet("createAdSheet");
    toast(t("published_ok"));
    clearAdForm();
    loadAds();
    renderMyAds();
  }catch(e){
    toast(t("publish_error"), true);
  }
};

function clearAdForm(){
  ["ad-from","ad-to","ad-price","ad-seats","ad-comment"].forEach(id=>{
    const el = document.getElementById(id);
    if(el) el.value = "";
  });
}

// ====== SETTINGS / DONATE ======
window.donateNow = ()=>{
  toast("💛 711 GROUP");
  // Можно добавить ссылку оплаты:
  // window.open("https://payme.uz/...", "_blank");
};

// ====== TOAST ======
function toast(msg, danger=false){
  try{
    if(window.Telegram && Telegram.WebApp){
      Telegram.WebApp.showPopup({
        title: danger ? "❌" : "✅",
        message: msg,
        buttons:[{type:"ok"}]
      });
      return;
    }
  }catch(e){}
  alert(msg);
}

// ====== PROFILE VIEW ======
function renderProfileView(){
  const p = getProfile();
  if(!p) return;

  const avatar = document.getElementById("avatar");
  if(avatar){
    if(p.photo){
      avatar.style.backgroundImage = `url('${p.photo}')`;
    }else{
      avatar.style.backgroundImage = "";
      avatar.innerHTML = "👤";
    }
  }

  document.getElementById("pv-name").innerText = p.name || "—";
  document.getElementById("pv-phone").innerText = p.phone || "—";

  const carLine = (p.role==="driver")
    ? `${p.carBrand || ""} ${p.carNumber || ""}`.trim()
    : "";
  document.getElementById("pv-car").innerText = carLine ? carLine : (p.role==="client" ? "👤 Client" : "");

  const pts = pointsForPhone(p.phone || "");
  document.getElementById("pv-points").innerText = `${pts} 🏆`;

  // rating as simple: 4.0 + points/50 max 5.0
  let rating = 4.0 + (pts / 50);
  if(rating > 5.0) rating = 5.0;
  document.getElementById("pv-rating").innerText = `${rating.toFixed(1)} ⭐`;

  // fill edit sheet inputs
  document.getElementById("ep-name").value = p.name || "";
  document.getElementById("ep-phone").value = p.phone || "";
  document.getElementById("ep-car-brand").value = p.carBrand || "";
  document.getElementById("ep-car-number").value = p.carNumber || "";
  document.getElementById("ep-photo").value = p.photo || "";

  renderMyAds();
}

// ====== EDIT PROFILE SAVE ======
window.saveProfileEdit = ()=>{
  const p = getProfile();
  if(!p) return;

  const np = {
    ...p,
    name: document.getElementById("ep-name").value.trim(),
    phone: document.getElementById("ep-phone").value.trim(),
    carBrand: document.getElementById("ep-car-brand").value.trim(),
    carNumber: document.getElementById("ep-car-number").value.trim(),
    photo: document.getElementById("ep-photo").value.trim(),
  };

  setProfile(np);
  closeSheet("editProfileSheet");
  toast("✅ Saved");
  renderProfileView();
  loadAds();
};

// ====== MY ADS (client-side filter) ======
async function renderMyAds(){
  const listEl = document.getElementById("myAdsList");
  if(!listEl) return;

  const p = getProfile();
  if(!p) return;

  try{
    const res = await fetch(API + "/api/ads");
    const data = await res.json();
    const mine = (Array.isArray(data)?data:[]).filter(a => a.phone === p.phone);

    if(mine.length===0){
      listEl.innerHTML = `<div class="glass card"><div class="muted">${t("no_ads")}</div></div>`;
      return;
    }

    listEl.innerHTML = "";
    mine.sort((a,b)=>(b.created_at||0)-(a.created_at||0));
    mine.forEach(ad=>{
      const div = document.createElement("div");
      div.className = "glass card";
      div.innerHTML = `
        <div class="card-body">
          <div class="route-line">
            <span class="route-pill">${escapeHtml(ad.from||"")}</span>
            <span>→</span>
            <span class="route-pill">${escapeHtml(ad.to||"")}</span>
          </div>
          <div class="card-info">
            <div class="badge">💰 ${escapeHtml(String(ad.price||""))}</div>
            <div class="badge">👥 ${escapeHtml(String(ad.seats||""))}</div>
          </div>
        </div>
      `;
      listEl.appendChild(div);
    });
  }catch(e){
    listEl.innerHTML = `<div class="glass card"><div class="muted">⚠️</div></div>`;
  }
}

// ====== GEO TOGGLE ======
function initToggles(){
  const geoToggle = document.getElementById("geoToggle");
  const notifyToggle = document.getElementById("notifyToggle");

  // notifications (fake setting)
  const notify = localStorage.getItem("notify") === "1";
  if(notifyToggle){
    notifyToggle.checked = notify;
    notifyToggle.onchange = ()=>{
      localStorage.setItem("notify", notifyToggle.checked ? "1" : "0");
    };
  }

  // geo
  const geoSaved = !!getGeo();
  if(geoToggle){
    geoToggle.checked = geoSaved;
    geoToggle.onchange = async ()=>{
      if(geoToggle.checked){
        await updateLocationNow();
      }else{
        localStorage.removeItem("geo");
        updateGeoLine();
        SORT_MODE = "time";
        updateSortLine();
        loadAds();
      }
    };
  }

  updateGeoLine();
  updateSortLine();
}

window.updateLocationNow = async ()=>{
  const geoStatus = document.getElementById("geoStatus");
  if(geoStatus) geoStatus.innerText = "…";

  if(!navigator.geolocation){
    if(geoStatus) geoStatus.innerText = "Geolocation not supported";
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (pos)=>{
      saveGeo(pos.coords.latitude, pos.coords.longitude);
      updateGeoLine();
      loadAds();
      if(geoStatus){
        geoStatus.innerText = `✅ ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`;
      }
    },
    (err)=>{
      if(geoStatus) geoStatus.innerText = "❌ Geo error";
      console.log(err);
    },
    { enableHighAccuracy:true, timeout:10000 }
  );
};

function updateGeoLine(){
  const geoLine = document.getElementById("geoLine");
  if(!geoLine) return;

  const geo = getGeo();
  const on = !!geo;
  if(on){
    geoLine.innerHTML = `📍 <span>${localStorage.getItem("lang")==="ru" ? "Геолокация: ON" : "Geolokatsiya: ON"}</span>`;
  }else{
    geoLine.innerHTML = `📍 <span data-i18n="geo_off">${t("geo_off")}</span>`;
  }
}

// ====== ADMIN (simple) ======
const ADMIN_PHONE = "+9989955750132"; // <-- ТВОЙ номер (админ)
function checkAdmin(){
  const p = getProfile();
  const adminBtn = document.querySelector(".admin-only");
  if(!adminBtn) return;

  if(p && p.phone === ADMIN_PHONE){
    adminBtn.style.display = "flex";
  }else{
    adminBtn.style.display = "none";
  }
}

window.adminRefresh = async ()=>{
  try{
    const res = await fetch(API + "/api/ads");
    const data = await res.json();
    const count = Array.isArray(data)?data.length:0;
    document.getElementById("adminStats").innerText = `Ads: ${count}`;
  }catch(e){
    document.getElementById("adminStats").innerText = "Error";
  }
};

window.adminClearAll = async ()=>{
  toast("Admin clear: backend kerak (keyin qo‘shamiz)");
};

// ====== ESCAPE HELPERS ======
function escapeHtml(str){
  return String(str || "").replace(/[&<>"']/g, s=>({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[s]));
}
function escapeJs(str){
  return String(str||"").replace(/\\/g,"\\\\").replace(/'/g,"\\'");
}
