// =====================
// 711 TAXI MINI APP ULTRA
// =====================

/**
 * CONFIG
 */
const BACKEND_URL = "https://taxi-backend-5kl2.onrender.com";
const ADMIN_TELEGRAM_ID = 6813692852;
const WS_URL = "https://ws-server-jd2x.onrender.com"

let FEED_MODE = "drivers";
let SORT_MODE = "time";
let searchText = "";
let cachedAds = [];
let selectedAd = null;

let profile = null;
let theme = localStorage.getItem("theme") || "dark";
let soundOn = localStorage.getItem("soundOn") === "1";
let geoEnabled = localStorage.getItem("geoEnabled") === "1";
let geo = { lat: null, lng: null };

/**
 * i18n
 */
const DICT = {
  uz: {
    choose_lang:"Tilni tanlang",
    lang_hint:"Tilni keyin sozlamalardan o‘zgartirsa bo‘ladi.",
    choose_role:"Rolin tanlang",
    role_driver:"Haydovchi",
    role_client:"Mijoz",
    back:"Orqaga",
    profile_setup:"Profilni to‘ldirish",
    full_name:"Ism familiya",
    phone:"Telefon",
    car_brand:"Mashina markasi",
    car_number:"Mashina raqami",
    about_short:"Qisqa info",
    continue:"Davom etish",
    drivers:"Haydovchilar",
    clients:"Mijozlar",
    sort_time:"Saralash: vaqt",
    sort:"Saralash",
    geo:"Geo",
    geo_off:"Geolokatsiya: OFF",
    geo_update:"Joylashuvni yangilash",
    geo_hint:"Geo yoqilsa, e’lonlar sizga yaqinligi bo‘yicha saralanadi.",
    create_ad:"E’lon yaratish",
    point_a:"TOCHKA A",
    point_b:"TOCHKA B",
    ad_type:"Tur",
    type_now:"SRAZU",
    type_20:"20 daqiqada",
    type_fill:"Odam to‘lsa",
    price:"Narx",
    seats:"Bo‘sh joy",
    comment:"Izoh",
    publish:"E’lon berish",
    close:"Yopish",
    auto_delete:"E’lon 60 daqiqadan so‘ng avtomatik o‘chadi.",
    settings:"Sozlamalar",
    language:"Til",
    sounds:"Audio",
    nav_home:"Bosh",
    nav_create:"Yaratish",
    nav_profile:"Profil",
    nav_settings:"Sozlamalar",
    edit_profile:"Profilni tahrirlash",
    my_ads:"Mening e’lonlarim",
    save:"Saqlash",
    published_ok:"✅ E’lon joylandi",
    publish_error:"❌ E’lon berishda xatolik",
    phone_required:"Telefon kiriting",
    name_required:"Ism kiriting",
    route_required:"Marshrutni kiriting",
    photo_upload:"Profil rasmi (qurilmadan)",
    photo_note:"URL yo‘q. Faqat qurilmadan yuklanadi ✅",
    search:"Qidirish",
  },
  ru: {
    choose_lang:"Выберите язык",
    lang_hint:"Язык можно изменить в настройках.",
    choose_role:"Выберите роль",
    role_driver:"Водитель",
    role_client:"Клиент",
    back:"Назад",
    profile_setup:"Заполните профиль",
    full_name:"Имя Фамилия",
    phone:"Телефон",
    car_brand:"Марка авто",
    car_number:"Номер авто",
    about_short:"Коротко о себе",
    continue:"Продолжить",
    drivers:"Водители",
    clients:"Клиенты",
    sort_time:"Сортировка: время",
    sort:"Сортировать",
    geo:"Гео",
    geo_off:"Геолокация: OFF",
    geo_update:"Обновить гео",
    geo_hint:"Если гео включено — объявления сортируются по близости.",
    create_ad:"Создать объявление",
    point_a:"ТОЧКА A",
    point_b:"ТОЧКА B",
    ad_type:"Тип",
    type_now:"Сразу",
    type_20:"Через 20 мин",
    type_fill:"Когда наберу людей",
    price:"Цена",
    seats:"Мест",
    comment:"Комментарий",
    publish:"Опубликовать",
    close:"Закрыть",
    auto_delete:"Объявление удалится через 60 минут.",
    settings:"Настройки",
    language:"Язык",
    sounds:"Звук",
    nav_home:"Главная",
    nav_create:"Создать",
    nav_profile:"Профиль",
    nav_settings:"Настройки",
    edit_profile:"Редактировать профиль",
    my_ads:"Мои объявления",
    save:"Сохранить",
    published_ok:"✅ Объявление опубликовано",
    publish_error:"❌ Ошибка публикации",
    phone_required:"Введите телефон",
    name_required:"Введите имя",
    route_required:"Введите маршрут",
    photo_upload:"Фото профиля (с устройства)",
    photo_note:"URL нет. Только загрузка ✅",
    search:"Поиск",
  },
  uzk: {
    choose_lang:"Тилни танланг",
    lang_hint:"Тилни кейин созламалардан ўзгартирса бўлади.",
    choose_role:"Ролни танланг",
    role_driver:"Ҳайдовчи",
    role_client:"Мижоз",
    back:"Орқага",
    profile_setup:"Профилни тўлдириш",
    full_name:"Исм фамилия",
    phone:"Телефон",
    car_brand:"Машина маркаси",
    car_number:"Машина рақами",
    about_short:"Қисқа маълумот",
    continue:"Давом этиш",
    drivers:"Ҳайдовчилар",
    clients:"Мижозлар",
    sort_time:"Саралаш: вақт",
    sort:"Саралаш",
    geo:"Гео",
    geo_off:"Геолокация: OFF",
    geo_update:"Жойлашувни янгилаш",
    geo_hint:"Гео ёқилса — яқинлиги бўйича сараланади.",
    create_ad:"Эълон яратиш",
    point_a:"ТОЧКА A",
    point_b:"ТОЧКА B",
    ad_type:"Тур",
    type_now:"Ҳозир",
    type_20:"20 дақиқада",
    type_fill:"Одам тўлса",
    price:"Нарх",
    seats:"Бўш жой",
    comment:"Изоҳ",
    publish:"Эълон бериш",
    close:"Ёпиш",
    auto_delete:"Эълон 60 дақиқадан сўнг ўчади.",
    settings:"Созламалар",
    language:"Тил",
    sounds:"Аудио",
    nav_home:"Бош",
    nav_create:"Яратиш",
    nav_profile:"Профил",
    nav_settings:"Созламалар",
    edit_profile:"Профилни таҳрирлаш",
    my_ads:"Менинг эълонларим",
    save:"Сақлаш",
    published_ok:"✅ Эълон жойланди",
    publish_error:"❌ Эълонда хатолик",
    phone_required:"Телефон киритинг",
    name_required:"Исм киритинг",
    route_required:"Маршрут киритинг",
    photo_upload:"Профил расми (қурилмадан)",
    photo_note:"URL йўқ ✅",
    search:"Қидириш",
  }
};

let LANG = localStorage.getItem("lang") || "uz";

/**
 * Utils
 */
const $ = (id) => document.getElementById(id);

function t(key){
  return (DICT[LANG] && DICT[LANG][key]) ? DICT[LANG][key] : key;
}

function applyI18n(){
  document.querySelectorAll("[data-i18n]").forEach(el=>{
    const key = el.getAttribute("data-i18n");
    el.textContent = t(key);
  });
  const lb = $("langBadge");
  if(lb) lb.textContent = LANG;
}

function formatPrice(n){
  const x = Number(n || 0);
  if(!x) return "0";
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

function safeText(v){
  return String(v ?? "").trim();
}

function playSound(type="tap"){
  if(!soundOn) return;
  try{
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    o.type="sine";
    o.frequency.value = type==="error" ? 180 : type==="success" ? 520 : 320;
    g.gain.value = 0.06;
    o.start();
    setTimeout(()=>{ o.stop(); ctx.close(); }, 80);
  }catch(e){}
}

function toast(msg, danger=false){
  playSound(danger ? "error" : "success");
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

/**
 * Theme
 */
function setTheme(mode){
  theme = mode;
  localStorage.setItem("theme", theme);
  document.body.classList.toggle("light", theme==="light");
}

function toggleTheme(){
  playSound("tap");
  setTheme(theme==="light" ? "dark" : "light");
}

/**
 * Sheets
 */
function openSheet(id){
  playSound("tap");
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

/**
 * Navigation
 */
function showScreen(id){
  document.querySelectorAll(".screen").forEach(s=>s.classList.remove("active"));
  $(id)?.classList.add("active");
}

function nav(where){
  playSound("tap");
  document.querySelectorAll(".nav-btn").forEach(b=>b.classList.remove("active"));
  if(where==="home"){
    $("navHome")?.classList.add("active");
    showScreen("screen-home");
    loadAds();
  }
  if(where==="profile"){
    $("navProfile")?.classList.add("active");
    showScreen("screen-profile-view");
    renderProfileView();
  }
  if(where==="admin"){
    showScreen("screen-admin");
  }
}

/**
 * Boot
 */
document.addEventListener("DOMContentLoaded", async ()=>{
  try{
    setTheme(theme);
    applyI18n();

    // Toggles
    $("soundToggle").checked = soundOn;
    $("soundToggle").addEventListener("change", ()=>{
      soundOn = $("soundToggle").checked;
      localStorage.setItem("soundOn", soundOn ? "1" : "0");
      playSound("tap");
    });

    $("geoToggle").checked = geoEnabled;
    $("geoToggle").addEventListener("change", ()=>{
      geoEnabled = $("geoToggle").checked;
      localStorage.setItem("geoEnabled", geoEnabled ? "1" : "0");
      playSound("tap");
      updateGeoLine();
      if(geoEnabled) updateLocationNow();
    });

    // Photo previews
    $("p-photo-file")?.addEventListener("change", async (e)=>{
      const f = e.target.files?.[0];
      if(!f) return;
      const b64 = await fileToBase64(f);
      $("p-photo-preview").style.backgroundImage = `url('${b64}')`;
    });

    $("ep-photo-file")?.addEventListener("change", async (e)=>{
      const f = e.target.files?.[0];
      if(!f) return;
      const b64 = await fileToBase64(f);
      $("ep-photo-preview").style.backgroundImage = `url('${b64}')`;
    });

    // Telegram init
    if(window.Telegram && Telegram.WebApp){
      Telegram.WebApp.expand();
      Telegram.WebApp.ready();
    }

    // Load profile
    profile = loadProfileLocal();
    await bootstrapAdminVisibility();
    updateGeoLine();

    // Entry banner (from backend)
    await checkEntryBanner();

    // Loading hide
    setTimeout(()=>{
      $("loading").classList.remove("active");
      $("app").classList.remove("hidden");

      // Start flow
      if(!localStorage.getItem("lang")){
        showScreen("screen-language");
      }else if(!profile){
        showScreen("screen-role");
      }else{
        showScreen("screen-home");
        loadAds();
      }
    }, 450);

  }catch(e){
    console.error(e);
    toast("Front error: " + e.message, true);
  }
});

/**
 * Language / Role
 */
function setLang(l){
  playSound("tap");
  LANG = l;
  localStorage.setItem("lang", LANG);
  applyI18n();
  showScreen("screen-role");
}

function selectRole(role){
  playSound("tap");
  localStorage.setItem("roleTemp", role);
  $("driver-extra").style.display = role==="driver" ? "block" : "none";
  showScreen("screen-profile");
}

/**
 * Local Profile
 */
function loadProfileLocal(){
  try{
    const raw = localStorage.getItem("profile");
    if(!raw) return null;
    return JSON.parse(raw);
  }catch(e){ return null; }
}

function saveProfileLocal(p){
  localStorage.setItem("profile", JSON.stringify(p));
  profile = p;
}

async function saveProfile(){
  try{
    playSound("tap");

    const role = localStorage.getItem("roleTemp") || "client";
    const name = safeText($("p-name").value);
    const phone = safeText($("p-phone").value);

    if(!name) return toast(t("name_required"), true);
    if(!phone) return toast(t("phone_required"), true);

    const carBrand = safeText($("p-car-brand").value);
    const carNumber = safeText($("p-car-number").value);
    const bio = safeText($("p-bio").value);

    const file = $("p-photo-file").files?.[0] || null;
    let photo = "";
    if(file){
      photo = await fileToBase64(file);
    }

    const tg = getTelegramUser();
    const p = {
      role,
      name,
      phone,
      carBrand,
      carNumber,
      bio,
      photo,
      tg_id: tg?.id || null
    };

    saveProfileLocal(p);
    showScreen("screen-home");
    loadAds();
  }catch(e){
    console.error(e);
    toast("Save profile error: " + e.message, true);
  }
}

function renderProfileView(){
  if(!profile) return;
  $("pv-name").textContent = profile.name || "—";
  $("pv-phone").textContent = profile.phone || "—";
  $("pv-car").textContent = profile.carBrand ? `${profile.carBrand}` : "—";
  $("pv-plate").textContent = profile.carNumber || "—";
  $("avatar").style.backgroundImage = profile.photo ? `url('${profile.photo}')` : "";
  $("pv-rating").textContent = (profile.rating || 0).toFixed ? `${profile.rating.toFixed(1)} ⭐` : `0.0 ⭐`;
  $("pv-points").textContent = `${profile.points || 0} 🏆`;
}

async function saveProfileEdit(){
  try{
    playSound("tap");

    const name = safeText($("ep-name").value);
    const phone = safeText($("ep-phone").value);
    if(!name) return toast(t("name_required"), true);
    if(!phone) return toast(t("phone_required"), true);

    const carBrand = safeText($("ep-car-brand").value);
    const carNumber = safeText($("ep-car-number").value);

    const f = $("ep-photo-file").files?.[0] || null;
    let photo = profile.photo || "";
    if(f) photo = await fileToBase64(f);

    profile.name = name;
    profile.phone = phone;
    profile.carBrand = carBrand;
    profile.carNumber = carNumber;
    profile.photo = photo;

    saveProfileLocal(profile);
    renderProfileView();
    closeSheet("editProfileSheet");
    toast("✅ Saved");
  }catch(e){
    console.error(e);
    toast("Edit profile error: " + e.message, true);
  }
}

/**
 * Feed
 */
function switchFeed(mode){
  playSound("tap");
  FEED_MODE = mode;
  $("tabDrivers").classList.toggle("active", mode==="drivers");
  $("tabClients").classList.toggle("active", mode==="clients");
  loadAds();
}

function toggleSort(){
  playSound("tap");
  SORT_MODE = (SORT_MODE==="time") ? "price" : "time";
  $("sortLine").innerHTML = SORT_MODE==="time" ? `↕️ <span>${t("sort_time")}</span>` : `↕️ Saralash: narx`;
  loadAds();
}

/**
 * GEO
 */
function updateGeoLine(){
  const line = $("geoLine");
  if(!line) return;
  line.innerHTML = geoEnabled
    ? `📍 Geolokatsiya: ON`
    : `📍 <span>${t("geo_off")}</span>`;
}

function getGeo(){
  return geo;
}

function updateLocationNow(){
  playSound("tap");
  if(!geoEnabled){
    $("geoStatus").textContent = "Geo OFF";
    return;
  }
  if(!navigator.geolocation){
    $("geoStatus").textContent = "Geo not supported";
    return;
  }
  navigator.geolocation.getCurrentPosition(
    (pos)=>{
      geo.lat = pos.coords.latitude;
      geo.lng = pos.coords.longitude;
      $("geoStatus").textContent = `✅ lat=${geo.lat.toFixed(5)}, lng=${geo.lng.toFixed(5)}`;
      updateGeoLine();
      loadAds();
    },
    (err)=>{
      console.warn(err);
      $("geoStatus").textContent = `❌ Geo error: ${err.message}`;
      updateGeoLine();
    },
    { enableHighAccuracy:true, timeout:8000 }
  );
}

/**
 * API
 */
async function apiGET(path){
  const r = await fetch(BACKEND_URL + path);
  const j = await r.json().catch(()=> ({}));
  if(!r.ok) throw new Error(j.error || "GET failed");
  return j;
}

async function apiPOST(path, payload){
  const r = await fetch(BACKEND_URL + path, {
    method:"POST",
    headers:{ "Content-Type":"application/json" },
    body: JSON.stringify(payload)
  });
  const j = await r.json().catch(()=> ({}));
  if(!r.ok) throw new Error(j.error || "POST failed");
  return j;
}

/**
 * Load Ads (Ultra)
 */
async function loadAds(){
  try{
    const cards = $("cards");
    cards.innerHTML = `
      <div class="skeleton glass"></div>
      <div class="skeleton glass"></div>
      <div class="skeleton glass"></div>
    `;

    const list = await apiGET("/api/ads");
    let ads = Array.isArray(list) ? list : (list.items || []);

    // feed filter
    ads = ads.filter(a=>{
      if(FEED_MODE==="drivers") return a.role==="driver";
      return a.role==="client";
    });

    // remove empty routes
    ads = ads.filter(a=>{
      const from = safeText(a.from || a.pointA);
      const to = safeText(a.to || a.pointB);
      return from.length>0 && to.length>0;
    });

    // search
    if(searchText){
      const s = searchText.toLowerCase();
      ads = ads.filter(a=>{
        const pack = `${a.name||""} ${a.carBrand||""} ${a.carNumber||""} ${a.from||""} ${a.to||""}`.toLowerCase();
        return pack.includes(s);
      });
    }

    // sort
    if(SORT_MODE==="price"){
      ads.sort((a,b)=> Number(a.price||0) - Number(b.price||0));
    }else{
      ads.sort((a,b)=> Number(b.created_at||0) - Number(a.created_at||0));
    }

    cachedAds = ads;
    cards.innerHTML = "";

    if(!ads.length){
      cards.innerHTML = `<div class="card glass"><div class="muted">Hech narsa topilmadi</div></div>`;
      return;
    }

    for(const ad of ads){
      cards.appendChild(renderAdCard(ad));
    }

  }catch(e){
    console.error(e);
    $("cards").innerHTML = `<div class="card glass"><div class="muted">❌ ${e.message}</div></div>`;
  }
}

/**
 * Render Card
 */
function renderAdCard(ad){
  const el = document.createElement("div");
  el.className = "card glass";
  el.onclick = ()=> openAdDetail(ad);

  const avatar = ad.photo ? `background-image:url('${ad.photo}')` : "";
  const from = safeText(ad.from || "—");
  const to = safeText(ad.to || "—");
  const name = safeText(ad.name || "—");
  const car = safeText(ad.carBrand || "");
  const plate = safeText(ad.carNumber || "");

  const seats = Number(ad.seats || 0);
  const price = formatPrice(ad.price || 0);
  const points = Number(ad.points || 0);
  const rating = Number(ad.rating || 0);
  const distance = ad.distance_km ? `${Number(ad.distance_km).toFixed(1)} km` : "";

  el.innerHTML = `
    <div class="card-head">
      <div class="card-left">
        <div class="card-avatar" style="${avatar}"></div>
        <div>
          <div class="card-name">${escapeHtml(name)}</div>
          <div class="card-sub">${escapeHtml(car)} ${plate ? "• "+escapeHtml(plate) : ""}</div>
        </div>
      </div>

      <button class="like-btn" onclick="event.stopPropagation(); likeAd(${ad.id})">💛</button>
    </div>

    <div class="card-body">
      <div class="route-line">
        <span class="route-pill">📍 ${escapeHtml(from)}</span>
        <span>→</span>
        <span class="route-pill">📍 ${escapeHtml(to)}</span>
      </div>

      <div class="card-info">
        <span class="badge">🕒 ${escapeHtml(typeLabel(ad.type))}</span>
        <span class="badge">👥 ${seats}</span>
        <span class="badge">💰 ${price}</span>
        <span class="badge">⭐ ${rating.toFixed ? rating.toFixed(1) : rating}</span>
        <span class="badge">🏆 ${points}</span>
        ${distance ? `<span class="badge">📍 ${distance}</span>` : ""}
      </div>

      ${ad.comment ? `<div class="badge" style="width:100%;">💬 ${escapeHtml(ad.comment)}</div>` : ""}

      <div class="card-actions">
        <button class="action call" onclick="event.stopPropagation(); callUser('${ad.phone||""}')">📞 Qo‘ng‘iroq</button>
        <button class="action msg" onclick="event.stopPropagation(); openMsg('${ad.phone||""}')">💬 Yozish</button>
      </div>
    </div>
  `;
  return el;
}

function typeLabel(type){
  if(type==="fill") return "Odam to‘lsa";
  if(type==="20") return "20 daqiqada";
  return "now";
}

/**
 * Publish Ad
 */
async function publishAd(){
  try{
    playSound("tap");

    if(!profile) return toast("Profile yo‘q", true);

    const from = safeText($("ad-from").value);
    const to = safeText($("ad-to").value);
    const type = $("ad-type").value;
    const price = safeText($("ad-price").value);
    const seatsNum = parseInt($("ad-seats").value || "0", 10);
    const comment = safeText($("ad-comment").value);

    if(!from || !to) return toast(t("route_required"), true);
    if(!profile.phone) return toast(t("phone_required"), true);

    const g = getGeo();

    const payload = {
      role: profile.role,
      name: profile.name,
      phone: profile.phone,
      carBrand: profile.carBrand || "",
      carNumber: profile.carNumber || "",
      photo: profile.photo || "",
      bio: profile.bio || "",
      from,
      to,
      type,
      price: String(price || ""),
      seats: Number.isFinite(seatsNum) ? seatsNum : 0,
      comment,
      lat: geoEnabled ? (g.lat || null) : null,
      lng: geoEnabled ? (g.lng || null) : null,
    };

    console.log("✅ payload yuborildi:", payload);

    const res = await apiPOST("/api/ads", payload);
    console.log("✅ backend javobi:", res);

    closeSheet("createAdSheet");
    clearAdForm();
    toast(t("published_ok"));
    loadAds();
  }catch(e){
    console.error(e);
    toast(`${t("publish_error")}\n${e.message}`, true);
  }
}

function clearAdForm(){
  $("ad-from").value = "";
  $("ad-to").value = "";
  $("ad-type").value = "now";
  $("ad-price").value = "";
  $("ad-seats").value = "";
  $("ad-comment").value = "";
}

/**
 * Like
 */
async function likeAd(adId){
  try{
    playSound("tap");
    await apiPOST(`/api/ads/${adId}/like`, { ok:true });
    loadAds();
  }catch(e){
    toast("Like error: " + e.message, true);
  }
}

/**
 * Detail Modal
 */
function openAdDetail(ad){
  selectedAd = ad;
  $("adDetailModal").classList.add("open");

  const avatar = ad.photo ? `background-image:url('${ad.photo}')` : "";
  const html = `
    <div class="card glass-soft" style="margin-bottom:12px;">
      <div class="card-head">
        <div class="card-left">
          <div class="card-avatar" style="${avatar}"></div>
          <div>
            <div class="card-name">${escapeHtml(ad.name||"—")}</div>
            <div class="card-sub">${escapeHtml(ad.carBrand||"")} • ${escapeHtml(ad.carNumber||"")}</div>
          </div>
        </div>
      </div>

      <div class="card-body">
        <div class="route-line">
          <span class="route-pill">📍 ${escapeHtml(ad.from||"—")}</span>
          <span>→</span>
          <span class="route-pill">📍 ${escapeHtml(ad.to||"—")}</span>
        </div>

        <div class="card-info">
          <span class="badge">👥 ${ad.seats||0}</span>
          <span class="badge">💰 ${formatPrice(ad.price||0)}</span>
          <span class="badge">⭐ ${(Number(ad.rating||0)).toFixed(1)}</span>
          <span class="badge">🏆 ${ad.points||0}</span>
          ${ad.distance_km ? `<span class="badge">📍 ${Number(ad.distance_km).toFixed(1)} km</span>` : ""}
        </div>

        ${ad.comment ? `<div class="badge" style="width:100%;">💬 ${escapeHtml(ad.comment)}</div>` : ""}
      </div>
    </div>
  `;
  $("adDetailContent").innerHTML = html;
}

function closeAdDetail(e){
  if(e && e.target && e.target.id!=="adDetailModal") return;
  $("adDetailModal").classList.remove("open");
}

function callFromDetail(){
  if(!selectedAd) return;
  callUser(selectedAd.phone || "");
}
function msgFromDetail(){
  if(!selectedAd) return;
  openMsg(selectedAd.phone || "");
}

/**
 * Call / Msg
 */
function callUser(phone){
  playSound("tap");
  if(!phone) return toast("Phone yo‘q", true);
  window.location.href = `tel:${phone}`;
}
function openMsg(phone){
  playSound("tap");
  toast("Chat keyin qo‘shiladi ✅");
}

/**
 * Search
 */
function applySearch(){
  searchText = safeText($("searchInput").value);
  loadAds();
}
function clearSearch(){
  $("searchInput").value = "";
  searchText = "";
  loadAds();
}

/**
 * Admin
 */
async function bootstrapAdminVisibility(){
  try{
    const tg = getTelegramUser();
    const isAdmin = tg?.id && Number(tg.id) === Number(ADMIN_TELEGRAM_ID);
    document.querySelectorAll(".admin-only").forEach(el=>{
      el.style.display = isAdmin ? "flex" : "none";
    });
  }catch(e){}
}

async function adminRefresh(){
  playSound("tap");
  loadAds();
  toast("✅ Refreshed");
}

async function adminClearAll(){
  try{
    playSound("tap");
    await apiPOST("/api/admin/clear", { ok:true });
    toast("✅ Cleared");
    loadAds();
  }catch(e){
    toast("Admin clear error: " + e.message, true);
  }
}

/**
 * Admin Banner (entry 3 sec)
 */
async function adminUploadBanner(){
  try{
    const tg = getTelegramUser();
    if(!tg?.id || Number(tg.id)!==Number(ADMIN_TELEGRAM_ID)){
      return toast("Admin emas", true);
    }
    const file = $("bannerFile").files?.[0];
    if(!file) return toast("Banner file tanlang", true);

    const b64 = await fileToBase64(file);
    await apiPOST("/api/admin/banner", { image: b64 });

    toast("✅ Banner qo‘yildi");
  }catch(e){
    toast("Banner error: " + e.message, true);
  }
}

async function checkEntryBanner(){
  try{
    const r = await apiGET("/api/banner");
    if(!r || !r.image) return;

    $("entryBannerImg").style.backgroundImage = `url('${r.image}')`;
    $("entryBanner").classList.remove("hidden");

    setTimeout(()=>{
      $("entryBanner").classList.add("hidden");
    }, 3000);
  }catch(e){}
}

/**
 * Telegram User
 */
function getTelegramUser(){
  try{
    if(window.Telegram && Telegram.WebApp){
      return Telegram.WebApp.initDataUnsafe?.user || null;
    }
    return null;
  }catch(e){ return null; }
}

/**
 * Base64 helper
 */
function fileToBase64(file){
  return new Promise((resolve,reject)=>{
    const reader = new FileReader();
    reader.onload = ()=> resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * HTML escape
 */
function escapeHtml(str){
  return String(str ?? "")
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}
