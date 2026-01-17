// =====================================================
// 711 TAXI MINI APP — ULTRA FINAL PACK (SINGLE app.js)
// FULL VERSION (1/3): I18N + CORE + ADS + GEO + UPLOAD
// =====================================================

// =============================
// CONFIG
// =============================
const API = "https://taxi-backend-5kl2.onrender.com";
const ADMIN_TELEGRAM_ID = "6813692852";

// =============================
// HELPERS
// =============================
const $ = (id)=>document.getElementById(id);
const $$ = (q)=>document.querySelector(q);
const $$$ = (q)=>Array.from(document.querySelectorAll(q));

function safeJson(str, fallback){ try{return JSON.parse(str);}catch{return fallback;} }
function escapeHtml(str){
  return String(str || "").replace(/[&<>"']/g, s=>({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[s]));
}
function escapeJs(str){
  return String(str||"").replace(/\\/g,"\\\\").replace(/'/g,"\\'");
}

// =============================
// TELEGRAM SAFE
// =============================
function tgUser(){
  try{ return Telegram?.WebApp?.initDataUnsafe?.user || null; }catch(e){ return null; }
}
function tgId(){ return String(tgUser()?.id || ""); }
function tgName(){
  const u=tgUser();
  if(!u) return "";
  return (u.first_name || "") + (u.last_name ? (" " + u.last_name) : "");
}
function tgUsername(){
  const u=tgUser();
  if(!u) return "";
  return u.username ? ("@" + u.username) : "";
}
function isAdminLocal(){ return tgId() === String(ADMIN_TELEGRAM_ID); }

// =============================
// LOCAL STORAGE KEYS
// =============================
const LS = {
  lang:"lang",
  role:"role",
  profile:"profile",
  geo:"geo",
  notify:"notify",
  favorites:"favorites",
  bannerSeen:"bannerSeen"
};

// =============================
// I18N (FULL)
// =============================
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
    donate_text: "Loyiha rivoji uchun qo‘llab-quvvatlang. Donatlar server va yangilanishlarga ketadi.",
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
    point_a: "ТОЧКА A",
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
    about_text: "Мини-приложение для города: быстрое объявление, звонок, удобный выбор.",
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
    fill_required: "❗ A, B и цена обязательны!",
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
  const lang = localStorage.getItem(LS.lang) || "uz";
  return (DICT[lang] && DICT[lang][key]) ? DICT[lang][key] : (DICT["uz"][key] || key);
}

function applyI18n(){
  $$$("[data-i18n]").forEach(el=>{
    const k = el.getAttribute("data-i18n");
    el.innerText = t(k);
  });
  const lang = localStorage.getItem(LS.lang) || "uz";
  const badge = $("langBadge");
  if(badge) badge.innerText = lang;
}

// =============================
// UI + NAV + SHEETS
// =============================
function showScreen(id){
  $$$(".screen").forEach(s=>s.classList.remove("active"));
  $(id)?.classList.add("active");
}
function setActiveNav(name){
  ["navHome","navCreate","navProfile","navSettings"].forEach(id=>$(id)?.classList.remove("active"));
  if(name==="home") $("navHome")?.classList.add("active");
  if(name==="profile") $("navProfile")?.classList.add("active");
}
function openSheet(id){ $(id)?.classList.add("open"); }
function closeSheet(id){ $(id)?.classList.remove("open"); }
function sheetOutside(e,id){ if(e.target.id===id) closeSheet(id); }
window.openSheet=openSheet; window.closeSheet=closeSheet; window.sheetOutside=sheetOutside;

function toast(msg, danger=false){
  try{
    Telegram.WebApp.showPopup({
      title: danger ? "❌" : "✅",
      message: msg,
      buttons:[{type:"ok"}]
    });
    return;
  }catch(e){}
  alert(msg);
}

// =============================
// API
// =============================
async function apiGet(path){
  const r = await fetch(API+path);
  const j = await r.json().catch(()=>({}));
  if(!r.ok) throw new Error(j?.error||"GET failed");
  return j;
}
async function apiPost(path, body){
  const r = await fetch(API+path,{
    method:"POST",
    headers:{ "Content-Type":"application/json" },
    body: JSON.stringify(body||{})
  });
  const j = await r.json().catch(()=>({}));
  if(!r.ok) throw new Error(j?.error||"POST failed");
  return j;
}
async function apiDelete(path){
  const r = await fetch(API+path,{ method:"DELETE" });
  const j = await r.json().catch(()=>({}));
  if(!r.ok) throw new Error(j?.error||"DELETE failed");
  return j;
}

// =============================
// GEO
// =============================
function saveGeo(lat,lng){ localStorage.setItem(LS.geo, JSON.stringify({lat,lng,ts:Date.now()})); }
function getGeo(){ return safeJson(localStorage.getItem(LS.geo)||"null", null); }
function distanceKm(lat1, lon1, lat2, lon2){
  const R = 6371;
  const dLat = (lat2-lat1)*Math.PI/180;
  const dLon = (lon2-lon1)*Math.PI/180;
  const a = Math.sin(dLat/2)**2 +
    Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

// =============================
// STATE
// =============================
let FEED_MODE="drivers";
let SORT_MODE="time";
let ADS_CACHE=[];

// =============================
// PROFILE LOCAL
// =============================
function getProfile(){ return safeJson(localStorage.getItem(LS.profile)||"null", null); }
function setProfile(p){ localStorage.setItem(LS.profile, JSON.stringify(p)); }

// =============================
// BOOT
// =============================
document.addEventListener("DOMContentLoaded", async ()=>{
  try{
    Telegram.WebApp.ready();
    Telegram.WebApp.expand();
  }catch(e){}

  setTimeout(()=> $("loading")?.classList.remove("active"), 900);

  applyI18n();
  initToggles();
  checkAdminBtn();

  // Start flow
  const lang = localStorage.getItem(LS.lang);
  const role = localStorage.getItem(LS.role);
  const profile = getProfile();

  if(!lang) return showScreen("screen-language");
  if(!role) return showScreen("screen-role");
  if(!profile) return showScreen("screen-profile");

  showScreen("screen-home");
  nav("home");
});

// =============================
// LANGUAGE/ROLE
// =============================
window.setLang = (lang)=>{
  localStorage.setItem(LS.lang, lang);
  applyI18n();

  const role = localStorage.getItem(LS.role);
  const profile = getProfile();
  if(!role) showScreen("screen-role");
  else if(!profile) showScreen("screen-profile");
};

window.selectRole = (role)=>{
  localStorage.setItem(LS.role, role);
  const driverExtra = $("driver-extra");
  if(driverExtra) driverExtra.style.display = role==="driver" ? "block" : "none";
  showScreen("screen-profile");
};

// =============================
// SAVE PROFILE
// =============================
window.saveProfile = async ()=>{
  const role = localStorage.getItem(LS.role);
  const name = $("p-name")?.value.trim();
  const phone = $("p-phone")?.value.trim();
  const carBrand = $("p-car-brand")?.value.trim();
  const carNumber = $("p-car-number")?.value.trim();
  const bio = $("p-bio")?.value.trim();

  if(!name || !phone){
    toast(t("need_profile"), true);
    return;
  }

  const profile = {
    telegram_id: tgId(),
    username: tgUsername(),
    role,
    name,
    phone,
    carBrand: role==="driver" ? (carBrand||"") : "",
    carNumber: role==="driver" ? (carNumber||"") : "",
    bio: bio || "",
    photo_url:"",
    cover_url:""
  };

  setProfile(profile);

  showScreen("screen-home");
  nav("home");
};

// =============================
// NAV
// =============================
window.nav = async (where)=>{
  if(where==="home"){
    setActiveNav("home");
    showScreen("screen-home");
    await loadAds();
  }
  if(where==="profile"){
    setActiveNav("profile");
    showScreen("screen-profile-view");
    // (profile UI comes in 2/3)
  }
  if(where==="admin"){
    showScreen("screen-admin");
  }
};

// =============================
// FEED + SEARCH + SORT
// =============================
window.switchFeed = async (mode)=>{
  FEED_MODE = mode;
  $("tabDrivers")?.classList.toggle("active", mode==="drivers");
  $("tabClients")?.classList.toggle("active", mode==="clients");
  renderCards();
};

window.searchAds = ()=> renderCards();

window.toggleSort = ()=>{
  const geoOn = $("geoToggle")?.checked;
  if(geoOn) SORT_MODE = (SORT_MODE==="distance") ? "time" : "distance";
  else SORT_MODE="time";
  updateSortLine();
  renderCards();
};

function updateSortLine(){
  const el=$("sortLine");
  if(!el) return;

  if(SORT_MODE==="distance"){
    el.innerHTML = `↕️ <span>${t("sort")}: masofa</span>`;
  }else{
    el.innerHTML = `↕️ <span data-i18n="sort_time">${t("sort_time")}</span>`;
  }
}

// =============================
// LOAD ADS
// =============================
async function loadAds(){
  const cards=$("cards");
  if(!cards) return;

  cards.innerHTML = `
    <div class="skeleton glass"></div>
    <div class="skeleton glass"></div>
    <div class="skeleton glass"></div>
  `;

  try{
    const j = await apiGet("/api/ads");
    ADS_CACHE = Array.isArray(j.ads) ? j.ads : [];
    renderCards();
  }catch(e){
    cards.innerHTML = `<div class="glass card"><div class="muted">${t("publish_error")}</div></div>`;
  }
}

function renderCards(){
  const cards=$("cards");
  if(!cards) return;

  const q = ($("searchInput")?.value || "").trim().toLowerCase();
  const geo=getGeo();
  const geoEnabled = !!geo && ($("geoToggle")?.checked);

  let list = [...ADS_CACHE];

  list = list.filter(a=>{
    if(FEED_MODE==="drivers") return a.role==="driver";
    return a.role==="client";
  });

  if(q){
    list = list.filter(a=>{
      const s = `${a.name||""} ${a.phone||""} ${a.frm||""} ${a.too||""} ${a.car_brand||""} ${a.car_number||""}`.toLowerCase();
      return s.includes(q);
    });
  }

  if(SORT_MODE==="distance" && geoEnabled){
    list.sort((a,b)=>{
      const da=(a.lat&&a.lng)?distanceKm(geo.lat,geo.lng,a.lat,a.lng):99999;
      const db=(b.lat&&b.lng)?distanceKm(geo.lat,geo.lng,b.lat,b.lng):99999;
      return da-db;
    });
  }else{
    list.sort((a,b)=>(b.created_at||0)-(a.created_at||0));
  }

  if(list.length===0){
    cards.innerHTML = `<div class="glass card"><div class="muted">${t("no_ads")}</div></div>`;
    return;
  }

  cards.innerHTML="";
  list.forEach(ad=>cards.appendChild(renderCard(ad, geo, geoEnabled)));
}

function typeLabel(ad){
  if(ad.ad_type==="now") return t("type_now");
  if(ad.ad_type==="20") return t("type_20");
  return t("type_fill");
}

function renderCard(ad, geo, geoEnabled){
  const card=document.createElement("div");
  card.className="glass card";

  const avatarStyle = ad.photo_url ? `style="background-image:url('${escapeHtml(ad.photo_url)}')"` : "";
  const dist = (geoEnabled && geo && ad.lat && ad.lng)
    ? `📍 ${distanceKm(geo.lat, geo.lng, ad.lat, ad.lng).toFixed(1)} km`
    : "";

  card.innerHTML = `
    <div class="card-head">
      <div class="card-left">
        <div class="card-avatar" ${avatarStyle}></div>
        <div>
          <div class="card-name">${escapeHtml(ad.name||"—")}</div>
          <div class="card-sub">${escapeHtml(ad.car_brand||"")} ${escapeHtml(ad.car_number||"")}</div>
        </div>
      </div>
      <button class="like-btn" onclick="likeDriver('${escapeJs(ad.phone||"")}')">💛</button>
    </div>

    <div class="card-body">
      <div class="route-line">
        <span class="route-pill">${escapeHtml(ad.frm||"")}</span>
        <span>→</span>
        <span class="route-pill">${escapeHtml(ad.too||"")}</span>
      </div>

      <div class="card-info">
        <div class="badge">⏱ ${escapeHtml(typeLabel(ad))}</div>
        <div class="badge">👥 ${escapeHtml(String(ad.seats ?? 0))}</div>
        <div class="badge">💰 ${escapeHtml(String(ad.price ?? ""))}</div>
        ${dist ? `<div class="badge">${dist}</div>` : ""}
        <div class="badge">🏆 ${escapeHtml(String(ad.points ?? 0))}</div>
        <div class="badge">👁 ${escapeHtml(String(ad.views ?? 0))}</div>
      </div>

      ${ad.comment ? `<div class="badge">${escapeHtml(ad.comment)}</div>` : ""}

      <div class="card-actions">
        <button class="action call" onclick="callPhone('${escapeJs(ad.phone||"")}')">${t("call")}</button>
        <button class="action msg" onclick="msgUser('${escapeJs(ad.telegram_id||"")}','${escapeJs(ad.name||"")}')">${t("message")}</button>
      </div>
    </div>
  `;
  return card;
}

// =============================
// LIKE / CALL / MSG
// =============================
window.likeDriver = async (phone)=>{
  if(!phone) return;
  try{
    await apiPost("/api/like", { target_phone: phone, from_telegram_id: tgId() });
    await loadAds();
  }catch(e){
    toast("❌ Like error", true);
  }
};

window.callPhone = (phone)=>{
  if(!phone) return;
  window.location.href=`tel:${phone}`;
};

window.msgUser = ()=>{
  toast("💬 Chat 3/3 da qo‘shiladi ✅");
};

// =============================
// PUBLISH AD
// =============================
window.publishAd = async ()=>{
  const p=getProfile();
  if(!p){
    toast(t("need_profile"), true);
    return;
  }

  const from=$("ad-from")?.value.trim();
  const to=$("ad-to")?.value.trim();
  const type=$("ad-type")?.value;
  const price=$("ad-price")?.value.trim();
  const seats=$("ad-seats")?.value.trim();
  const comment=($("ad-comment")?.value||"").trim();

  if(!from || !to || !price){
    toast(t("fill_required"), true);
    return;
  }

  let seatsNum=parseInt(seats||"0",10);
  if(Number.isNaN(seatsNum) || seatsNum<0) seatsNum=0;
  if(seatsNum>8) seatsNum=8;

  const geoEnabled=$("geoToggle")?.checked;
  const geo=geoEnabled ? getGeo() : null;

  const payload={
    telegram_id: tgId(),
    role: p.role,
    name: p.name,
    phone: p.phone,
    car_brand: p.carBrand||"",
    car_number: p.carNumber||"",
    photo_url: p.photo_url||"",
    from,
    to,
    type,
    price,
    seats: seatsNum,
    comment,
    lat: geo?.lat || null,
    lng: geo?.lng || null
  };

  try{
    await apiPost("/api/ads", payload);
    closeSheet("createAdSheet");
    toast(t("published_ok"));
    ["ad-from","ad-to","ad-price","ad-seats","ad-comment"].forEach(id=>{ if($(id)) $(id).value=""; });
    await loadAds();
  }catch(e){
    toast(t("publish_error"), true);
  }
};

// =============================
// GEO TOGGLE UI
// =============================
function initToggles(){
  const geoToggle=$("geoToggle");
  const notifyToggle=$("notifyToggle");

  const notify=localStorage.getItem(LS.notify)==="1";
  if(notifyToggle){
    notifyToggle.checked=notify;
    notifyToggle.onchange=()=>localStorage.setItem(LS.notify, notifyToggle.checked?"1":"0");
  }

  const geoSaved=!!getGeo();
  if(geoToggle){
    geoToggle.checked=geoSaved;
    geoToggle.onchange=async ()=>{
      if(geoToggle.checked) await updateLocationNow();
      else{
        localStorage.removeItem(LS.geo);
        updateGeoLine();
        SORT_MODE="time";
        updateSortLine();
        renderCards();
      }
    };
  }

  updateGeoLine();
  updateSortLine();
}

window.updateLocationNow = async ()=>{
  const geoStatus=$("geoStatus");
  if(geoStatus) geoStatus.innerText="…";

  if(!navigator.geolocation){
    if(geoStatus) geoStatus.innerText="Geo not supported";
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (pos)=>{
      saveGeo(pos.coords.latitude,pos.coords.longitude);
      updateGeoLine();
      renderCards();
      if(geoStatus) geoStatus.innerText=`✅ ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`;
    },
    ()=>{
      if(geoStatus) geoStatus.innerText="❌ Geo error";
    },
    { enableHighAccuracy:true, timeout:12000, maximumAge:15000 }
  );
};

function updateGeoLine(){
  const geoLine=$("geoLine");
  if(!geoLine) return;
  const geo=getGeo();
  geoLine.innerHTML = geo
    ? `📍 <span>Geolokatsiya: ON</span>`
    : `📍 <span data-i18n="geo_off">${t("geo_off")}</span>`;
}

// =============================
// ADMIN BUTTON
// =============================
function checkAdminBtn(){
  const adminBtn=document.querySelector(".admin-only");
  if(!adminBtn) return;
  adminBtn.style.display = isAdminLocal() ? "flex" : "none";
}

// =============================
// DONATE
// =============================
window.donateNow = ()=> toast("💛 711 GROUP");

// =====================================================
// ✅ END FINAL PACK 1/3
// Next: FINAL PACK 2/3 (Profile view, car gallery, favorites, news, profiles)
// =====================================================
// =====================================================
// ✅ ULTRA FINAL PACK — PART 2/3
// PROFILE VIEW + CAR GALLERY + FAVORITES + PROFILES + NEWS + ADMIN ULTRA
// =====================================================

// =============================
// FAVORITES (LOCAL)
// =============================
function getFavorites(){
  return safeJson(localStorage.getItem(LS.favorites)||"[]", []);
}
function setFavorites(arr){
  localStorage.setItem(LS.favorites, JSON.stringify(arr||[]));
}
function isFavorite(id){
  return getFavorites().includes(String(id||""));
}
window.toggleFavorite = (id)=>{
  const favs = getFavorites();
  const sid = String(id||"");
  const idx = favs.indexOf(sid);
  if(idx>=0) favs.splice(idx,1);
  else favs.push(sid);
  setFavorites(favs);
  renderCards();
};

// =============================
// DEVICE UPLOAD -> BACKEND -> SUPABASE
// =============================
async function pickFile(accept="image/*"){
  return new Promise((resolve)=>{
    const inp=document.createElement("input");
    inp.type="file";
    inp.accept=accept;
    inp.onchange=()=>resolve(inp.files?.[0]||null);
    inp.click();
  });
}

// backend upload endpoint should return: { ok:true, url:"https://..." }
async function uploadFileToBackend(file){
  const fd=new FormData();
  fd.append("file",file);

  const r=await fetch(API+"/api/upload",{ method:"POST", body: fd });
  const j=await r.json().catch(()=>({}));
  if(!r.ok || !j.ok) throw new Error(j?.error||"upload failed");
  return j.url;
}

// =============================
// PROFILE VIEW (ULTRA)
// =============================
async function renderProfileView(){
  const p=getProfile();
  if(!p) return;

  // Avatar
  const avatar=$("avatar");
  if(avatar){
    if(p.photo_url){
      avatar.style.backgroundImage=`url('${p.photo_url}')`;
      avatar.innerHTML="";
    }else{
      avatar.style.backgroundImage="";
      avatar.innerHTML="👤";
    }
  }

  // Cover (if you add HTML cover area later)
  const cover=$("profileCoverImg");
  if(cover){
    if(p.cover_url){
      cover.style.backgroundImage = `url('${p.cover_url}')`;
    }else{
      cover.style.backgroundImage = "";
    }
  }

  // Basic data
  $("pv-name") && ($("pv-name").innerText = p.name || "—");
  $("pv-phone") && ($("pv-phone").innerText = p.phone || "—");

  const carLine = (p.role==="driver")
    ? `${p.carBrand||""} ${p.carNumber||""}`.trim()
    : "👤 Client";
  $("pv-car") && ($("pv-car").innerText = carLine);

  // rating/points from backend
  try{
    const j = await apiGet(`/api/users/${encodeURIComponent(tgId())}`);
    const user = j.user || {};
    const rating = Number(user.rating||0);
    const points = Number(user.points||0);
    $("pv-rating") && ($("pv-rating").innerText = `${rating.toFixed(1)} ⭐`);
    $("pv-points") && ($("pv-points").innerText = `${points} 🏆`);
  }catch(e){
    $("pv-rating") && ($("pv-rating").innerText = `0.0 ⭐`);
    $("pv-points") && ($("pv-points").innerText = `0 🏆`);
  }

  // Fill edit form
  $("ep-name") && ($("ep-name").value = p.name||"");
  $("ep-phone") && ($("ep-phone").value = p.phone||"");
  $("ep-car-brand") && ($("ep-car-brand").value = p.carBrand||"");
  $("ep-car-number") && ($("ep-car-number").value = p.carNumber||"");

  await renderMyAds();
  await renderCarGallery();
}

// Hook nav(profile) properly
const __nav_original = window.nav;
window.nav = async (where)=>{
  if(where==="profile"){
    setActiveNav("profile");
    showScreen("screen-profile-view");
    await renderProfileView();
    return;
  }
  return __nav_original(where);
};

// =============================
// PROFILE PHOTO / COVER UPLOAD (DEVICE ONLY)
// =============================
window.uploadProfilePhoto = async ()=>{
  const p=getProfile();
  if(!p) return;

  const file=await pickFile("image/*");
  if(!file) return;

  try{
    toast("⏳ Upload...");
    const url=await uploadFileToBackend(file);
    const np={...p, photo_url:url};
    setProfile(np);
    toast("✅ Avatar saqlandi");
    await apiPost("/api/users/upsert",{
      telegram_id: tgId(),
      role: np.role,
      name: np.name,
      phone: np.phone,
      username: np.username||tgUsername(),
      bio: np.bio||"",
      photo_url: np.photo_url||"",
      cover_url: np.cover_url||""
    });
    await renderProfileView();
    await loadAds();
  }catch(e){
    console.log(e);
    toast("❌ Upload error", true);
  }
};

window.uploadCoverPhoto = async ()=>{
  const p=getProfile();
  if(!p) return;

  const file=await pickFile("image/*");
  if(!file) return;

  try{
    toast("⏳ Upload...");
    const url=await uploadFileToBackend(file);
    const np={...p, cover_url:url};
    setProfile(np);
    toast("✅ Cover saqlandi");
    await apiPost("/api/users/upsert",{
      telegram_id: tgId(),
      role: np.role,
      name: np.name,
      phone: np.phone,
      username: np.username||tgUsername(),
      bio: np.bio||"",
      photo_url: np.photo_url||"",
      cover_url: np.cover_url||""
    });
    await renderProfileView();
  }catch(e){
    console.log(e);
    toast("❌ Upload error", true);
  }
};

// =============================
// CAR GALLERY (DEVICE UPLOAD)
// =============================
window.addCarPhoto = async ()=>{
  const p=getProfile();
  if(!p) return;

  const file=await pickFile("image/*");
  if(!file) return;

  try{
    toast("⏳ Upload...");
    const url=await uploadFileToBackend(file);

    await apiPost("/api/car-photos/add",{
      telegram_id: tgId(),
      image_url: url
    });

    toast("✅ Car photo qo‘shildi");
    await renderCarGallery();
  }catch(e){
    console.log(e);
    toast("❌ Upload error", true);
  }
};

async function renderCarGallery(){
  const box=$("carGallery");
  if(!box) return;

  try{
    const j=await apiGet(`/api/car-photos/${encodeURIComponent(tgId())}`);
    const photos = Array.isArray(j.photos)?j.photos:[];
    if(photos.length===0){
      box.innerHTML = `<div class="muted small">🚘 Car photos yo‘q</div>`;
      return;
    }

    box.innerHTML = `
      <div class="gallery-grid">
        ${photos.map(p=>`<img src="${escapeHtml(p.image_url)}" onclick="openFullscreenImage('${escapeJs(p.image_url)}')" />`).join("")}
      </div>
    `;
  }catch(e){
    box.innerHTML = `<div class="muted small">⚠️ Gallery error</div>`;
  }
}

// Fullscreen viewer
window.openFullscreenImage = (url)=>{
  const wrap=document.createElement("div");
  wrap.style.position="fixed";
  wrap.style.inset="0";
  wrap.style.zIndex="99999";
  wrap.style.background="rgba(0,0,0,.85)";
  wrap.style.display="grid";
  wrap.style.placeItems="center";
  wrap.onclick=()=>wrap.remove();

  wrap.innerHTML = `
    <img src="${escapeHtml(url)}" style="max-width:92vw; max-height:88vh; border-radius:18px; border:1px solid rgba(255,255,255,.18);" />
  `;
  document.body.appendChild(wrap);
};

// =============================
// MY ADS LIST + DELETE
// =============================
async function renderMyAds(){
  const listEl=$("myAdsList");
  if(!listEl) return;

  const me = tgId();
  const mine = ADS_CACHE.filter(a=>String(a.telegram_id||"")===String(me));

  if(mine.length===0){
    listEl.innerHTML = `<div class="glass card"><div class="muted">${t("no_ads")}</div></div>`;
    return;
  }

  mine.sort((a,b)=>(b.created_at||0)-(a.created_at||0));
  listEl.innerHTML="";

  mine.forEach(ad=>{
    const div=document.createElement("div");
    div.className="glass card";
    div.innerHTML=`
      <div class="card-body">
        <div class="route-line">
          <span class="route-pill">${escapeHtml(ad.frm||"")}</span>
          <span>→</span>
          <span class="route-pill">${escapeHtml(ad.too||"")}</span>
        </div>
        <div class="card-info">
          <div class="badge">💰 ${escapeHtml(String(ad.price||""))}</div>
          <div class="badge">👥 ${escapeHtml(String(ad.seats||0))}</div>
          <button class="chip" onclick="deleteMyAd(${ad.id})">🗑 Delete</button>
        </div>
      </div>
    `;
    listEl.appendChild(div);
  });
}

window.deleteMyAd = async (adId)=>{
  try{
    await apiDelete(`/api/ads/${adId}?telegram_id=${encodeURIComponent(tgId())}`);
    toast("✅ Deleted");
    await loadAds();
    await renderMyAds();
  }catch(e){
    console.log(e);
    toast("❌ Delete error", true);
  }
};

// =============================
// RENDER CARD UPDATE (FAVORITE HEART ICON)
// =============================
// Patch renderCard to show favorite icon on right
const __renderCard_original = renderCard;
renderCard = function(ad, geo, geoEnabled){
  const card = __renderCard_original(ad, geo, geoEnabled);

  // Replace like button content => favorite (local)
  const fav = isFavorite(ad.telegram_id) ? "💛" : "🤍";
  const likeBtn = card.querySelector(".like-btn");
  if(likeBtn){
    likeBtn.innerText = fav;
    likeBtn.onclick = ()=>toggleFavorite(ad.telegram_id);
  }

  // Click -> open detail popup
  const body = card.querySelector(".card-body");
  if(body){
    body.style.cursor="pointer";
    body.onclick = ()=>openAdDetail(ad.id);
  }

  return card;
};

// =============================
// AD DETAIL POPUP (FULL INFO)
// =============================
window.openAdDetail = async (adId)=>{
  const ad = ADS_CACHE.find(x=>Number(x.id)===Number(adId));
  if(!ad) return;

  // count view
  try{
    await apiPost(`/api/ads/${adId}/view`, { viewer_telegram_id: tgId() });
  }catch(e){}

  const txt = `
🚕 ${ad.name||"—"}
📞 ${ad.phone||""}

🗺 ${ad.frm||""} → ${ad.too||""}
💰 ${ad.price||""}
👥 ${ad.seats ?? 0}
🏆 ${ad.points ?? 0}
👁 ${ad.views ?? 0}

🚘 ${ad.car_brand||""} ${ad.car_number||""}

📝 ${ad.comment||""}
  `.trim();

  try{
    Telegram.WebApp.showPopup({
      title:"📌 E’lon",
      message: txt,
      buttons:[{type:"ok"}]
    });
  }catch(e){
    alert(txt);
  }

  await loadAds();
};

// =============================
// PROFILES DIRECTORY (Settings -> 👥 Profiles)
// =============================
window.openProfiles = async ()=>{
  openSheet("profilesSheet");
  await loadProfiles();
};

async function loadProfiles(){
  const list=$("profilesList");
  if(!list) return;

  list.innerHTML = `<div class="muted">⏳ Loading...</div>`;

  try{
    const j = await apiGet("/api/users");
    const users = Array.isArray(j.users)?j.users:[];
    USERS_CACHE = users;

    renderProfiles();
  }catch(e){
    list.innerHTML = `<div class="muted">⚠️ Profiles error</div>`;
  }
}

window.searchProfiles = ()=>{
  renderProfiles();
};

function renderProfiles(){
  const list=$("profilesList");
  if(!list) return;

  const q=($("profilesSearch")?.value||"").trim().toLowerCase();
  let users=[...USERS_CACHE];

  if(q){
    users = users.filter(u=>{
      const s=`${u.name||""} ${u.phone||""} ${u.username||""} ${u.car_brand||""} ${u.car_number||""}`.toLowerCase();
      return s.includes(q);
    });
  }

  if(users.length===0){
    list.innerHTML = `<div class="muted">No users</div>`;
    return;
  }

  list.innerHTML = "";
  users.forEach(u=>{
    const div=document.createElement("div");
    div.className="glass card";

    const avatarStyle = u.photo_url ? `style="background-image:url('${escapeHtml(u.photo_url)}')"` : "";
    const online = (typeof ONLINE_SET!=="undefined" && ONLINE_SET.has(String(u.telegram_id))) ? "🟢 Online" : "⚫ Offline";

    div.innerHTML = `
      <div class="card-head">
        <div class="card-left">
          <div class="card-avatar" ${avatarStyle}></div>
          <div>
            <div class="card-name">${escapeHtml(u.name||"—")}</div>
            <div class="card-sub">${escapeHtml(u.car_brand||"")} ${escapeHtml(u.car_number||"")}</div>
            <div class="mini">${online}</div>
          </div>
        </div>

        <button class="like-btn" onclick="toggleFavorite('${escapeJs(u.telegram_id)}')">
          ${isFavorite(u.telegram_id) ? "💛" : "🤍"}
        </button>
      </div>

      <div class="card-body">
        <div class="card-info">
          <div class="badge">📞 ${escapeHtml(u.phone||"")}</div>
          <div class="badge">⭐ ${escapeHtml(String(u.rating||0))}</div>
          <div class="badge">🏆 ${escapeHtml(String(u.points||0))}</div>
        </div>

        <div class="card-actions">
          <button class="action call" onclick="callPhone('${escapeJs(u.phone||"")}')">Call</button>
          <button class="action msg" onclick="msgUser('${escapeJs(u.telegram_id)}','${escapeJs(u.name||"")}')">Message</button>
        </div>
      </div>
    `;
    list.appendChild(div);
  });
}

// =============================
// NEWS SECTION (Settings -> 📰 News)
// =============================
window.openNews = async ()=>{
  openSheet("newsSheet");
  await loadNews();
};

async function loadNews(){
  const list=$("newsList");
  if(!list) return;

  list.innerHTML = `<div class="muted">⏳ Loading...</div>`;

  try{
    const j = await apiGet("/api/news");
    const items = Array.isArray(j.news)?j.news:[];
    renderNews(items);
  }catch(e){
    list.innerHTML = `<div class="muted">⚠️ News error</div>`;
  }
}

function renderNews(items){
  const list=$("newsList");
  if(!list) return;

  if(items.length===0){
    list.innerHTML = `<div class="muted">No news</div>`;
    return;
  }

  list.innerHTML="";
  items.sort((a,b)=>(b.created_at||0)-(a.created_at||0));
  items.forEach(n=>{
    const div=document.createElement("div");
    div.className="glass card";

    div.innerHTML=`
      <div class="card-body">
        <div class="card-name">${escapeHtml(n.title||"—")}</div>
        <div class="badge">${escapeHtml(n.text||"")}</div>
        ${n.image_url ? `<img src="${escapeHtml(n.image_url)}" style="width:100%; border-radius:18px; margin-top:10px; border:1px solid rgba(255,255,255,.14)"/>` : ""}
        <div class="mini muted" style="margin-top:8px;">📅 ${new Date((n.created_at||Date.now())*1000).toLocaleString()}</div>
      </div>
    `;
    list.appendChild(div);
  });
}

// =============================
// ADMIN ULTRA: Banner upload + News create
// =============================
window.adminUploadBanner = async ()=>{
  if(!isAdminLocal()){
    toast("❌ Admin emas", true);
    return;
  }

  const file = await pickFile();
  if(!file) return;

  try{
    toast("⏳ Banner upload...");
    const url = await uploadFileToBackend(file);

    await apiPost("/api/admin/banner/set", {
      telegram_id: tgId(),
      image_url: url
    });

    toast("✅ Banner qo‘yildi (3s)");
  }catch(e){
    console.log(e);
    toast("❌ Banner error", true);
  }
};

window.adminCreateNews = async ()=>{
  if(!isAdminLocal()){
    toast("❌ Admin emas", true);
    return;
  }

  const title = ($("newsTitle")?.value || "").trim();
  const text  = ($("newsText")?.value || "").trim();

  if(!title || !text){
    toast("❗ Title va text shart", true);
    return;
  }

  try{
    let image_url = "";

    // optional image upload
    const file = await pickFile("image/*");
    if(file){
      toast("⏳ Upload image...");
      image_url = await uploadFileToBackend(file);
    }

    await apiPost("/api/admin/news/create", {
      telegram_id: tgId(),
      title,
      text,
      image_url
    });

    toast("✅ News joylandi");
    if($("newsTitle")) $("newsTitle").value="";
    if($("newsText")) $("newsText").value="";
    await loadNews();
  }catch(e){
    console.log(e);
    toast("❌ News error", true);
  }
};

// =====================================================
// ✅ END FINAL PACK 2/3
// Next: FINAL PACK 3/3 (WebSocket chat + presence + typing + voice)
// =====================================================
// =====================================================
// ✅ ULTRA FINAL PACK — PART 3/3
// WEBSOCKET CHAT + PRESENCE + TYPING + VOICE
// =====================================================

// =============================
// WS CONFIG
// =============================
let WS_URL = "";
try{
  // If you deploy WS at same domain:
  // wss://taxi-mini-app.onrender.com/ws
  WS_URL = (location.protocol === "https:" ? "wss://" : "ws://") + location.host + "/ws";
}catch(e){
  WS_URL = "";
}

let ws=null;
let wsConnected=false;
let wsReconnectTimer=null;

let CHAT_STATE = {
  ready:false,
  dialogs:[],         // {peer_id, peer_name, last_text, ts}
  messagesByPeer:{},  // peer_id => [{from,to,text,ts,type,url}]
  typingPeers:new Set()
};

// =============================
// WS CONNECT / RECONNECT
// =============================
function wsConnect(){
  if(!WS_URL) return;

  try{
    if(ws && (ws.readyState===1 || ws.readyState===0)) return;

    ws = new WebSocket(WS_URL);
    wsConnected=false;

    ws.onopen = ()=>{
      wsConnected=true;
      CHAT_STATE.ready=true;

      // handshake
      wsSend({
        type:"hello",
        user_id: tgId(),
        name: (getProfile()?.name || tgName() || "User")
      });

      // request dialogs
      wsSend({ type:"dialogs", user_id: tgId() });

      // presence ON
      wsSend({ type:"presence", user_id: tgId(), online:true });

      updateOnlineLine();
    };

    ws.onmessage = (ev)=>{
      let data=null;
      try{ data=JSON.parse(ev.data); }catch(e){ return; }
      handleWsMessage(data);
    };

    ws.onclose = ()=>{
      wsConnected=false;
      updateOnlineLine();
      wsAutoReconnect();
    };

    ws.onerror = ()=>{
      wsConnected=false;
      updateOnlineLine();
      wsAutoReconnect();
    };
  }catch(e){
    wsConnected=false;
    wsAutoReconnect();
  }
}

function wsAutoReconnect(){
  if(wsReconnectTimer) return;
  wsReconnectTimer = setTimeout(()=>{
    wsReconnectTimer=null;
    wsConnect();
  }, 2500);
}

function wsSend(obj){
  try{
    if(ws && ws.readyState===1){
      ws.send(JSON.stringify(obj));
    }
  }catch(e){}
}

// =============================
// HANDLE WS EVENTS
// =============================
function handleWsMessage(msg){
  const ttype = msg.type;

  if(ttype==="dialogs"){
    CHAT_STATE.dialogs = Array.isArray(msg.dialogs) ? msg.dialogs : [];
    renderChatList();
    return;
  }

  if(ttype==="presence"){
    // msg: {user_id, online}
    if(msg.user_id){
      if(msg.online) ONLINE_SET.add(String(msg.user_id));
      else ONLINE_SET.delete(String(msg.user_id));

      // update profiles list online badges
      renderProfiles();
      renderChatList();
    }
    return;
  }

  if(ttype==="typing"){
    // msg: {from, to, typing}
    if(msg.from){
      if(msg.typing) CHAT_STATE.typingPeers.add(String(msg.from));
      else CHAT_STATE.typingPeers.delete(String(msg.from));
      renderChatHeaderTyping();
    }
    return;
  }

  if(ttype==="message"){
    // msg: {from,to,text,ts,name,type,url}
    const peerId = (String(msg.from)===String(tgId())) ? String(msg.to) : String(msg.from);
    if(!CHAT_STATE.messagesByPeer[peerId]) CHAT_STATE.messagesByPeer[peerId]=[];

    CHAT_STATE.messagesByPeer[peerId].push({
      from:String(msg.from||""),
      to:String(msg.to||""),
      text: msg.text||"",
      ts: msg.ts||Date.now(),
      kind: msg.kind||"text",
      url: msg.url||""
    });

    // update dialogs
    upsertDialog(peerId, msg.name||"User", msg.text||"[media]", msg.ts||Date.now());

    // render if chat open
    if(ACTIVE_CHAT && String(ACTIVE_CHAT.peer_id)===String(peerId)){
      renderChatMessages(peerId);
    }
    renderChatList();
    return;
  }
}

// =============================
// DIALOG UPSERT
// =============================
function upsertDialog(peer_id, peer_name, last_text, ts){
  peer_id=String(peer_id||"");
  const idx = CHAT_STATE.dialogs.findIndex(d=>String(d.peer_id)===peer_id);
  const item = { peer_id, peer_name, last_text, ts };
  if(idx>=0) CHAT_STATE.dialogs[idx]=item;
  else CHAT_STATE.dialogs.unshift(item);

  CHAT_STATE.dialogs.sort((a,b)=>(b.ts||0)-(a.ts||0));
}

// =============================
// CHAT UI OPEN/CLOSE
// =============================

// override msgUser from PART 1:
window.msgUser = (toTelegramId, name)=>{
  const peer_id = String(toTelegramId||"");
  const peer_name = String(name||"User");

  // open chat sheet
  ACTIVE_CHAT = { peer_id, peer_name };
  openSheet("chatSheet");
  $("chatPeerName") && ($("chatPeerName").innerText = peer_name);

  // load messages
  if(!CHAT_STATE.messagesByPeer[peer_id]) CHAT_STATE.messagesByPeer[peer_id]=[];
  renderChatMessages(peer_id);

  // request history (optional)
  wsSend({ type:"history", user_id: tgId(), peer_id });

  // mark dialog exists
  upsertDialog(peer_id, peer_name, "", Date.now());
  renderChatList();
};

window.closeChat = ()=>{
  ACTIVE_CHAT=null;
  closeSheet("chatSheet");
};

// =============================
// CHAT LIST (in settings)
// =============================
window.openChatList = ()=>{
  openSheet("chatListSheet");
  renderChatList();
};

function renderChatList(){
  const list = $("chatList");
  if(!list) return;

  const dialogs = Array.isArray(CHAT_STATE.dialogs)?CHAT_STATE.dialogs:[];
  if(dialogs.length===0){
    list.innerHTML = `<div class="muted small">💬 Chat yo‘q</div>`;
    return;
  }

  list.innerHTML = "";
  dialogs.forEach(d=>{
    const online = ONLINE_SET.has(String(d.peer_id)) ? "🟢" : "⚫";
    const typing = CHAT_STATE.typingPeers.has(String(d.peer_id)) ? "… typing" : "";

    const div=document.createElement("div");
    div.className="glass card";
    div.innerHTML=`
      <div class="card-head">
        <div class="card-left">
          <div class="card-avatar">${online}</div>
          <div>
            <div class="card-name">${escapeHtml(d.peer_name||"User")}</div>
            <div class="card-sub">${typing || escapeHtml(d.last_text||"")}</div>
          </div>
        </div>
        <button class="chip" onclick="msgUser('${escapeJs(d.peer_id)}','${escapeJs(d.peer_name||"User")}')">Open</button>
      </div>
    `;
    list.appendChild(div);
  });
}

// =============================
// CHAT MESSAGES RENDER
// =============================
function renderChatMessages(peer_id){
  const box = $("chatMessages");
  if(!box) return;

  const msgs = CHAT_STATE.messagesByPeer[String(peer_id)] || [];
  if(msgs.length===0){
    box.innerHTML = `<div class="muted small">💬 Hozircha xabar yo‘q</div>`;
    return;
  }

  box.innerHTML = msgs.map(m=>{
    const mine = String(m.from)===String(tgId());
    const align = mine ? "right" : "left";
    const bubbleClass = mine ? "msg-bubble mine" : "msg-bubble";

    let content = "";
    if(m.kind==="voice" && m.url){
      content = `<audio controls src="${escapeHtml(m.url)}" style="width:220px;"></audio>`;
    }else{
      content = `<div>${escapeHtml(m.text||"")}</div>`;
    }

    return `
      <div class="msg-row ${align}">
        <div class="${bubbleClass}">
          ${content}
          <div class="msg-time">${new Date(m.ts).toLocaleTimeString()}</div>
        </div>
      </div>
    `;
  }).join("");

  // scroll bottom
  setTimeout(()=>{ box.scrollTop = box.scrollHeight; }, 50);
}

function renderChatHeaderTyping(){
  const el=$("chatTyping");
  if(!el || !ACTIVE_CHAT) return;

  const peerId=String(ACTIVE_CHAT.peer_id||"");
  el.innerText = CHAT_STATE.typingPeers.has(peerId) ? "Typing…" : "";
}

// =============================
// SEND TEXT MESSAGE
// =============================
window.sendChatMessage = ()=>{
  if(!ACTIVE_CHAT) return;
  const input = $("chatInput");
  if(!input) return;

  const text = (input.value||"").trim();
  if(!text) return;

  input.value="";

  // optimistic add
  const peerId=String(ACTIVE_CHAT.peer_id);
  if(!CHAT_STATE.messagesByPeer[peerId]) CHAT_STATE.messagesByPeer[peerId]=[];
  CHAT_STATE.messagesByPeer[peerId].push({
    from: tgId(),
    to: peerId,
    text,
    ts: Date.now(),
    kind:"text",
    url:""
  });

  upsertDialog(peerId, ACTIVE_CHAT.peer_name, text, Date.now());
  renderChatMessages(peerId);
  renderChatList();

  // send to WS
  wsSend({
    type:"message",
    from: tgId(),
    to: peerId,
    text,
    name: getProfile()?.name || tgName() || "User",
    kind:"text"
  });
};

// =============================
// TYPING INDICATOR
// =============================
let typingTimer=null;
window.chatTyping = ()=>{
  if(!ACTIVE_CHAT) return;
  const peerId=String(ACTIVE_CHAT.peer_id);

  wsSend({ type:"typing", from: tgId(), to: peerId, typing:true });

  if(typingTimer) clearTimeout(typingTimer);
  typingTimer = setTimeout(()=>{
    wsSend({ type:"typing", from: tgId(), to: peerId, typing:false });
  }, 800);
};

// =============================
// VOICE MESSAGE SUPPORT
// =============================
window.sendVoiceMessage = async ()=>{
  if(!ACTIVE_CHAT) return;

  // For now we use file picker as "voice"
  // Later: real audio recorder
  const file = await pickFile("audio/*");
  if(!file) return;

  try{
    toast("⏳ Upload voice...");
    const url = await uploadFileToBackend(file);

    const peerId=String(ACTIVE_CHAT.peer_id);
    if(!CHAT_STATE.messagesByPeer[peerId]) CHAT_STATE.messagesByPeer[peerId]=[];

    // optimistic push
    CHAT_STATE.messagesByPeer[peerId].push({
      from: tgId(),
      to: peerId,
      text: "[voice]",
      ts: Date.now(),
      kind:"voice",
      url
    });

    upsertDialog(peerId, ACTIVE_CHAT.peer_name, "[voice]", Date.now());
    renderChatMessages(peerId);
    renderChatList();

    // send over WS
    wsSend({
      type:"message",
      from: tgId(),
      to: peerId,
      text: "[voice]",
      name: getProfile()?.name || tgName() || "User",
      kind:"voice",
      url
    });

  }catch(e){
    console.log(e);
    toast("❌ Voice upload error", true);
  }
};

// =============================
// ONLINE LINE (optional UI text)
// =============================
function updateOnlineLine(){
  const el=$("wsStatus");
  if(!el) return;
  el.innerText = wsConnected ? "🟢 WS Online" : "⚫ WS Offline";
}

// =============================
// START WS AUTO
// =============================
document.addEventListener("DOMContentLoaded", ()=>{
  // connect ws after boot
  setTimeout(()=>wsConnect(), 1200);

  // presence off when close
  window.addEventListener("beforeunload", ()=>{
    try{
      wsSend({ type:"presence", user_id: tgId(), online:false });
    }catch(e){}
  });
});

// =====================================================
// ✅ END ULTRA FINAL PACK 3/3
// =====================================================
