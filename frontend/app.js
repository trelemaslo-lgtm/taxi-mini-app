/******** CONFIG ********/
const ADMIN_PHONE = "+998955750132"; // ← ВПИШИ СВОЙ НОМЕР
const AD_LIFE_MIN = 30;

/******** STATE ********/
const AppState = {
  screen: "loading",
  lang: localStorage.getItem("lang"),
  role: localStorage.getItem("role"),
  profile: JSON.parse(localStorage.getItem("profile") || "null"),
  ads: JSON.parse(localStorage.getItem("ads") || "[]"),
  location: null,
  selectedAd: null,
  donations: JSON.parse(localStorage.getItem("donations") || "[]"),
  vip: localStorage.getItem("vip") === "true"
};

/******** NAV ********/
function navigate(screen) {
  AppState.screen = screen;
  render();
}

/******** RENDER ********/
function render() {
  document.querySelectorAll(".bottom-sheet").forEach(e => e.remove());
  const content = document.getElementById("content");
  content.innerHTML = "";

  if (AppState.profile) {
    const banned = JSON.parse(localStorage.getItem("banned") || "[]");
    if (banned.includes(AppState.profile.phone)) {
      content.innerHTML = `<div class="card"><h2>Доступ заблокирован</h2></div>`;
      return;
    }
  }

  switch (AppState.screen) {
    case "loading": content.appendChild(LoadingScreen()); break;
    case "lang": content.appendChild(LanguageScreen()); break;
    case "role": content.appendChild(RoleScreen()); break;
    case "profileForm": content.appendChild(ProfileFormScreen()); break;
    case "home": content.appendChild(HomeScreen()); break;
    case "ads": content.appendChild(AdsScreen()); break;
    case "profile": content.appendChild(ProfileScreen()); break;
    case "donate": content.appendChild(DonateScreen()); break;
    case "notifications": content.appendChild(NotificationsScreen()); break;
    case "admin": content.appendChild(AdminScreen()); break;
  }

  updateBadge();

  const sheet = BottomSheet();
  if (sheet) document.body.appendChild(sheet);
}

/******** INIT ********/
getUserLocation();

if (!AppState.lang) navigate("loading");
else if (!AppState.role) navigate("role");
else if (!AppState.profile) navigate("profileForm");
else navigate("home");

/******** SCREENS ********/
function LoadingScreen() {
  const el = document.createElement("div");
  el.className = "loading";
  el.innerHTML = `<div class="loading-text">LOADING</div><div class="loading-sub">created by 711 GROUP</div>`;
  setTimeout(() => navigate(AppState.lang ? "home" : "lang"), 1500);
  return el;
}

function LanguageScreen() {
  const el = document.createElement("div");
  el.className = "card";
  el.innerHTML = `
    <h2>Выберите язык</h2>
    <button class="glass-btn" onclick="setLang('ru')">Русский</button>
    <button class="glass-btn" onclick="setLang('uz')">O‘zbek</button>
    <button class="glass-btn" onclick="setLang('uzk')">Ўзбекча</button>
  `;
  return el;
}
function setLang(l){ localStorage.setItem("lang",l); AppState.lang=l; navigate("role"); }

function RoleScreen() {
  const el=document.createElement("div");
  el.className="card";
  el.innerHTML=`
    <h2>Выберите роль</h2>
    <button class="glass-btn" onclick="setRole('driver')">🚕 Водитель</button>
    <button class="glass-btn" onclick="setRole('client')">👤 Клиент</button>
  `;
  return el;
}
function setRole(r){ localStorage.setItem("role",r); AppState.role=r; navigate("profileForm"); }

function ProfileFormScreen() {
  const el=document.createElement("div");
  el.className="card";
  el.innerHTML=`
    <h2>Профиль</h2>
    <input id="name" placeholder="Имя">
    <input id="phone" placeholder="Телефон">
    ${AppState.role==="driver"?'<input id="car" placeholder="Номер машины">':""}
    <button class="glass-btn" onclick="saveProfile()">Продолжить</button>
  `;
  return el;
}
function saveProfile(){
  AppState.profile={
    name: name.value,
    phone: phone.value,
    car: car?.value||"",
    role: AppState.role,
    points: 0
  };
  localStorage.setItem("profile",JSON.stringify(AppState.profile));
  navigate("home");
}

function HomeScreen(){
  const el=document.createElement("div");
  el.className="card";
  el.innerHTML=`
    <h2>Ingichka Taksi</h2>
    <p>Привет, ${AppState.profile.name}</p>
    ${isAdmin()?'<button class="glass-btn" onclick="navigate(\'admin\')">👑 Админка</button>':""}
  `;
  return el;
}

function AdsScreen(){
  cleanupAds();
  const el=document.createElement("div");
  el.innerHTML=`
    <div class="card">
      <h2>Объявления</h2>
      ${AppState.role==="driver"?'<button class="glass-btn" onclick="navigate(\'createAd\')">➕ Добавить</button>':""}
      <div id="ads"></div>
    </div>
  `;
  setTimeout(renderAds,0);
  return el;
}

function renderAds(){
  const box=document.getElementById("ads");
  box.innerHTML="";
  AppState.ads.forEach(ad=>{
    const d=document.createElement("div");
    d.className="ad-card";
    d.onclick=()=>{AppState.selectedAd=ad;render();}
    d.innerHTML=`<b>${ad.from} → ${ad.to}</b>
      <span>💰 ${ad.price}</span>
      <span>🪑 ${ad.seats}</span>
      <span>⭐ ${ad.points||0}</span>`;
    box.appendChild(d);
  });
}

function BottomSheet(){
  const ad=AppState.selectedAd;
  if(!ad)return null;
  const el=document.createElement("div");
  el.className="bottom-sheet";
  el.innerHTML=`
    <div class="sheet-handle"></div>
    <h3>${ad.from} → ${ad.to}</h3>
    <div class="sheet-row">👤 ${ad.driverName}</div>
    <div class="sheet-row">📞 ${ad.driverPhone}</div>
    <div class="sheet-row">💰 ${ad.price}</div>
    <a href="tel:${ad.driverPhone}" class="glass-btn" onclick="notifyCall('${ad.driverPhone}')">📞 Позвонить</a>
    ${AppState.role==="client"?'<button class="glass-btn" onclick="likeAd()">❤️ Лайк</button>':""}
    <button onclick="AppState.selectedAd=null;render()">Закрыть</button>
  `;
  return el;
}

/******** HELPERS ********/
function getUserLocation(){
  if(navigator.geolocation){
    navigator.geolocation.getCurrentPosition(p=>{
      AppState.location={lat:p.coords.latitude,lon:p.coords.longitude};
    });
  }
}
function cleanupAds(){
  const now=Date.now();
  AppState.ads=AppState.ads.filter(a=>(now-a.createdAt)/60000<AD_LIFE_MIN);
  localStorage.setItem("ads",JSON.stringify(AppState.ads));
}
function isAdmin(){ return AppState.profile?.phone===ADMIN_PHONE; }

/******** LIKES + NOTIFS ********/
function likeAd(){
  addNotification(AppState.selectedAd.driverPhone,`❤️ ${AppState.profile.name} лайк`);
  alert("Спасибо ❤️");
  AppState.selectedAd=null;
  render();
}
function getNotifications(){ return JSON.parse(localStorage.getItem("notifications")||"{}"); }
function saveNotifications(n){ localStorage.setItem("notifications",JSON.stringify(n)); }
function addNotification(phone,text){
  const n=getNotifications();
  n[phone]=n[phone]||[];
  n[phone].unshift({text,time:Date.now(),read:false});
  saveNotifications(n);
}
function notifyCall(phone){
  addNotification(phone,`📞 Интерес к поездке`);
}
function unreadCount(){
  const n=getNotifications()[AppState.profile.phone]||[];
  return n.filter(x=>!x.read).length;
}
function updateBadge(){
  const b=document.getElementById("notif-badge");
  if(b)b.innerText=unreadCount()||"";
}
