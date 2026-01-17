// ====== CONFIG ======
const API = "https://taxi-backend-5kl2.onrender.com";
const AUTO_DELETE_SECONDS = 60 * 60; // 60 минут
const ADMIN_TG_ID = "123456789"; // <-- o'zingizni Telegram ID yozing

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

// ====== TELEGRAM AUTH + API FETCH ======
function getInitData(){
  try{
    return (window.Telegram && Telegram.WebApp) ? (Telegram.WebApp.initData || "") : "";
  }catch(e){ return ""; }
}

async function apiFetch(url, opts={}){
  const o = { ...opts };
  o.headers = o.headers || {};
  o.headers["Content-Type"] = "application/json";

  const initData = getInitData();
  if(initData){
    o.headers["X-TG-INITDATA"] = initData;
  }

  return fetch(url, o);
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

// pagination state
let ADS_OFFSET = 0;
let ADS_LOADING = false;
let ADS_END = false;

// search + filters
let SEARCH_QUERY = "";
let FILTERS = {
  priceMin: 0,
  priceMax: 0,
  seatsMin: 0,
  ratingMin: 0,
  onlyOnline: true,
  radiusKm: 0
};

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

// ===== FILTERS STORE =====
function loadFilters(){
  try{
    const f = JSON.parse(localStorage.getItem("filters")||"null");
    if(f) FILTERS = {...FILTERS, ...f};
  }catch(e){}
}
function storeFilters(){
  localStorage.setItem("filters", JSON.stringify(FILTERS));
}
window.saveFilters = ()=>{
  FILTERS.priceMin = parseInt(document.getElementById("fPriceMin")?.value || "0", 10) || 0;
  FILTERS.priceMax = parseInt(document.getElementById("fPriceMax")?.value || "0", 10) || 0;
  FILTERS.seatsMin = parseInt(document.getElementById("fSeats")?.value || "0", 10) || 0;
  FILTERS.ratingMin = parseFloat(document.getElementById("fRating")?.value || "0") || 0;
  FILTERS.onlyOnline = (document.getElementById("fOnline")?.value || "1") === "1";
  FILTERS.radiusKm = parseInt(document.getElementById("fRadius")?.value || "0", 10) || 0;

  storeFilters();
  closeSheet("filterSheet");
  loadAds(true);
  toast("✅ Filters applied");
};
window.resetFilters = ()=>{
  FILTERS = { priceMin:0, priceMax:0, seatsMin:0, ratingMin:0, onlyOnline:true, radiusKm:0 };
  storeFilters();
  ["fPriceMin","fPriceMax","fSeats","fRating"].forEach(id=>{
    const el = document.getElementById(id);
    if(el) el.value = "";
  });
  const on = document.getElementById("fOnline");
  if(on) on.value = "1";
  const rad = document.getElementById("fRadius");
  if(rad) rad.value = "0";

  loadAds(true);
  toast("♻ Reset");
};
window.applySearch = ()=>{
  const q = document.getElementById("qInput")?.value || "";
  SEARCH_QUERY = q.trim().toLowerCase();
  loadAds(true);
};

// ====== BOOT ======
document.addEventListener("DOMContentLoaded", async ()=>{
  try{
    if(window.Telegram && Telegram.WebApp){
      Telegram.WebApp.ready();
      Telegram.WebApp.expand();
    }
  }catch(e){}

  loadFilters();

  // hide loading after 900ms
  setTimeout(()=> document.getElementById("loading")?.classList.remove("active"), 900);

  const lang = localStorage.getItem("lang");
  const role = localStorage.getItem("role");
  const profile = getProfile();

  applyI18n();
  initToggles();

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
    await loadAds(true);
    renderProfileView();
    checkAdmin();
    setTimeout(()=> loadBanner(), 1200);
  }

  // infinite scroll
  window.addEventListener("scroll", ()=>{
    const nearBottom = (window.innerHeight + window.scrollY) > (document.body.offsetHeight - 700);
    if(nearBottom){
      loadAds(false);
    }
  });
});

// ===== LANGUAGE =====
window.setLang = (lang)=>{
  localStorage.setItem("lang", lang);
  applyI18n();
  const role = localStorage.getItem("role");
  const profile = getProfile();
  if(!role) showScreen("screen-role");
  else if(!profile) showScreen("screen-profile");
};

// ===== ROLE =====
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

// ===== CONTACT SHARE =====
window.requestContact = ()=>{
  try{
    if(window.Telegram && Telegram.WebApp){
      Telegram.WebApp.requestContact((ok, res)=>{
        if(ok){
          const phone = Telegram.WebApp.initDataUnsafe?.user?.phone_number || "";
          if(phone){
            const inp = document.getElementById("p-phone");
            if(inp) inp.value = phone;
            document.getElementById("contactHint").style.display = "block";
          }
        }
      });
      return;
    }
  }catch(e){}
  toast("Telegram contact share not supported", true);
};

// ===== PROFILE SAVE =====
window.saveProfile = async ()=>{
  const role = localStorage.getItem("role");
  const name = document.getElementById("p-name")?.value.trim();
  const phone = document.getElementById("p-phone")?.value.trim();
  const carBrand = document.getElementById("p-car-brand")?.value.trim();
  const carNumber = document.getElementById("p-car-number")?.value.trim();
  const photo = document.getElementById("p-photo")?.value.trim();
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

  // also sync backend profile
  try{
    await apiFetch(API + "/api/profile/save", {
      method:"POST",
      body: JSON.stringify(profile)
    });
  }catch(e){}

  showScreen("screen-home");
  nav("home");
  loadAds(true);
  renderProfileView();
  checkAdmin();
};

// ===== NAV =====
window.nav = (where)=>{
  if(where==="home"){
    setActiveNav("home");
    showScreen("screen-home");
    loadAds(true);
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

// ===== FEED SWITCH =====
window.switchFeed = (mode)=>{
  FEED_MODE = mode;
  document.getElementById("tabDrivers")?.classList.toggle("active", mode==="drivers");
  document.getElementById("tabClients")?.classList.toggle("active", mode==="clients");
  loadAds(true);
};

// ===== SORT =====
window.toggleSort = ()=>{
  const geoOn = document.getElementById("geoToggle")?.checked;
  if(geoOn){
    SORT_MODE = (SORT_MODE==="distance") ? "time" : "distance";
  }else{
    SORT_MODE = "time";
  }
  updateSortLine();
  loadAds(true);
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

// ====== LOAD ADS (PAGINATION + FILTERS) ======
async function loadAds(reset=true){
  if(ADS_LOADING) return;
  ADS_LOADING = true;

  const cards = document.getElementById("cards");
  if(!cards) return;

  if(reset){
    ADS_OFFSET = 0;
    ADS_END = false;
    cards.innerHTML = `
      <div class="skeleton glass"></div>
      <div class="skeleton glass"></div>
      <div class="skeleton glass"></div>
    `;
  }else{
    if(ADS_END){
      ADS_LOADING = false;
      return;
    }
    const loader = document.createElement("div");
    loader.className = "skeleton glass";
    loader.id = "moreLoader";
    cards.appendChild(loader);
  }

  try{
    const limit = 20;
    const res = await apiFetch(API + `/api/ads?limit=${limit}&offset=${ADS_OFFSET}`);
    const j = await res.json().catch(()=>({ok:false,items:[]}));

    const list = Array.isArray(j.items) ? j.items : (Array.isArray(j)?j:[]);
    if(reset) cards.innerHTML = "";

    document.getElementById("moreLoader")?.remove();

    let filtered = list.filter(a=>{
      if(FEED_MODE==="drivers") return a.role==="driver";
      return a.role==="client";
    });

    // SEARCH
    if(SEARCH_QUERY){
      filtered = filtered.filter(ad=>{
        const name = String(ad.name||"").toLowerCase();
        const phone = String(ad.phone||"").toLowerCase();
        const car = `${ad.carBrand||""} ${ad.carNumber||""}`.toLowerCase();
        const from = String(ad.from||"").toLowerCase();
        const to = String(ad.to||"").toLowerCase();
        return (
          name.includes(SEARCH_QUERY) ||
          phone.includes(SEARCH_QUERY) ||
          car.includes(SEARCH_QUERY) ||
          from.includes(SEARCH_QUERY) ||
          to.includes(SEARCH_QUERY)
        );
      });
    }

    // FILTERS
    filtered = filtered.filter(ad=>{
      const price = parseInt(ad.price||"0",10) || 0;
      const seats = parseInt(ad.seats||"0",10) || 0;
      const rating = parseFloat(ad.rating||"0") || 0;

      if(FILTERS.onlyOnline && (ad.online === 0)) return false;
      if(FILTERS.priceMin && price < FILTERS.priceMin) return false;
      if(FILTERS.priceMax && price > FILTERS.priceMax) return false;
      if(FILTERS.seatsMin && seats < FILTERS.seatsMin) return false;
      if(FILTERS.ratingMin && rating < FILTERS.ratingMin) return false;

      if(FILTERS.radiusKm && FILTERS.radiusKm > 0){
        const g = getGeo();
        if(!g || !ad.lat || !ad.lng) return false;
        const d = distanceKm(g.lat, g.lng, ad.lat, ad.lng);
        if(d > FILTERS.radiusKm) return false;
      }
      return true;
    });

    // sort inside page
    const geo = getGeo();
    const geoEnabled = !!geo && (document.getElementById("geoToggle")?.checked);

    if(SORT_MODE==="distance" && geoEnabled){
      filtered.sort((a,b)=>{
        const da = (a.lat && a.lng) ? distanceKm(geo.lat, geo.lng, a.lat, a.lng) : 99999;
        const db = (b.lat && b.lng) ? distanceKm(geo.lat, geo.lng, b.lat, b.lng) : 99999;
        return da - db;
      });
    }else{
      filtered.sort((a,b)=>(b.created_at||0)-(a.created_at||0));
    }

    if(filtered.length===0 && reset){
      cards.innerHTML = `<div class="glass card"><div class="muted">${t("no_ads")}</div></div>`;
      ADS_END = true;
      ADS_LOADING = false;
      return;
    }

    const frag = document.createDocumentFragment();
    filtered.forEach(ad=>{
      frag.appendChild(renderCard(ad, geo));
    });
    cards.appendChild(frag);

    ADS_OFFSET = j.next_offset || (ADS_OFFSET + list.length);
    if(list.length < limit) ADS_END = true;

  }catch(e){
    document.getElementById("moreLoader")?.remove();
    if(reset){
      cards.innerHTML = `<div class="glass card"><div class="muted">⚠️ ${t("publish_error")}</div></div>`;
    }
  }

  ADS_LOADING = false;
}

// ====== RENDER CARD ======
function renderCard(ad, geo){
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

  const rating = Number(ad.rating ?? 0);
  const reviewsCount = Number(ad.reviews_count ?? 0);
  const points = Number(ad.points ?? 0);

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

      <button class="like-btn" title="Like" onclick="likeDriver('${escapeJs(ad.phone)}')">💛</button>
    </div>

    <div class="card-body">
      <div class="route-line">
        <span class="route-pill">${escapeHtml(ad.from || "")}</span>
        <span>→</span>
        <span class="route-pill">${escapeHtml(ad.to || "")}</span>
      </div>

      <div class="card-info">
        <div class="badge">⏱ ${escapeHtml(typeLabel)}</div>
        <div class="badge">👥 ${escapeHtml(String(ad.seats ?? ""))}</div>
        <div class="badge">💰 ${escapeHtml(String(ad.price ?? ""))}</div>
        ${dist ? `<div class="badge">${dist}</div>` : ""}
        <div class="badge">🏆 ${points}</div>
        <div class="badge">⭐ ${rating.toFixed(1)} (${reviewsCount})</div>
      </div>

      ${ad.comment ? `<div class="badge">${escapeHtml(ad.comment || "")}</div>` : ""}

      <div class="card-actions">
        <button class="action call" onclick="callPhone('${escapeJs(ad.phone)}')">${t("call")}</button>
        <button class="action msg" onclick="msgUser('${escapeJs(ad.phone)}','${escapeJs(ad.name||"")}')">${t("message")}</button>
      </div>
    </div>
  `;

  return card;
}

// ===== LIKE (backend) =====
window.likeDriver = async (phone)=>{
  if(!phone) return;
  try{
    const r = await apiFetch(API + "/api/like", {
      method:"POST",
      body: JSON.stringify({ phone })
    });
    const j = await r.json().catch(()=>({}));
    if(!r.ok || !j.ok){
      toast(j.error || "❌ Like error", true);
      return;
    }
    toast("💛 Like!");
    loadAds(true);
    renderProfileView();
  }catch(e){
    toast("❌ Network", true);
  }
};

// ===== CALL / MSG =====
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

// ===== PUBLISH AD =====
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

  const from = fromEl.value.trim();
  const to = toEl.value.trim();
  const type = typeEl.value;
  const price = priceEl.value.trim();
  const seats = seatsEl.value.trim();
  const comment = (commentEl?.value || "").trim();

  if(!from || !to || !price){
    alert(t("fill_required"));
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
    const r = await apiFetch(API + "/api/ads", {
      method:"POST",
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
    loadAds(true);
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

// ===== SETTINGS / DONATE =====
window.donateNow = ()=>{
  toast("💛 711 GROUP");
};

// ===== TOAST =====
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

// ===== PROFILE VIEW =====
async function renderProfileView(){
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
  document.getElementById("pv-car").innerText = carLine ? carLine : (p.role==="client" ? "👤 Client" : "");

  // points from backend
  try{
    const r = await apiFetch(API + "/api/points?phone=" + encodeURIComponent(p.phone));
    const j = await r.json().catch(()=>({}));
    const pts = Number(j.points || 0);
    document.getElementById("pv-points").innerText = `${pts} 🏆`;
  }catch(e){
    document.getElementById("pv-points").innerText = `0 🏆`;
  }

  // rating from backend
  try{
    const r2 = await apiFetch(API + "/api/reviews/rating?phone=" + encodeURIComponent(p.phone));
    const s = await r2.json().catch(()=>({}));
    const avg = Number(s.avg || 0);
    const cnt = Number(s.count || 0);
    document.getElementById("pv-rating").innerText = `${avg.toFixed(1)} ⭐ (${cnt})`;
  }catch(e){
    document.getElementById("pv-rating").innerText = `0.0 ⭐`;
  }

  // fill edit sheet inputs
  document.getElementById("ep-name").value = p.name || "";
  document.getElementById("ep-phone").value = p.phone || "";
  document.getElementById("ep-car-brand").value = p.carBrand || "";
  document.getElementById("ep-car-number").value = p.carNumber || "";
  document.getElementById("ep-photo").value = p.photo || "";

  renderMyAds();
}

// ===== EDIT PROFILE SAVE =====
window.saveProfileEdit = async ()=>{
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

  try{
    await apiFetch(API + "/api/profile/save", {
      method:"POST",
      body: JSON.stringify(np)
    });
  }catch(e){}

  closeSheet("editProfileSheet");
  toast("✅ Saved");
  renderProfileView();
  loadAds(true);
  checkAdmin();
};

// ===== MY ADS =====
async function renderMyAds(){
  const listEl = document.getElementById("myAdsList");
  if(!listEl) return;

  const p = getProfile();
  if(!p) return;

  try{
    const res = await apiFetch(API + "/api/ads?limit=60&offset=0");
    const j = await res.json().catch(()=>({ok:false,items:[]}));
    const data = Array.isArray(j.items) ? j.items : (Array.isArray(j)?j:[]);
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

// ===== GEO TOGGLE =====
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
        updateGeoLine();
        SORT_MODE = "time";
        updateSortLine();
        loadAds(true);
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
      loadAds(true);
      if(geoStatus){
        geoStatus.innerText = `✅ ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`;
      }
    },
    (err)=>{
      if(geoStatus) geoStatus.innerText = "❌ Geo error";
      console.log(err);
    },
    { enableHighAccuracy:true, timeout:12000, maximumAge: 0 }
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

// ===== TOP DRIVERS =====
window.loadTopDrivers = async ()=>{
  const el = document.getElementById("topDriversList");
  if(!el) return;

  el.innerHTML = `<div class="skeleton glass"></div><div class="skeleton glass"></div>`;

  try{
    const r = await apiFetch(API + "/api/top/drivers");
    const list = await r.json().catch(()=>[]);

    if(!Array.isArray(list) || list.length===0){
      el.innerHTML = `<div class="glass card"><div class="muted">No drivers</div></div>`;
      return;
    }

    el.innerHTML = "";
    list.forEach((d,idx)=>{
      const div = document.createElement("div");
      div.className = "glass card";
      const avatarStyle = d.photo ? `style="background-image:url('${escapeHtml(d.photo)}')"` : "";
      const carLine = `${d.carBrand||""} ${d.carNumber||""}`.trim();
      const online = d.online ? "🟢" : "⚫";

      div.innerHTML = `
        <div class="card-head">
          <div class="card-left">
            <div class="card-avatar" ${avatarStyle}></div>
            <div>
              <div class="card-name">#${idx+1} ${escapeHtml(d.name||"—")} ${online}</div>
              <div class="card-sub">${escapeHtml(carLine)}</div>
            </div>
          </div>
        </div>

        <div class="card-body">
          <div class="card-info">
            <div class="badge">⭐ ${escapeHtml(String(d.rating||0))} (${escapeHtml(String(d.reviews_count||0))})</div>
            <div class="badge">🏆 ${escapeHtml(String(d.points||0))}</div>
          </div>

          <div class="card-actions">
            <button class="action call" onclick="callPhone('${escapeJs(d.phone)}')">📞 Call</button>
            <button class="action msg" onclick="msgUser('${escapeJs(d.phone)}','${escapeJs(d.name||"")}')">💬 Msg</button>
          </div>
        </div>
      `;
      el.appendChild(div);
    });

  }catch(e){
    el.innerHTML = `<div class="glass card"><div class="muted">Network error</div></div>`;
  }
};

// ===== FULLSCREEN MAP =====
let FULL_MAP = null;
let FULL_MARKERS = [];

function clearFullMarkers(){
  if(!FULL_MAP) return;
  FULL_MARKERS.forEach(m=>FULL_MAP.removeLayer(m));
  FULL_MARKERS = [];
}

function driverPopupHtml(ad){
  const car = `${ad.carBrand||""} ${ad.carNumber||""}`.trim();
  const pts = ad.points ?? 0;
  const rating = Number(ad.rating ?? 0).toFixed(1);

  return `
    <div style="min-width:180px;">
      <div style="font-weight:900;">${escapeHtml(ad.name||"—")}</div>
      <div style="font-size:12px;opacity:.8;margin-top:2px;">
        ${escapeHtml(car)}
      </div>
      <div style="margin-top:6px;font-size:12px;">
        ⭐ ${rating} • 🏆 ${pts}
      </div>
      <div style="margin-top:8px;display:flex;gap:6px;">
        <button style="flex:1;padding:8px;border:none;border-radius:12px;font-weight:900;background:#f6c300;color:#111;"
          onclick="callPhone('${escapeJs(ad.phone)}')">Call</button>
        <button style="flex:1;padding:8px;border:1px solid rgba(0,0,0,.2);border-radius:12px;font-weight:900;background:#fff;"
          onclick="msgUser('${escapeJs(ad.phone)}','${escapeJs(ad.name||"")}')">Msg</button>
      </div>
    </div>
  `;
}

window.openFullMap = async ()=>{
  showScreen("screen-map-full");
  try{ Telegram.WebApp.expand(); }catch(e){}
  try{ Telegram.WebApp.disableVerticalSwipes(); }catch(e){}

  const geo = getGeo();
  const center = geo ? [geo.lat, geo.lng] : [41.3111, 69.2797];

  if(!FULL_MAP){
    FULL_MAP = L.map("mapFullBox", { zoomControl:false }).setView(center, geo ? 13 : 11);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19
    }).addTo(FULL_MAP);

    setTimeout(()=>FULL_MAP.invalidateSize(), 300);
  }else{
    setTimeout(()=>FULL_MAP.invalidateSize(), 300);
    FULL_MAP.setView(center, geo ? 13 : 11);
  }

  await renderFullMapDrivers();
};

window.closeFullMap = ()=>{
  nav("home");
  setTimeout(()=>{
    try{ if(FULL_MAP) FULL_MAP.invalidateSize(); }catch(e){}
  }, 200);
};

async function renderFullMapDrivers(){
  if(!FULL_MAP) return;
  clearFullMarkers();

  const g = getGeo();
  if(g){
    const me = L.circleMarker([g.lat, g.lng], { radius: 9 }).addTo(FULL_MAP);
    me.bindPopup("📍 You");
    FULL_MARKERS.push(me);

    if(FILTERS?.radiusKm && FILTERS.radiusKm > 0){
      const circle = L.circle([g.lat, g.lng], { radius: FILTERS.radiusKm * 1000 }).addTo(FULL_MAP);
      FULL_MARKERS.push(circle);
    }
  }

  try{
    const r = await apiFetch(API + "/api/ads?limit=60&offset=0");
    const j = await r.json().catch(()=>({ok:false,items:[]}));
    const list = Array.isArray(j.items) ? j.items : (Array.isArray(j)?j:[]);
    let drivers = list.filter(a => a.role==="driver" && a.online !== 0);
    drivers = drivers.filter(d => d.lat && d.lng);

    if(FILTERS?.radiusKm && FILTERS.radiusKm > 0){
      const geo = getGeo();
      if(geo){
        drivers = drivers.filter(d=>{
          const dist = distanceKm(geo.lat, geo.lng, d.lat, d.lng);
          return dist <= FILTERS.radiusKm;
        });
      }
    }

    drivers.forEach(ad=>{
      const m = L.marker([ad.lat, ad.lng]).addTo(FULL_MAP);
      m.bindPopup(driverPopupHtml(ad));
      FULL_MARKERS.push(m);
    });

  }catch(e){
    toast("❌ Map error", true);
  }
}

// ===== ADMIN =====
function isAdmin(){
  try{
    const id = String(Telegram.WebApp.initDataUnsafe?.user?.id || "");
    return id && id === String(ADMIN_TG_ID);
  }catch(e){
    return false;
  }
}

function checkAdmin(){
  const adminBtn = document.querySelector(".admin-only");
  if(!adminBtn) return;
  adminBtn.style.display = isAdmin() ? "flex" : "none";
}

window.adminRefresh = async ()=>{
  const el = document.getElementById("adminStats");
  if(el) el.innerText = "Loading...";

  try{
    const r = await apiFetch(API + "/api/ads?limit=60&offset=0");
    const j = await r.json().catch(()=>({ok:false,items:[]}));
    const ads = Array.isArray(j.items) ? j.items : (Array.isArray(j)?j:[]);
    const count = Array.isArray(ads)?ads.length:0;
    if(el) el.innerText = `Ads: ${count}`;
  }catch(e){
    if(el) el.innerText = "Error";
  }
};

window.adminLoadProfiles = async ()=>{
  if(!isAdmin()){
    toast("Not admin", true);
    return;
  }

  const box = document.getElementById("adminUsers");
  if(!box) return;

  box.innerHTML = `<div class="skeleton glass"></div><div class="skeleton glass"></div>`;

  try{
    const r = await apiFetch(API + "/api/admin/profiles");
    const j = await r.json().catch(()=>({}));

    if(!r.ok || !j.ok){
      box.innerHTML = `<div class="glass card"><div class="muted">Admin error</div></div>`;
      return;
    }

    const items = Array.isArray(j.items)?j.items:[];
    if(items.length===0){
      box.innerHTML = `<div class="glass card"><div class="muted">No users</div></div>`;
      return;
    }

    box.innerHTML = "";
    items.forEach(u=>{
      const div = document.createElement("div");
      div.className = "glass card";

      const carLine = `${u.carBrand||""} ${u.carNumber||""}`.trim();
      const status = u.online ? "🟢" : "⚫";
      const ver = u.verified ? "✅ Verified" : "❌ Not verified";
      const ban = u.banned ? "⛔ BANNED" : "✅ Active";

      div.innerHTML = `
        <div class="card-body">
          <div class="card-name">${escapeHtml(u.name||"—")} ${status}</div>
          <div class="muted small">${escapeHtml(u.role)} • ${escapeHtml(u.phone)}</div>
          ${carLine ? `<div class="badge" style="margin-top:6px;">🚘 ${escapeHtml(carLine)}</div>` : ""}

          <div class="card-info" style="margin-top:8px;">
            <div class="badge">${ver}</div>
            <div class="badge">${ban}</div>
          </div>

          <div class="card-actions" style="margin-top:10px;">
            <button class="action call" onclick="adminToggleVerify('${escapeJs(u.phone)}', ${u.verified?0:1})">
              ${u.verified ? "❌ Unverify" : "✅ Verify"}
            </button>
            <button class="action msg" onclick="adminToggleBan('${escapeJs(u.phone)}', ${u.banned?0:1})">
              ${u.banned ? "✅ Unban" : "⛔ Ban"}
            </button>
          </div>
        </div>
      `;
      box.appendChild(div);
    });

  }catch(e){
    box.innerHTML = `<div class="glass card"><div class="muted">Network</div></div>`;
  }
};

window.adminToggleVerify = async (phone, v)=>{
  try{
    const r = await apiFetch(API + "/api/admin/profile/verify", {
      method:"POST",
      body: JSON.stringify({ phone, verified: !!v })
    });
    const j = await r.json().catch(()=>({}));
    if(!r.ok || !j.ok){
      toast("❌ Error", true);
      return;
    }
    toast("✅ Updated");
    adminLoadProfiles();
  }catch(e){
    toast("❌ Network", true);
  }
};

window.adminToggleBan = async (phone, v)=>{
  try{
    const r = await apiFetch(API + "/api/admin/profile/ban", {
      method:"POST",
      body: JSON.stringify({ phone, banned: !!v })
    });
    const j = await r.json().catch(()=>({}));
    if(!r.ok || !j.ok){
      toast("❌ Error", true);
      return;
    }
    toast("✅ Updated");
    adminLoadProfiles();
  }catch(e){
    toast("❌ Network", true);
  }
};

window.adminClearAds = async ()=>{
  toast("✅ Cleanup auto");
};

// ===== ADMIN BANNER =====
window.adminSetBanner = async ()=>{
  if(!isAdmin()){
    toast("Not admin", true);
    return;
  }

  const title = document.getElementById("banTitle")?.value.trim();
  const text  = document.getElementById("banText")?.value.trim();
  const image = document.getElementById("banImage")?.value.trim();
  const link  = document.getElementById("banLink")?.value.trim();

  try{
    const r = await apiFetch(API + "/api/admin/banner/set", {
      method:"POST",
      body: JSON.stringify({ title, text, image, link, active:1 })
    });

    const j = await r.json().catch(()=>({}));
    if(!r.ok || !j.ok){
      toast("❌ Banner error", true);
      console.log(j);
      return;
    }

    toast("✅ Banner published");
  }catch(e){
    toast("❌ Network", true);
  }
};

window.adminBannerOff = async ()=>{
  if(!isAdmin()){
    toast("Not admin", true);
    return;
  }
  try{
    const r = await apiFetch(API + "/api/admin/banner/off", { method:"POST" });
    const j = await r.json().catch(()=>({}));
    if(!r.ok || !j.ok){
      toast("❌ Error", true);
      return;
    }
    toast("🛑 Banner OFF");
  }catch(e){
    toast("❌ Network", true);
  }
};

// ===== BANNER (USER) =====
let CURRENT_BANNER = null;

function bannerHiddenToday(){
  const until = parseInt(localStorage.getItem("banner_hide_until") || "0", 10) || 0;
  return Date.now() < until;
}

window.hideBannerToday = ()=>{
  localStorage.setItem("banner_hide_until", String(Date.now() + 24*60*60*1000));
  closeSheet("bannerModal");
  toast("✅ Bugun banner ko‘rsatilmaydi");
};

window.openBannerLink = ()=>{
  if(!CURRENT_BANNER) return;
  const link = (CURRENT_BANNER.link || "").trim();
  if(!link){
    toast("Link yo‘q", true);
    return;
  }
  try{
    window.open(link, "_blank");
  }catch(e){
    toast("Link ochilmadi", true);
  }
};

async function loadBanner(){
  try{
    const r = await apiFetch(API + "/api/banner");
    const j = await r.json().catch(()=>({}));
    if(!j.ok || !j.banner) return;

    const b = j.banner;
    if(!b || b.active !== 1) return;
    if(bannerHiddenToday()) return;

    CURRENT_BANNER = b;

    const el = document.getElementById("bannerBody");
    if(el){
      el.innerHTML = `
        ${b.image ? `<div class="banner-img"><img src="${escapeHtml(b.image)}" /></div>` : ""}
        <div class="banner-title">${escapeHtml(b.title || "🔥 Promo")}</div>
        <div class="banner-text">${escapeHtml(b.text || "")}</div>
      `;
    }

    openSheet("bannerModal");
  }catch(e){
    console.log("banner err", e);
  }
}

// ===== ORDERS LIST (simple) =====
window.loadMyOrders = async ()=>{
  const p = getProfile();
  const listEl = document.getElementById("ordersList");
  if(!p || !listEl) return;

  listEl.innerHTML = `<div class="skeleton glass"></div><div class="skeleton glass"></div>`;

  try{
    const r = await apiFetch(API + "/api/orders/my?phone=" + encodeURIComponent(p.phone));
    const j = await r.json().catch(()=>({ok:false,items:[]}));

    if(!r.ok || !j.ok){
      listEl.innerHTML = `<div class="glass card"><div class="muted">No orders</div></div>`;
      return;
    }

    const items = Array.isArray(j.items)?j.items:[];
    if(items.length===0){
      listEl.innerHTML = `<div class="glass card"><div class="muted">No orders</div></div>`;
      return;
    }

    listEl.innerHTML = "";
    items.forEach(o=>{
      const div = document.createElement("div");
      div.className = "glass card";
      div.innerHTML = `
        <div class="card-body">
          <div class="route-line">
            <span class="route-pill">${escapeHtml(o.from||"")}</span>
            <span>→</span>
            <span class="route-pill">${escapeHtml(o.to||"")}</span>
          </div>
          <div class="card-info">
            <div class="badge">💰 ${escapeHtml(String(o.price||""))}</div>
            <div class="badge">🟡 ${escapeHtml(String(o.status||""))}</div>
          </div>
        </div>
      `;
      listEl.appendChild(div);
    });

  }catch(e){
    listEl.innerHTML = `<div class="glass card"><div class="muted">Network error</div></div>`;
  }
};

// ===== ESCAPE HELPERS =====
function escapeHtml(str){
  return String(str || "").replace(/[&<>"']/g, s=>({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[s]));
}
function escapeJs(str){
  return String(str||"").replace(/\\/g,"\\\\").replace(/'/g,"\\'");
}
