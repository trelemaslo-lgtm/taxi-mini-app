// =============================
// 711 TAXI — ULTRA FRONTEND v2.5+
// Works with: ULTRA Flask backend + WS server
// =============================

// ====== CONFIG ======
const API = "https://taxi-backend-5kl2.onrender.com";
const WS_HTTP = "https://taxi-mini-app.onrender.com"; // your WS service
const ADMIN_TELEGRAM_ID = "6813692852";
const AUTO_DELETE_SECONDS = 60 * 60; // (old) optional

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
    need_profile: "❗️ Profilni to‘ldiring",
    fill_required: "❗️ A, B va Narx shart!",
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
    need_profile: "❗️ Заполните профиль",
    fill_required: "❗️ Точка A, B и цена обязательны!",
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
    need_profile: "❗️ Профилни тўлдиринг",
    fill_required: "❗️ A, B ва нарх шарт!",
  }
};

// ========= SAFE HELPERS =========
const $ = (id) => document.getElementById(id);

function safeJson(v, fallback){
  try { return JSON.parse(v); } catch { return fallback; }
}

function escapeHtml(str){
  return String(str || "").replace(/[&<>"']/g, s=>({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[s]));
}
function escapeJs(str){
  return String(str||"").replace(/\\/g,"\\\\").replace(/'/g,"\\'");
}

// ====== TELEGRAM SAFE ======
function tgUser(){
  try{
    return Telegram?.WebApp?.initDataUnsafe?.user || null;
  }catch(e){ return null; }
}
function tgId(){
  return String(tgUser()?.id || "");
}
function tgName(){
  const u = tgUser();
  if(!u) return "";
  return (u.first_name || "") + (u.last_name ? (" " + u.last_name) : "");
}
function tgUsername(){
  const u = tgUser();
  if(!u) return "";
  return u.username ? ("@" + u.username) : "";
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
  if(name==="home") $("navHome")?.classList.add("active");
  if(name==="profile") $("navProfile")?.classList.add("active");
}

function openSheet(id){
  const el = $(id);
  if(el) el.classList.add("open");
}
function closeSheet(id){
  const el = $(id);
  if(el) el.classList.remove("open");
}
function sheetOutside(e,id){
  if(e.target.id===id) closeSheet(id);
}
window.openSheet = openSheet;
window.closeSheet = closeSheet;
window.sheetOutside = sheetOutside;

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

// ====== STATE ======
let FEED_MODE = "drivers"; // drivers | clients
let SORT_MODE = "time";    // time | distance
let ADS_CACHE = [];
let USERS_CACHE = [];
let ONLINE_SET = new Set(); // WS online

// ====== LOCAL STORAGE KEYS ======
const LS = {
  lang: "lang",
  role: "role",
  profile: "profile",
  geo: "geo",
  notify: "notify",
  bannerSeen: "bannerSeen"
};

// ====== PROFILE (LOCAL BASIC CACHE) ======
function getProfile(){
  return safeJson(localStorage.getItem(LS.profile) || "null", null);
}
function setProfile(p){
  localStorage.setItem(LS.profile, JSON.stringify(p));
}

// ====== GEO ======
function saveGeo(lat,lng){
  localStorage.setItem(LS.geo, JSON.stringify({lat,lng,ts:Date.now()}));
}
function getGeo(){
  return safeJson(localStorage.getItem(LS.geo) || "null", null);
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

// =============================
// BACKEND API WRAPPER
// =============================
async function apiGet(path){
  const r = await fetch(API + path);
  const j = await r.json().catch(()=> ({}));
  if(!r.ok) throw new Error(j?.error || "GET failed");
  return j;
}
async function apiPost(path, body){
  const r = await fetch(API + path, {
    method:"POST",
    headers:{ "Content-Type":"application/json" },
    body: JSON.stringify(body || {})
  });
  const j = await r.json().catch(()=> ({}));
  if(!r.ok) throw new Error(j?.error || "POST failed");
  return j;
}
async function apiPut(path, body){
  const r = await fetch(API + path, {
    method:"PUT",
    headers:{ "Content-Type":"application/json" },
    body: JSON.stringify(body || {})
  });
  const j = await r.json().catch(()=> ({}));
  if(!r.ok) throw new Error(j?.error || "PUT failed");
  return j;
}
async function apiDelete(path){
  const r = await fetch(API + path, { method:"DELETE" });
  const j = await r.json().catch(()=> ({}));
  if(!r.ok) throw new Error(j?.error || "DELETE failed");
  return j;
}

// =============================
// SUPABASE UPLOAD via BACKEND
// =============================
async function uploadFileToBackend(file){
  const fd = new FormData();
  fd.append("file", file);

  const r = await fetch(API + "/api/upload", {
    method:"POST",
    body: fd
  });
  const j = await r.json().catch(()=> ({}));
  if(!r.ok || !j.ok) throw new Error(j?.error || "upload failed");
  return j.url;
}

// =============================
// WS (CHAT + PRESENCE)
// =============================
let ws = null;
let wsRetry = 0;
let wsPingTimer = null;

function wsUrl(){
  const base = WS_HTTP.replace("https://","wss://").replace("http://","ws://");
  const uid = tgId() || "guest";
  return `${base}/ws?uid=${encodeURIComponent(uid)}`;
}

function wsSend(obj){
  try{
    if(!ws || ws.readyState !== 1) return;
    ws.send(JSON.stringify(obj));
  }catch(e){}
}

function wsConnect(){
  try{
    if(ws && (ws.readyState===0 || ws.readyState===1)) return;

    ws = new WebSocket(wsUrl());

    ws.onopen = ()=>{
      wsRetry = 0;
      console.log("✅ WS connected");

      if(wsPingTimer) clearInterval(wsPingTimer);
      wsPingTimer = setInterval(()=> wsSend({type:"ping"}), 20000);

      // request online list
      wsSend({type:"presence_list"});
    };

    ws.onmessage = (e)=>{
      try{
        const msg = JSON.parse(e.data);

        if(msg.type==="presence_list"){
          ONLINE_SET = new Set(msg.online || []);
          renderCards(); // refresh online badges
          return;
        }

        if(msg.type==="presence"){
          const uid = String(msg.uid||"");
          if(msg.status==="online") ONLINE_SET.add(uid);
          if(msg.status==="offline") ONLINE_SET.delete(uid);
          renderCards();
          return;
        }

        if(msg.type==="typing"){
          handleTyping(msg);
          return;
        }

        if(msg.type==="message"){
          handleIncomingMessage(msg);
          return;
        }

      }catch(err){
        console.log("WS message parse error", err);
      }
    };

    ws.onclose = ()=>{
      console.log("❌ WS disconnected");
      if(wsPingTimer) clearInterval(wsPingTimer);
      wsRetry++;
      const wait = Math.min(15000, 700 * wsRetry);
      setTimeout(wsConnect, wait);
    };

    ws.onerror = ()=>{
      // do nothing
    };

  }catch(e){
    console.log("WS connect error", e);
  }
}

// =============================
// CHAT (ULTRA BASIC UI LOGIC)
// NOTE: We use Telegram popup minimal now.
// Full chat screen later (final UI).
// =============================
let ACTIVE_CHAT = null; // {chat_id, to, name}

async function openChat(toTelegramId, name){
  const my = tgId();
  if(!my || !toTelegramId) return;

  const chat_id = [my, String(toTelegramId)].sort().join("_");
  ACTIVE_CHAT = { chat_id, to: String(toTelegramId), name: name || "User" };

  // load history
  let items = [];
  try{
    const j = await apiGet(`/api/messages/${encodeURIComponent(chat_id)}?limit=60`);
    items = j.items || [];
  }catch(e){}

  // show simple popup with last messages + send
  const last = items.slice(0,8).reverse().map(m=>{
    const who = (String(m.from_telegram_id)===my) ? "You" : (name||"User");
    return `${who}: ${m.text || (m.voice_url ? "🎤 Voice" : "")}`;
  }).join("\n");

  try{
    Telegram.WebApp.showPopup({
      title: "💬 " + (name||"Chat"),
      message: last ? last : "Chat ready ✅\nYozing...",
      buttons: [{id:"send", type:"default", text:"Send message"},{type:"cancel"}]
    }, (btnId)=>{
      if(btnId==="send"){
        Telegram.WebApp.showPopup({
          title:"✍️",
          message:"Message yuborish uchun pastdagi inputdan foydalanamiz (keyingi update).",
          buttons:[{type:"ok"}]
        });
      }
    });
  }catch(e){
    alert("Chat opened");
  }
}

function handleTyping(msg){
  // typing indicator placeholder
}

async function handleIncomingMessage(msg){
  // save to backend for history
  try{
    await apiPost("/api/messages/save", {
      chat_id: msg.chat_id,
      from_telegram_id: msg.from,
      to_telegram_id: msg.to,
      text: msg.text || ""
    });
  }catch(e){}
}

// send text message (hook later)
async function sendChatText(text){
  if(!ACTIVE_CHAT) return;
  const my = tgId();
  wsSend({
    type:"message",
    chat_id: ACTIVE_CHAT.chat_id,
    to: ACTIVE_CHAT.to,
    text: text
  });

  // save
  try{
    await apiPost("/api/messages/save", {
      chat_id: ACTIVE_CHAT.chat_id,
      from_telegram_id: my,
      to_telegram_id: ACTIVE_CHAT.to,
      text: text
    });
  }catch(e){}
}

// =============================
// ADMIN CHECK
// =============================
function isAdminLocal(){
  return tgId() === ADMIN_TELEGRAM_ID;
}

// =============================
// BANNER (3s on enter)
// =============================
async function checkAndShowBanner(){
  try{
    const seenKey = LS.bannerSeen + ":" + (new Date().toDateString());
    if(localStorage.getItem(seenKey)==="1") return;

    const j = await apiGet("/api/admin/banner");
    const banner = j.banner;
    if(!banner || !banner.image_url) return;

    // create overlay
    const wrap = document.createElement("div");
    wrap.style.position = "fixed";
    wrap.style.inset = "0";
    wrap.style.zIndex = "9999";
    wrap.style.background = "rgba(0,0,0,.55)";
    wrap.style.backdropFilter = "blur(10px)";
    wrap.style.display = "grid";
    wrap.style.placeItems = "center";

    wrap.innerHTML = `
      <div style="
        width:min(420px,92vw);
        border-radius:24px;
        overflow:hidden;
        border:1px solid rgba(255,255,255,.18);
        background:rgba(255,255,255,.08);
      ">
        <img src="${escapeHtml(banner.image_url)}" style="width:100%; display:block;" />
      </div>
    `;

    document.body.appendChild(wrap);

    setTimeout(()=>{
      wrap.remove();
      localStorage.setItem(seenKey,"1");
    }, 3000);

  }catch(e){}
}

// =============================
// BOOT
// =============================
document.addEventListener("DOMContentLoaded", async ()=>{
  try{
    if(window.Telegram && Telegram.WebApp){
      Telegram.WebApp.ready();
      Telegram.WebApp.expand();
    }
  }catch(e){}

  // loading hide
  setTimeout(()=> $("loading")?.classList.remove("active"), 900);

  // ws connect
  wsConnect();

  // show banner
  checkAndShowBanner();

  // init toggles
  initToggles();

  // admin btn show
  checkAdminBtn();

  // auto profile prefill from TG (first time)
  prefillProfileFromTelegram();

  // start logic
  const lang = localStorage.getItem(LS.lang);
  const role = localStorage.getItem(LS.role);
  const profile = getProfile();

  if(typeof applyI18n === "function") applyI18n();

  if(!lang){
    showScreen("screen-language");
    return;
  }
  if(!role){
    showScreen("screen-role");
    return;
  }
  if(!profile){
    showScreen("screen-profile");
    updateProfileUIRole();
    return;
  }

  // sync profile to backend (upsert)
  await syncProfileToBackend();

  showScreen("screen-home");
  nav("home");
});

// =============================
// LANGUAGE
// =============================
window.setLang = (lang)=>{
  localStorage.setItem(LS.lang, lang);
  if(typeof applyI18n === "function") applyI18n();

  const role = localStorage.getItem(LS.role);
  const profile = getProfile();
  if(!role) showScreen("screen-role");
  else if(!profile) showScreen("screen-profile");
};

// =============================
// ROLE
// =============================
window.selectRole = (role)=>{
  localStorage.setItem(LS.role, role);
  updateProfileUIRole();
  showScreen("screen-profile");
};

function updateProfileUIRole(){
  const role = localStorage.getItem(LS.role);
  const driverExtra = $("driver-extra");
  if(driverExtra){
    driverExtra.style.display = role==="driver" ? "block" : "none";
  }
}

window.goBackTo = (id)=> showScreen(id);

// =============================
// PROFILE PREFILL + SAVE
// =============================
function prefillProfileFromTelegram(){
  const u = tgUser();
  if(!u) return;

  // prefill only if inputs exist
  if($("p-name") && !$("p-name").value) $("p-name").value = tgName();
  if($("p-phone") && !$("p-phone").value) $("p-phone").value = ""; // user must input
}

async function syncProfileToBackend(){
  const p = getProfile();
  if(!p) return;

  try{
    await apiPost("/api/users/upsert", {
      telegram_id: tgId(),
      role: p.role,
      name: p.name,
      phone: p.phone,
      username: tgUsername(),
      bio: p.bio || "",
      photo_url: p.photo_url || "",
      cover_url: p.cover_url || "",
      city: p.city || ""
    });
  }catch(e){}
}

window.saveProfile = async ()=>{
  const role = localStorage.getItem(LS.role);
  const name = $("p-name")?.value.trim();
  const phone = $("p-phone")?.value.trim();
  const carBrand = $("p-car-brand")?.value.trim();
  const carNumber = $("p-car-number")?.value.trim();
  const bio = $("p-bio")?.value.trim();

  if(!name || !phone){
    toast("❗ Profilni to‘ldiring", true);
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
    photo_url: "",   // device only
    cover_url: "",   // device only
    bio: bio || "",
    city: ""
  };

  setProfile(profile);

  // sync to backend
  await syncProfileToBackend();

  showScreen("screen-home");
  nav("home");
};

// =============================
// DEVICE UPLOAD (Profile Photo / Cover)
// =============================
async function pickFile(){
  return new Promise((resolve)=>{
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = ()=> resolve(input.files?.[0] || null);
    input.click();
  });
}

window.uploadProfilePhoto = async ()=>{
  const p = getProfile();
  if(!p) return;

  const file = await pickFile();
  if(!file) return;

  try{
    toast("⏳ Upload...");
    const url = await uploadFileToBackend(file);
    const np = {...p, photo_url: url};
    setProfile(np);
    await syncProfileToBackend();
    toast("✅ Foto saqlandi");
    renderProfileView();
    loadAds();
  }catch(e){
    toast("❌ Upload error", true);
  }
};

window.uploadCoverPhoto = async ()=>{
  const p = getProfile();
  if(!p) return;

  const file = await pickFile();
  if(!file) return;

  try{
    toast("⏳ Upload...");
    const url = await uploadFileToBackend(file);
    const np = {...p, cover_url: url};
    setProfile(np);
    await syncProfileToBackend();
    toast("✅ Cover saqlandi");
    renderProfileView();
  }catch(e){
    toast("❌ Upload error", true);
  }
};

window.addCarPhoto = async ()=>{
  const p = getProfile();
  if(!p) return;

  const file = await pickFile();
  if(!file) return;

  try{
    toast("⏳ Upload...");
    const url = await uploadFileToBackend(file);
    await apiPost("/api/car-photos/add", { telegram_id: tgId(), image_url: url });
    toast("✅ Car photo qo‘shildi");
    renderProfileView();
  }catch(e){
    toast("❌ Upload error", true);
  }
};

// =============================
// NAV
// =============================
window.nav = async (where)=>{
  if(where==="home"){
    setActiveNav("home");
    showScreen("screen-home");
    await loadAds();
    return;
  }
  if(where==="profile"){
    setActiveNav("profile");
    showScreen("screen-profile-view");
    await renderProfileView();
    return;
  }
  if(where==="admin"){
    showScreen("screen-admin");
    await adminRefresh();
    return;
  }
};

// =============================
// FEED SWITCH + SEARCH
// =============================
window.switchFeed = async (mode)=>{
  FEED_MODE = mode;
  $("tabDrivers")?.classList.toggle("active", mode==="drivers");
  $("tabClients")?.classList.toggle("active", mode==="clients");
  await loadAds();
};

window.searchAds = async ()=>{
  // simple frontend filter from cache
  renderCards();
};

// =============================
// SORT
// =============================
window.toggleSort = async ()=>{
  const geoOn = $("geoToggle")?.checked;
  if(geoOn){
    SORT_MODE = (SORT_MODE==="distance") ? "time" : "distance";
  }else{
    SORT_MODE = "time";
  }
  updateSortLine();
  renderCards();
};

function updateSortLine(){
  const el = $("sortLine");
  if(!el) return;
  if(SORT_MODE==="distance"){
    el.innerHTML = `↕️ <span>Saralash: masofa</span>`;
  }else{
    el.innerHTML = `↕️ <span>Saralash: vaqt</span>`;
  }
}

// =============================
// LOAD ADS (ULTRA)
// =============================
async function loadAds(){
  const cards = $("cards");
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
    cards.innerHTML = `<div class="glass card"><div class="muted">⚠️ Server error</div></div>`;
  }
}

function renderCards(){
  const cards = $("cards");
  if(!cards) return;

  const q = ($("searchInput")?.value || "").trim().toLowerCase();
  const geo = getGeo();
  const geoEnabled = !!geo && ($("geoToggle")?.checked);

  let list = [...ADS_CACHE];

  // feed filter
  list = list.filter(a=>{
    if(FEED_MODE==="drivers") return a.role === "driver";
    return a.role === "client";
  });

  // search filter
  if(q){
    list = list.filter(a=>{
      const s = `${a.name||""} ${a.phone||""} ${a.frm||a.from||""} ${a.too||a.to||""} ${a.car_brand||""} ${a.car_number||""}`.toLowerCase();
      return s.includes(q);
    });
  }

  // sort
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
    cards.innerHTML = `<div class="glass card"><div class="muted">Hozircha e’lon yo‘q</div></div>`;
    return;
  }

  cards.innerHTML = "";
  list.forEach(ad => cards.appendChild(renderCard(ad, geo, geoEnabled)));
}

function renderCard(ad, geo, geoEnabled){
  const card = document.createElement("div");
  card.className = "glass card";

  const avatar = ad.photo_url ? `style="background-image:url('${escapeHtml(ad.photo_url)}')"` : "";
  const typeLabel = (()=>{
    if(ad.ad_type==="now") return "SRAZU EDI";
    if(ad.ad_type==="20") return "20 daqiqada";
    return "Odam to‘lsa";
  })();

  let dist = "";
  if(geoEnabled && geo && ad.lat && ad.lng){
    const d = distanceKm(geo.lat, geo.lng, ad.lat, ad.lng);
    dist = `📍 ${d.toFixed(1)} km`;
  }

  const seats = Number(ad.seats ?? 0);
  const fullBadge = seats<=0 ? `<div class="badge" style="border-color:rgba(255,80,80,.35)">🚫 TO‘LDI</div>` : "";

  const online = ONLINE_SET.has(String(ad.telegram_id||""));
  const onlineBadge = online ? `<div class="badge">🟢 Online</div>` : `<div class="badge">⚫ Offline</div>`;

  const me = tgId();
  const isOwner = String(ad.telegram_id||"") === String(me);

  const ownerSeatsControls = isOwner ? `
    <div style="display:flex; gap:8px; align-items:center;">
      <button class="chip" onclick="seatsDelta(${ad.id},-1)">➖</button>
      <div class="badge">👥 ${seats}</div>
      <button class="chip" onclick="seatsDelta(${ad.id},1)">➕</button>
    </div>
  ` : `<div class="badge">👥 ${seats}</div>`;

  card.innerHTML = `
    <div class="card-head">
      <div class="card-left">
        <div class="card-avatar" ${avatar}></div>
        <div>
          <div class="card-name">${escapeHtml(ad.name || "—")}</div>
          <div class="card-sub">${escapeHtml(ad.car_brand || "")} ${escapeHtml(ad.car_number || "")}</div>
        </div>
      </div>

      <button class="like-btn" onclick="likeDriver('${escapeJs(ad.phone||"")}')">💛</button>
    </div>

    <div class="card-body" onclick="openAdDetail(${ad.id})" style="cursor:pointer;">
      <div class="route-line">
        <span class="route-pill">${escapeHtml(ad.frm || "")}</span>
        <span>→</span>
        <span class="route-pill">${escapeHtml(ad.too || "")}</span>
      </div>

      <div class="card-info">
        <div class="badge">⏱ ${escapeHtml(typeLabel)}</div>
        ${ownerSeatsControls}
        ${fullBadge}
        <div class="badge">💰 ${escapeHtml(String(ad.price ?? ""))}</div>
        ${dist ? `<div class="badge">${dist}</div>` : ""}
        <div class="badge">🏆 ${escapeHtml(String(ad.points ?? 0))}</div>
        <div class="badge">👁 ${escapeHtml(String(ad.views ?? 0))}</div>
        ${onlineBadge}
      </div>

      ${ad.comment ? `<div class="badge">${escapeHtml(ad.comment)}</div>` : ""}

      <div class="card-actions" onclick="event.stopPropagation()">
        <button class="action call" onclick="callPhone('${escapeJs(ad.phone||"")}')">Qo‘ng‘iroq</button>
        <button class="action msg" onclick="msgUser('${escapeJs(ad.telegram_id||"")}','${escapeJs(ad.name||"")}')">Yozish</button>
      </div>
    </div>
  `;

  return card;
}

// =============================
// AD DETAIL + VIEW COUNT
// =============================
window.openAdDetail = async (adId)=>{
  const ad = ADS_CACHE.find(x=>Number(x.id)===Number(adId));
  if(!ad) return;

  // add view
  try{
    await apiPost(`/api/ads/${adId}/view`, { viewer_telegram_id: tgId() });
    // refresh ads quickly
    await loadAds();
  }catch(e){}

  // show detail popup
  const msg = `
${ad.name || "—"}
${ad.phone || ""}

Маршрут:
${ad.frm || ""} → ${ad.too || ""}

Цена: ${ad.price || ""}
Места: ${ad.seats ?? 0}
Points: ${ad.points ?? 0}
Views: ${ad.views ?? 0}

${ad.car_brand || ""} ${ad.car_number || ""}
${ad.comment || ""}
  `.trim();

  try{
    Telegram.WebApp.showPopup({
      title:"🚕 E’lon",
      message: msg,
      buttons:[{type:"ok"}]
    });
  }catch(e){
    alert(msg);
  }
};

// =============================
// LIKE (backend real)
// =============================
window.likeDriver = async (phone)=>{
  if(!phone) return;
  try{
    await apiPost("/api/like", {
      target_phone: phone,
      from_telegram_id: tgId()
    });
    await loadAds();
    await renderProfileView();
  }catch(e){
    toast("❌ Like error", true);
  }
};

// =============================
// SEATS DELTA (backend real)
// =============================
window.seatsDelta = async (adId, delta)=>{
  try{
    await apiPost(`/api/ads/${adId}/seats`, {
      telegram_id: tgId(),
      delta: delta
    });
    await loadAds();
  }catch(e){
    toast("❌ Seats error", true);
  }
};

// =============================
// CALL / MSG
// =============================
window.callPhone = (phone)=>{
  if(!phone) return;
  window.location.href = `tel:${phone}`;
};

window.msgUser = (toTelegramId, name)=>{
  // open ultra chat
  openChat(toTelegramId, name);
};

// =============================
// PUBLISH AD (ULTRA)
// =============================
window.publishAd = async ()=>{
  const p = getProfile();
  if(!p){
    toast("❗ Profilni to‘ldiring", true);
    return;
  }

  const from = $("ad-from")?.value.trim();
  const to = $("ad-to")?.value.trim();
  const type = $("ad-type")?.value;
  const price = $("ad-price")?.value.trim();
  const seats = $("ad-seats")?.value.trim();
  const comment = ($("ad-comment")?.value || "").trim();

  if(!from || !to || !price){
    toast("❗ A, B va Narx shart!", true);
    return;
  }

  let seatsNum = parseInt(seats || "0", 10);
  if(Number.isNaN(seatsNum) || seatsNum < 0) seatsNum = 0;
  if(seatsNum > 8) seatsNum = 8;

  // geo attach
  const geoEnabled = $("geoToggle")?.checked;
  const geo = geoEnabled ? getGeo() : null;

  const payload = {
    telegram_id: tgId(),
    role: p.role,
    name: p.name,
    phone: p.phone,
    car_brand: p.carBrand || "",
    car_number: p.carNumber || "",
    photo_url: p.photo_url || "",

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
    toast("✅ E’lon joylandi");
    clearAdForm();
    await loadAds();
    await renderMyAds();
  }catch(e){
    toast("❌ E’lon berishda xatolik", true);
  }
};

function clearAdForm(){
  ["ad-from","ad-to","ad-price","ad-seats","ad-comment"].forEach(id=>{
    const el = $(id);
    if(el) el.value = "";
  });
}

// =============================
// PROFILE VIEW (ULTRA)
// =============================
async function renderProfileView(){
  const p = getProfile();
  if(!p) return;

  // fetch from backend to get rating + gallery
  let backendUser = null;
  try{
    const j = await apiGet(`/api/users/${encodeURIComponent(tgId())}`);
    backendUser = j.user || null;
  }catch(e){}

  // avatar
  const avatar = $("avatar");
  if(avatar){
    if(p.photo_url){
      avatar.style.backgroundImage = `url('${p.photo_url}')`;
      avatar.innerHTML = "";
    }else{
      avatar.style.backgroundImage = "";
      avatar.innerHTML = "👤";
    }
  }

  // cover (if you add element in html later)
  const pvName = $("pv-name"); if(pvName) pvName.innerText = p.name || "—";
  const pvPhone = $("pv-phone"); if(pvPhone) pvPhone.innerText = p.phone || "—";
  const pvCar = $("pv-car");
  if(pvCar){
    const carLine = (p.role==="driver") ? `${p.carBrand||""} ${p.carNumber||""}`.trim() : "👤 Client";
    pvCar.innerText = carLine || "—";
  }

  // rating
  const rating = backendUser ? (backendUser.rating || 0) : 0;
  const points = 0; // points in profile can be from likes by phone if needed later

  $("pv-rating") && ($("pv-rating").innerText = `${Number(rating||0).toFixed(1)} ⭐`);
  $("pv-points") && ($("pv-points").innerText = `${points} 🏆`);

  // my ads
  await renderMyAds();

  // car gallery render if html added later
  // For now: show count in console
  if(backendUser?.car_photos){
    console.log("car photos:", backendUser.car_photos.length);
  }

  // show admin
  checkAdminBtn();
}

window.saveProfileEdit = async ()=>{
  const p = getProfile();
  if(!p) return;

  const np = {
    ...p,
    name: $("ep-name")?.value.trim() || p.name,
    phone: $("ep-phone")?.value.trim() || p.phone,
    carBrand: $("ep-car-brand")?.value.trim() || p.carBrand,
    carNumber: $("ep-car-number")?.value.trim() || p.carNumber,
  };

  setProfile(np);
  await syncProfileToBackend();

  closeSheet("editProfileSheet");
  toast("✅ Saved");
  await renderProfileView();
  await loadAds();
};

// =============================
// MY ADS
// =============================
async function renderMyAds(){
  const listEl = $("myAdsList");
  if(!listEl) return;

  const me = tgId();
  const mine = ADS_CACHE.filter(a=> String(a.telegram_id||"")===String(me));

  if(mine.length===0){
    listEl.innerHTML = `<div class="glass card"><div class="muted">Hozircha e’lon yo‘q</div></div>`;
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
          <span class="route-pill">${escapeHtml(ad.frm||"")}</span>
          <span>→</span>
          <span class="route-pill">${escapeHtml(ad.too||"")}</span>
        </div>
        <div class="card-info">
          <div class="badge">💰 ${escapeHtml(String(ad.price||""))}</div>
          <div class="badge">👥 ${escapeHtml(String(ad.seats||""))}</div>
          <button class="chip" onclick="deleteMyAd(${ad.id})">🗑</button>
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
    toast("❌ Delete error", true);
  }
};

// =============================
// GEO TOGGLE
// =============================
function initToggles(){
  const geoToggle = $("geoToggle");
  const notifyToggle = $("notifyToggle");

  const notify = localStorage.getItem(LS.notify) === "1";
  if(notifyToggle){
    notifyToggle.checked = notify;
    notifyToggle.onchange = ()=>{
      localStorage.setItem(LS.notify, notifyToggle.checked ? "1" : "0");
    };
  }

  const geoSaved = !!getGeo();
  if(geoToggle){
    geoToggle.checked = geoSaved;
    geoToggle.onchange = async ()=>{
      if(geoToggle.checked){
        await updateLocationNow();
      }else{
        localStorage.removeItem(LS.geo);
        updateGeoLine();
        SORT_MODE = "time";
        updateSortLine();
        renderCards();
      }
    };
  }

  updateGeoLine();
  updateSortLine();
}

window.updateLocationNow = async ()=>{
  const geoStatus = $("geoStatus");
  if(geoStatus) geoStatus.innerText = "…";

  if(!navigator.geolocation){
    if(geoStatus) geoStatus.innerText = "Geolocation not supported";
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (pos)=>{
      saveGeo(pos.coords.latitude, pos.coords.longitude);
      updateGeoLine();
      renderCards();
      if(geoStatus){
        geoStatus.innerText = `✅ ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`;
      }
    },
    (err)=>{
      if(geoStatus) geoStatus.innerText = "❌ Geo error";
      console.log(err);
    },
    { enableHighAccuracy:true, timeout:12000, maximumAge: 15000 }
  );
};

function updateGeoLine(){
  const geoLine = $("geoLine");
  if(!geoLine) return;

  const geo = getGeo();
  const on = !!geo;
  geoLine.innerHTML = on
    ? `📍 <span>Geolokatsiya: ON</span>`
    : `📍 <span>Geolokatsiya: OFF</span>`;
}

// =============================
// ADMIN
// =============================
function checkAdminBtn(){
  const adminBtn = document.querySelector(".admin-only");
  if(!adminBtn) return;

  if(isAdminLocal()){
    adminBtn.style.display = "flex";
  }else{
    adminBtn.style.display = "none";
  }
}

window.adminRefresh = async ()=>{
  try{
    const j = await apiGet("/api/ads");
    const count = Array.isArray(j.ads) ? j.ads.length : 0;
    $("adminStats").innerText = `Ads: ${count}`;
  }catch(e){
    $("adminStats").innerText = "Error";
  }
};

window.adminClearAll = async ()=>{
  toast("Admin clear (keyin qo‘shamiz)");
};

// =============================
// DONATE
// =============================
window.donateNow = ()=>{
  toast("💛 711 GROUP");
};

// expose search
window.searchAds = searchAds;
