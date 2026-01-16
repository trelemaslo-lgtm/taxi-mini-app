// ====== CONFIG ======
const API = "https://taxi-backend-5kl2.onrender.com"; // <-- твой backend
const AUTO_DELETE_SECONDS = 60 * 60; // 60 минут
const AUTO_DELETE_MS = AUTO_DELETE_SECONDS * 1000;

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
    type_now: "HOZIR KETAMIZ",
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
    fill_required: "❗ Tочка A, B ва narx shart!",
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
    point_b: "ТОЧКА B",
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
    point_a: "TOCHKA A",
    point_b: "TOCHKA B",
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

// ====== LIKES (local for now) ======
function getLikes(){
  try{ return JSON.parse(localStorage.getItem("likes")||"{}"); }catch{return {}}
}
function setLikes(obj){
  localStorage.setItem("likes", JSON.stringify(obj));
}
function pointsForPhone(phone){
  const likes = getLikes();
  return likes[phone] || 0;
}

// ====== PROFILE ======
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

// ====== FILE TO BASE64 (upload from phone) ======
function fileToBase64(file){
  return new Promise((resolve, reject)=>{
    const reader = new FileReader();
    reader.onload = ()=> resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

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

// ====== BOOT ======
document.addEventListener("DOMContentLoaded", async ()=>{
  try{
    if(window.Telegram && Telegram.WebApp){
      Telegram.WebApp.ready();
      Telegram.WebApp.expand();
    }
  }catch(e){}

  // hide loading
  setTimeout(()=>{
    document.getElementById("loading")?.classList.remove("active");
  }, 900);

  applyI18n();
  initToggles();

  const lang = localStorage.getItem("lang");
  const role = localStorage.getItem("role");
  const profile = getProfile();

  if(!lang){
    showScreen("screen-language");
  }else if(!role){
    showScreen("screen-role");
  }else if(!profile){
    showScreen("screen-profile");
    updateProfileUIRole();
  }else{
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
  document.getElementById("loading")?.classList.remove("active");

  const role = localStorage.getItem("role");
  const profile = getProfile();
  if(!role) showScreen("screen-role");
  else if(!profile){
    showScreen("screen-profile");
    updateProfileUIRole();
  }
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
window.saveProfile = async ()=>{
  const role = localStorage.getItem("role");
  const name = (document.getElementById("p-name")?.value || "").trim();
  const phone = (document.getElementById("p-phone")?.value || "").trim();
  const carBrand = (document.getElementById("p-car-brand")?.value || "").trim();
  const carNumber = (document.getElementById("p-car-number")?.value || "").trim();
  const photoUrl = (document.getElementById("p-photo")?.value || "").trim();
  const bio = (document.getElementById("p-bio")?.value || "").trim();

  if(!name || !phone){
    toast(t("need_profile"), true);
    return;
  }

  if(role==="driver" && (!carBrand || !carNumber)){
    toast("❗ Mashina markasi va raqami shart!", true);
    return;
  }

  // ✅ device upload
  let photo = photoUrl || "";
  const fileEl = document.getElementById("p-photo-file");
  if(fileEl && fileEl.files && fileEl.files[0]){
    try{
      photo = await fileToBase64(fileEl.files[0]);
    }catch(e){}
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
  const geoOn = document.getElementById("geoToggle")?.checked;
  if(!geoOn){
    SORT_MODE = "time";
  }else{
    SORT_MODE = (SORT_MODE==="distance") ? "time" : "distance";
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

  cards.innerHTML = `
    <div class="skeleton glass"></div>
    <div class="skeleton glass"></div>
    <div class="skeleton glass"></div>
  `;

  try{
    const res = await fetch(API + "/api/ads");
    const data = await res.json();

    let list = Array.isArray(data) ? data : [];


    // ✅ feed by role
    list = list.filter(a => {
      if(FEED_MODE==="drivers") return a.role === "driver";
      return a.role === "client";
    });

    /list = list.filter(a => {
  const from = String(a.from ?? a.pointA ?? "").trim();
  const to = String(a.to ?? a.pointB ?? "").trim();
  return from.length > 0 && to.length > 0;
});


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

    if(list.length===0){
      cards.innerHTML = `<div class="glass card"><div class="muted">${t("no_ads")}</div></div>`;
      return;
    }

    cards.innerHTML = "";
    list.forEach(ad => cards.appendChild(renderCard(ad, geoEnabled ? geo : null)));
  }catch(e){
    console.log("loadAds error:", e);
    cards.innerHTML = `<div class="glass card"><div class="muted">⚠️ ${t("publish_error")}</div></div>`;
  }
}

// ====== RENDER CARD ======
function renderCard(ad, geo){
  const profileLikes = pointsForPhone(ad.phone);

  const card = document.createElement("div");
  card.className = "glass card";

  const avatarStyle = ad.photo ? `style="background-image:url('${escapeHtml(ad.photo)}')"` : "";

  let dist = "";
  if(geo && ad.lat && ad.lng){
    const d = distanceKm(geo.lat, geo.lng, ad.lat, ad.lng);
    dist = `📍 ${d.toFixed(1)} km`;
  }

  const typeLabel = (()=>{
    if(ad.type==="now") return t("type_now");
    if(ad.type==="20") return t("type_20");
    return t("type_fill");
  })();

  const carLine = `${ad.carBrand || ""} ${ad.carNumber || ""}`.trim();

  card.innerHTML = `
    <div class="card-head">
      <div class="card-left">
        <div class="card-avatar" ${avatarStyle}></div>
        <div>
          <div class="card-name">${escapeHtml(ad.name || "—")}</div>
          <div class="card-sub">${escapeHtml(carLine)}</div>
        </div>
      </div>

      <button class="like-btn" title="Like" onclick="likeDriver('${escapeJs(ad.phone)}'); event.stopPropagation();">💛</button>
    </div>

    <div class="card-body">
      <div class="route-line">
        <span class="route-pill">${escapeHtml(ad.from || ad.pointA || "")}</span>
        <span>→</span>
        <span class="route-pill">${escapeHtml(ad.to || ad.pointB || "")}</span>
      </div>

      <div class="card-info">
        <div class="badge">⏱ ${escapeHtml(typeLabel)}</div>
        <div class="badge">👥 ${escapeHtml(String(ad.seats ?? ""))}</div>
        <div class="badge">💰 ${escapeHtml(String(ad.price ?? ""))}</div>
        ${dist ? `<div class="badge">${dist}</div>` : ""}
        <div class="badge">🏆 ${profileLikes}</div>
      </div>

      ${ad.comment ? `<div class="badge">💬 ${escapeHtml(ad.comment)}</div>` : ""}

      <div class="card-actions">
        <button class="action call" onclick="callPhone('${escapeJs(ad.phone)}'); event.stopPropagation();">${t("call")}</button>
        <button class="action msg" onclick="msgUser('${escapeJs(ad.phone)}','${escapeJs(ad.name||"")}'); event.stopPropagation();">${t("message")}</button>
      </div>
    </div>
  `;

  // ✅ open detail on click
  card.onclick = ()=> openDetail(ad, geo);
  return card;
}

// ====== DETAIL SHEET ======
function openDetail(ad, geo){
  const box = document.getElementById("detailBox");
  if(!box) return;

  const carLine = `${ad.carBrand||""} ${ad.carNumber||""}`.trim();

  let dist = "";
  if(geo && ad.lat && ad.lng){
    const d = distanceKm(geo.lat, geo.lng, ad.lat, ad.lng);
    dist = `${d.toFixed(1)} km`;
  }

  const photoHtml = ad.photo
    ? `<div class="detail-photo" style="background-image:url('${escapeHtml(ad.photo)}')"></div>`
    : "";

  box.innerHTML = `
    ${photoHtml}
    <div class="detail-row"><b>${escapeHtml(ad.name||"—")}</b><span>📞 ${escapeHtml(ad.phone||"")}</span></div>
    ${carLine ? `<div class="detail-row"><span>Mashina</span><b>${escapeHtml(carLine)}</b></div>` : ""}
    <div class="detail-row"><span>Marshrut</span><b>${escapeHtml(ad.from||"")} → ${escapeHtml(ad.to||"")}</b></div>
    <div class="detail-row"><span>Narx</span><b>${escapeHtml(String(ad.price||""))}</b></div>
    <div class="detail-row"><span>Joy</span><b>${escapeHtml(String(ad.seats||""))}</b></div>
    ${dist ? `<div class="detail-row"><span>Masofa</span><b>📍 ${dist}</b></div>` : ""}
    ${ad.comment ? `<div class="detail-row"><span>Izoh</span><b>${escapeHtml(ad.comment)}</b></div>` : ""}
  `;

  openSheet("detailSheet");
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
    toast(t("need_profile"), true);
    return;
  }

  const fromEl = document.getElementById("ad-from");
  const toEl = document.getElementById("ad-to");
  const typeEl = document.getElementById("ad-type");
  const priceEl = document.getElementById("ad-price");
  const seatsEl = document.getElementById("ad-seats");
  const commentEl = document.getElementById("ad-comment");

  if(!fromEl || !toEl || !typeEl || !priceEl || !seatsEl){
    toast("❌ HTML id xato!", true);
    return;
  }

  const from = (fromEl.value || "").trim();
  const to = (toEl.value || "").trim();
  const type = typeEl.value;
  const price = (priceEl.value || "").trim();
  const seats = (seatsEl.value || "").trim();
  const comment = (commentEl?.value || "").trim();

  if(from.length < 2 || to.length < 2 || !price){
    toast(t("fill_required"), true);
    return;
  }

  let seatsNum = parseInt(seats || "0", 10);
  if(Number.isNaN(seatsNum) || seatsNum < 0) seatsNum = 0;
  if(seatsNum > 4) seatsNum = 4;

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
  };

  try{
   console.log("✅ payload yuborildi:", payload);

const r = await fetch(API + "/api/ads", {
  method:"POST",
  headers:{ "Content-Type":"application/json" },
  body: JSON.stringify(payload)
});

const j = await r.json().catch(()=> ({}));
console.log("✅ backend javobi:", j);

if(!r.ok){
  throw new Error("Publish failed");
}

closeSheet("createAdSheet");
toast(t("published_ok"));


    closeSheet("createAdSheet");
    toast(t("published_ok"));
    clearAdForm();
    loadAds();
    renderMyAds();
  }catch(e){
    console.log("Publish error:", e);
    toast(t("publish_error"), true);
  }
};

function clearAdForm(){
  ["ad-from","ad-to","ad-price","ad-seats","ad-comment"].forEach(id=>{
    const el = document.getElementById(id);
    if(el) el.value = "";
  });
}

// ====== PROFILE VIEW ======
function renderProfileView(){
  const p = getProfile();
  if(!p) return;

  const avatar = document.getElementById("avatar");
  if(avatar){
    if(p.photo){
      avatar.style.backgroundImage = `url('${p.photo}')`;
      avatar.innerHTML = "";
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
  document.getElementById("pv-car").innerText = carLine ? carLine : "";

  const pts = pointsForPhone(p.phone || "");
  document.getElementById("pv-points").innerText = `${pts} 🏆`;

  // ✅ stable rating
  let rating = 4.0 + (pts / 50);
  if(rating > 5.0) rating = 5.0;
  document.getElementById("pv-rating").innerText = `${rating.toFixed(1)} ⭐`;

  document.getElementById("ep-name").value = p.name || "";
  document.getElementById("ep-phone").value = p.phone || "";
  document.getElementById("ep-car-brand").value = p.carBrand || "";
  document.getElementById("ep-car-number").value = p.carNumber || "";
  document.getElementById("ep-photo").value = p.photo || "";

  renderMyAds();
}

// ====== EDIT PROFILE SAVE ======
window.saveProfileEdit = async ()=>{
  const p = getProfile();
  if(!p) return;

  let photo = (document.getElementById("ep-photo")?.value || "").trim() || p.photo || "";

  const fileEl = document.getElementById("ep-photo-file");
  if(fileEl && fileEl.files && fileEl.files[0]){
    try{
      photo = await fileToBase64(fileEl.files[0]);
    }catch(e){}
  }

  const np = {
    ...p,
    name: (document.getElementById("ep-name")?.value || "").trim(),
    phone: (document.getElementById("ep-phone")?.value || "").trim(),
    carBrand: (document.getElementById("ep-car-brand")?.value || "").trim(),
    carNumber: (document.getElementById("ep-car-number")?.value || "").trim(),
    photo,
  };

  setProfile(np);
  closeSheet("editProfileSheet");
  toast("✅ Saved");
  renderProfileView();
  loadAds();
};

// ====== MY ADS ======
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

  const notify = localStorage.getItem("notify") === "1";
  if(notifyToggle){
    notifyToggle.checked = notify;
    notifyToggle.onchange = ()=>{
      localStorage.setItem("notify", notifyToggle.checked ? "1" : "0");
    };
  }

  const geoSaved = !!getGeo();
  if(geoToggle){
    geoToggle.checked = geoSaved;
    geoToggle.onchange = async ()=>{
      if(geoToggle.checked){
        await updateLocationNow();
      }else{
        localStorage.removeItem("geo");
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
