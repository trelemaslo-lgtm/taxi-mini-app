diff --git a/frontend/app.js b/frontend/app.js
index dedb899c29ed408f005180a26cf2ed4dc80d9ac5..4b0027e831ca439003b670d2d5d4fd758f326a7a 100644
--- a/frontend/app.js
+++ b/frontend/app.js
@@ -6,57 +6,64 @@
 // ✅ Search + Filter
 // ✅ Profile upload device (Supabase ready)
 // ✅ Car gallery upload
 // ✅ Map ULTRA (Leaflet)
 // ✅ Chat WS (typing + presence)
 // ✅ Admin telegram id panel + banner upload
 // ✅ Theme switch + Sound toggle + Glass toast
 // ============================================================
 
 // =================== CONFIG ===================
 const API = "https://taxi-backend-5kl2.onrender.com";
 const WS_URL = "wss://ws-server-jd2x.onrender.com/ws"; // change if needed
 
 const AUTO_DELETE_SECONDS = 60 * 60;
 
 // =================== GLOBAL STATE ===================
 let FEED_MODE = "drivers"; // drivers | clients
 let SORT_MODE = "time"; // time | distance
 let FILTER = { priceMax: null, seatsMin: null };
 
 // Chat WS state
 let ws = null;
 let wsConnected = false;
 let currentChatPeer = null;
 let typingTimer = null;
+let SEARCH_DEBOUNCE_TIMER = null;
+let FEED_CACHE_KEY = "feed_cache_v1";
+
+// Telegram auth state
+let TG_AUTH = null;
+let TG_UI = { expanded: false, fullscreen: false };
 
 // Map state
 let map = null;
 let markersLayer = null;
 
 // Sounds
 let SFX_ENABLED = localStorage.getItem("sfx") !== "0";
+let HAPTIC_ENABLED = localStorage.getItem("haptic") !== "0";
 const SFX = {
   tap: new Audio("data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABAAZGF0YQAAAAA="),
   ok: new Audio("data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABAAZGF0YQAAAAA="),
   err: new Audio("data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABAAZGF0YQAAAAA="),
 };
 
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
@@ -266,141 +273,360 @@ function toast(msg, danger=false){
     }
   }catch(e){}
   alert(msg);
 }
 
 
 function t(key){
   return key;
 }
 
 // =================== SAFE HELPERS ===================
 function qs(id){ return document.getElementById(id); }
 
 function escapeHtml(str){
   return String(str || "").replace(/[&<>"']/g, s=>({
     "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
   }[s]));
 }
 function escapeJs(str){
   return String(str||"").replace(/\\/g,"\\\\").replace(/'/g,"\\'");
 }
 
 function playSfx(name){
   if(!SFX_ENABLED) return;
   try{
-    const a = SFX[name];
-    if(!a) return;
-    a.currentTime = 0;
-    a.play().catch(()=>{});
+    const Ctx = window.AudioContext || window.webkitAudioContext;
+    if(!Ctx) return;
+    const ctx = new Ctx();
+
+    const tone = (type, freq, start, dur, gain=0.045)=>{
+      const o = ctx.createOscillator();
+      const g = ctx.createGain();
+      o.type = type;
+      o.frequency.setValueAtTime(freq, ctx.currentTime + start);
+      o.connect(g); g.connect(ctx.destination);
+      g.gain.setValueAtTime(0.0001, ctx.currentTime + start);
+      g.gain.exponentialRampToValueAtTime(gain, ctx.currentTime + start + 0.01);
+      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + start + dur);
+      o.start(ctx.currentTime + start);
+      o.stop(ctx.currentTime + start + dur + 0.01);
+    };
+
+    // 1) Tap: 30-60ms soft glass pop
+    if(name === "tap") tone("sine", 380, 0, 0.05, 0.028);
+
+    // 2) Success: 2-step clean ding, 120-200ms
+    else if(name === "ok"){
+      tone("triangle", 520, 0.00, 0.09, 0.034);
+      tone("triangle", 720, 0.09, 0.10, 0.032);
+    }
+
+    // 3) Error: soft thud/buzz, calm
+    else if(name === "err"){
+      tone("sawtooth", 170, 0.00, 0.12, 0.03);
+      tone("triangle", 130, 0.09, 0.10, 0.022);
+    }
+
+    // 4) Notification: minimalist tick
+    else if(name === "notif") tone("sine", 640, 0.00, 0.07, 0.02);
+
+    // 5) Swipe / navigation: light whoosh vibe
+    else if(name === "swipe"){
+      tone("triangle", 260, 0.00, 0.08, 0.02);
+      tone("sine", 180, 0.05, 0.09, 0.018);
+    }
+
+    else tone("sine", 340, 0, 0.06, 0.025);
+
+    setTimeout(()=>ctx.close(), 360);
+  }catch(e){}
+}
+
+function triggerHaptic(kind="light"){
+  if(!HAPTIC_ENABLED) return;
+  try{
+    if(isTelegramWebApp() && Telegram.WebApp.HapticFeedback){
+      if(kind === "error") Telegram.WebApp.HapticFeedback.notificationOccurred("error");
+      else if(kind === "success") Telegram.WebApp.HapticFeedback.notificationOccurred("success");
+      else Telegram.WebApp.HapticFeedback.impactOccurred("light");
+      return;
+    }
+    if(navigator.vibrate){
+      navigator.vibrate(kind === "error" ? [30, 20, 30] : kind === "success" ? [20] : [12]);
+    }
   }catch(e){}
 }
 
 // =================== TOAST (GLASS) ===================
 function toast(msg, danger=false){
   playSfx(danger ? "err" : "ok");
+  triggerHaptic(danger ? "error" : "success");
   let wrap = document.querySelector(".toast-wrap");
   if(!wrap){
     wrap = document.createElement("div");
     wrap.className = "toast-wrap";
     document.body.appendChild(wrap);
   }
 
   const el = document.createElement("div");
   el.className = "toast";
   el.innerHTML = `
     <div class="toast-ico">${danger ? "❌" : "✅"}</div>
     <div class="toast-text">${escapeHtml(msg)}</div>
   `;
   wrap.appendChild(el);
 
   setTimeout(()=>{
     el.style.opacity = "0";
     el.style.transform = "translateY(12px)";
     setTimeout(()=> el.remove(), 250);
   }, 1600);
 }
 
 // =================== SCREEN NAV ===================
 function showScreen(id){
   document.querySelectorAll(".screen").forEach(s=>s.classList.remove("active"));
   qs(id)?.classList.add("active");
+  updateTelegramBackButton();
+  updateTelegramMainButton();
 }
 
 function setActiveNav(name){
   ["navHome","navCreate","navMap","navProfile"].forEach(id=>{
     qs(id)?.classList.remove("active");
   });
   if(name==="home") qs("navHome")?.classList.add("active");
   if(name==="map") qs("navMap")?.classList.add("active");
   if(name==="profile") qs("navProfile")?.classList.add("active");
 }
 
 window.nav = async (where)=>{
-  playSfx("tap");
+  playSfx("swipe");
 
   if(where==="home"){
     setActiveNav("home");
     showScreen("screen-home");
     await loadAds();
+    await loadOrders();
+    await loadTopDrivers();
+    await loadNews();
+    await loadFavorites();
+    await loadNotifications();
+    await loadSupportTickets();
+    await loadBookingsPro();
+    await loadDriverCalendar();
   }
   if(where==="profile"){
     setActiveNav("profile");
     showScreen("screen-profile-view");
     await renderProfileView();
   }
   if(where==="map"){
     setActiveNav("map");
     showScreen("screen-map");
     initMap();
     await loadMapAds();
   }
   if(where==="admin"){
     showScreen("screen-admin");
     adminRefresh();
   }
 };
 
-window.openSheet = (id)=> qs(id)?.classList.add("open");
-window.closeSheet = (id)=> qs(id)?.classList.remove("open");
+window.openSheet = (id)=> { playSfx("swipe"); qs(id)?.classList.add("open"); updateTelegramBackButton(); updateTelegramMainButton(); };
+window.closeSheet = (id)=> { playSfx("swipe"); qs(id)?.classList.remove("open"); updateTelegramBackButton(); updateTelegramMainButton(); };
 window.sheetOutside = (e,id)=> { if(e.target.id===id) closeSheet(id); };
 
 // =================== THEME ===================
 function applyTheme(){
   const th = localStorage.getItem("theme") || "dark";
   document.documentElement.setAttribute("data-theme", th === "light" ? "light" : "dark");
   const btn = qs("themeBtn");
   if(btn) btn.innerText = th === "light" ? "☀️" : "🌙";
 }
 function toggleTheme(){
   const th = localStorage.getItem("theme") || "dark";
-  localStorage.setItem("theme", th === "light" ? "dark" : "light");
+  const next = th === "light" ? "dark" : "light";
+  localStorage.setItem("theme", next);
   applyTheme();
+  try{ if(isTelegramWebApp() && Telegram.WebApp.setHeaderColor) Telegram.WebApp.setHeaderColor(next); }catch(e){}
   playSfx("tap");
 }
 qs("themeBtn")?.addEventListener("click", toggleTheme);
 
+
+
+function getTelegramUserUnsafe(){
+  try{
+    if(window.Telegram && Telegram.WebApp && Telegram.WebApp.initDataUnsafe?.user){
+      return Telegram.WebApp.initDataUnsafe.user;
+    }
+  }catch(e){}
+  return null;
+}
+
+function applyTelegramUserToProfileForm(user){
+  if(!user) return;
+
+  const fullName = [user.first_name, user.last_name].filter(Boolean).join(" ").trim();
+  const nameEl = qs("p-name");
+  if(nameEl && !nameEl.value.trim() && fullName){
+    nameEl.value = fullName;
+  }
+
+  const profile = getProfile();
+  if(profile){
+    const next = { ...profile, telegram_id: String(user.id || profile.telegram_id || "") };
+    if(!next.name && fullName) next.name = fullName;
+    if(!next.photo && user.photo_url) next.photo = user.photo_url;
+    setProfile(next);
+  }
+}
+
+async function verifyTelegramAuth(){
+  try{
+    if(!(window.Telegram && Telegram.WebApp)) return;
+    const initData = Telegram.WebApp.initData || "";
+    if(!initData) return;
+
+    const res = await fetch(API + "/api/auth/telegram", {
+      method:"POST",
+      headers:{"Content-Type":"application/json"},
+      body: JSON.stringify({ initData })
+    });
+
+    const data = await res.json().catch(()=>({}));
+    if(!res.ok || !data.ok){
+      console.warn("Telegram auth verify failed", data);
+      toast("⚠️ Telegram auth verify failed", true);
+      return;
+    }
+
+    TG_AUTH = data.profile || null;
+    const userUnsafe = getTelegramUserUnsafe();
+    applyTelegramUserToProfileForm(userUnsafe);
+  }catch(e){
+    console.warn("Telegram auth error", e);
+  }
+}
+
+
+
+function isTelegramWebApp(){
+  return !!(window.Telegram && Telegram.WebApp);
+}
+
+function syncTelegramTheme(){
+  if(!isTelegramWebApp()) return;
+  try{
+    const tgTheme = Telegram.WebApp.colorScheme;
+    if(tgTheme === "dark" || tgTheme === "light"){
+      if(!localStorage.getItem("theme")){
+        localStorage.setItem("theme", tgTheme);
+      }
+      document.documentElement.setAttribute("data-theme", tgTheme);
+      const btn = qs("themeBtn");
+      if(btn) btn.innerText = tgTheme === "light" ? "☀️" : "🌙";
+    }
+  }catch(e){}
+}
+
+function updateTelegramBackButton(){
+  if(!isTelegramWebApp()) return;
+  try{
+    const openSheetEl = document.querySelector('.sheet-wrap.open');
+    const activeScreen = document.querySelector('.screen.active')?.id || '';
+    const needBack = !!openSheetEl || ["screen-map","screen-profile-view","screen-admin"].includes(activeScreen);
+    if(needBack) Telegram.WebApp.BackButton.show();
+    else Telegram.WebApp.BackButton.hide();
+  }catch(e){}
+}
+
+function updateTelegramMainButton(){
+  if(!isTelegramWebApp()) return;
+  try{
+    const mb = Telegram.WebApp.MainButton;
+    const activeScreen = document.querySelector('.screen.active')?.id || '';
+    const openCreate = qs("createAdSheet")?.classList.contains("open");
+
+    if(openCreate){
+      mb.setText("✅ E’lon berish");
+      mb.show();
+      mb.enable();
+      mb.onClick(window.publishAd);
+      return;
+    }
+
+    mb.offClick(window.publishAd);
+    mb.offClick(window.__openCreateAdSheet);
+
+    if(activeScreen === "screen-home"){
+      mb.setText("➕ E’lon yaratish");
+      mb.show();
+      mb.enable();
+      mb.onClick(window.__openCreateAdSheet);
+    }else{
+      mb.hide();
+    }
+  }catch(e){}
+}
+
+window.__openCreateAdSheet = ()=> openSheet("createAdSheet");
+
+window.tgToggleExpand = ()=>{
+  if(!isTelegramWebApp()) return toast("Telegram not detected", true);
+  try{
+    Telegram.WebApp.expand();
+    TG_UI.expanded = true;
+    toast("↕️ Expanded");
+  }catch(e){
+    toast("Expand error", true);
+  }
+};
+
+window.tgToggleFullscreen = ()=>{
+  if(!isTelegramWebApp()) return toast("Telegram not detected", true);
+  try{
+    if(TG_UI.fullscreen && Telegram.WebApp.exitFullscreen){
+      Telegram.WebApp.exitFullscreen();
+      TG_UI.fullscreen = false;
+      toast("🗗 Exit fullscreen");
+      return;
+    }
+    if(Telegram.WebApp.requestFullscreen){
+      Telegram.WebApp.requestFullscreen();
+      TG_UI.fullscreen = true;
+      toast("⛶ Fullscreen ON");
+    }else{
+      toast("Fullscreen not supported", true);
+    }
+  }catch(e){
+    toast("Fullscreen error", true);
+  }
+};
+
 // =================== ROLE/LANG/PROFILE ===================
 function getProfile(){
   try{ return JSON.parse(localStorage.getItem("profile")||"null"); }catch{return null}
 }
 function setProfile(p){
   localStorage.setItem("profile", JSON.stringify(p));
 }
 window.selectRole = (role)=>{
   localStorage.setItem("role", role);
   updateProfileUIRole();
   showScreen("screen-profile");
 };
 function updateProfileUIRole(){
   const role = localStorage.getItem("role");
   const driverExtra = qs("driver-extra");
   if(driverExtra) driverExtra.style.display = role==="driver" ? "block" : "none";
 }
 window.goBackTo = (id)=> showScreen(id);
 
 window.requestContact = ()=>{
   try{
     if(window.Telegram && Telegram.WebApp){
       Telegram.WebApp.requestContact((ok)=>{
         // Contact shared (Telegram fills)
       });
@@ -424,57 +650,60 @@ async function fileToBase64(file){
   });
 }
 
 // =================== PROFILE SAVE ===================
 window.saveProfile = async ()=>{
   playSfx("tap");
   const role = localStorage.getItem("role");
   const name = qs("p-name")?.value.trim();
   const phone = qs("p-phone")?.value.trim();
   const carBrand = qs("p-car-brand")?.value.trim();
   const carNumber = qs("p-car-number")?.value.trim();
   const bio = qs("p-bio")?.value.trim();
 
   if(!name || !phone){
     toast("❗ Fill name & phone", true);
     return;
   }
 
   // Upload from device (base64 for now)
   let photo = "";
   const f = qs("p-photo-file")?.files?.[0];
   if(f){
     photo = await fileToBase64(f);
   }
 
+  const tgUser = getTelegramUserUnsafe();
   const profile = {
     role,
     name,
     phone,
+    telegram_id: TG_AUTH?.telegram_id || (tgUser?.id ? String(tgUser.id) : ""),
+    username: TG_AUTH?.username || tgUser?.username || "",
     carBrand: role==="driver" ? (carBrand||"") : "",
     carNumber: role==="driver" ? (carNumber||"") : "",
-    photo,
+    photo: photo || TG_AUTH?.photo_url || tgUser?.photo_url || "",
     bio: bio || "",
   };
 
   setProfile(profile);
   showScreen("screen-home");
   nav("home");
   await loadAds();
   await renderProfileView();
   checkAdmin();
 };
 
 // =================== EDIT PROFILE ===================
 window.saveProfileEdit = async ()=>{
   playSfx("tap");
   const p = getProfile();
   if(!p) return;
 
   let photo = p.photo || "";
   const f = qs("ep-photo-file")?.files?.[0];
   if(f){
     photo = await fileToBase64(f);
   }
 
   const np = {
     ...p,
@@ -528,194 +757,224 @@ window.updateLocationNow = async ()=>{
       if(geoStatus){
         geoStatus.innerText = `✅ ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`;
       }
     },
     ()=>{
       if(geoStatus) geoStatus.innerText = "❌ Geo error";
     },
     { enableHighAccuracy:true, timeout:10000 }
   );
 };
 
 function updateGeoLine(){
   const geoLine = qs("geoLine");
   if(!geoLine) return;
   const geo = getGeo();
   geoLine.innerHTML = geo
     ? `📍 <span>Geolokatsiya: ON</span>`
     : `📍 <span>Geolokatsiya: OFF</span>`;
 }
 
 // =================== SETTINGS TOGGLES ===================
 function initToggles(){
   const notifyToggle = qs("notifyToggle");
   const geoToggle = qs("geoToggle");
   const sfxToggle = qs("sfxToggle");
+  const hapticToggle = qs("hapticToggle");
 
   if(notifyToggle){
     notifyToggle.checked = localStorage.getItem("notify")==="1";
     notifyToggle.onchange = ()=> localStorage.setItem("notify", notifyToggle.checked ? "1" : "0");
   }
 
   if(sfxToggle){
     sfxToggle.checked = SFX_ENABLED;
     sfxToggle.onchange = ()=>{
       SFX_ENABLED = sfxToggle.checked;
       localStorage.setItem("sfx", SFX_ENABLED ? "1" : "0");
       playSfx("tap");
     };
   }
 
+  if(hapticToggle){
+    hapticToggle.checked = HAPTIC_ENABLED;
+    hapticToggle.onchange = ()=>{
+      HAPTIC_ENABLED = hapticToggle.checked;
+      localStorage.setItem("haptic", HAPTIC_ENABLED ? "1" : "0");
+      triggerHaptic("light");
+    };
+  }
+
   if(geoToggle){
     geoToggle.checked = !!getGeo();
     geoToggle.onchange = async ()=>{
       if(geoToggle.checked){
         await updateLocationNow();
         SORT_MODE = "distance";
       }else{
         localStorage.removeItem("geo");
         SORT_MODE = "time";
         updateGeoLine();
       }
       await loadAds();
     };
   }
 
   updateGeoLine();
   updateSortLine();
 }
 
 // =================== FEED SWITCH ===================
 window.switchFeed = async (mode)=>{
   FEED_MODE = mode;
   qs("tabDrivers")?.classList.toggle("active", mode==="drivers");
   qs("tabClients")?.classList.toggle("active", mode==="clients");
   await loadAds();
 };
 
 // =================== SORT ===================
 window.toggleSort = async ()=>{
   const geoOn = qs("geoToggle")?.checked;
   if(geoOn){
     SORT_MODE = (SORT_MODE==="distance") ? "time" : "distance";
   }else{
     SORT_MODE = "time";
   }
   updateSortLine();
   await loadAds();
 };
 
 function updateSortLine(){
   const el = qs("sortLine");
   if(!el) return;
   el.innerHTML = SORT_MODE==="distance"
     ? `↕️ <span>Saralash: masofa</span>`
     : `↕️ <span>Saralash: vaqt</span>`;
 }
 
 // =================== SEARCH + FILTER ===================
 qs("searchInput")?.addEventListener("input", ()=>{
-  loadAds();
+  clearTimeout(SEARCH_DEBOUNCE_TIMER);
+  SEARCH_DEBOUNCE_TIMER = setTimeout(()=>{
+    loadAds(true);
+  }, 260);
 });
 
 window.applyFilter = ()=>{
   playSfx("tap");
   const p = qs("f-price")?.value.trim();
   const s = qs("f-seats")?.value.trim();
   FILTER.priceMax = p ? parseInt(p,10) : null;
   FILTER.seatsMin = s ? parseInt(s,10) : null;
   closeSheet("filterSheet");
   loadAds();
 };
 
 window.resetFilter = ()=>{
   playSfx("tap");
   FILTER = { priceMax:null, seatsMin:null };
   qs("f-price").value = "";
   qs("f-seats").value = "";
   closeSheet("filterSheet");
   loadAds();
 };
 
 // =================== ADS LOAD ===================
-async function loadAds(){
+async function loadAds(useNetwork=true){
   const cards = qs("cards");
   if(!cards) return;
 
   cards.innerHTML = `
     <div class="skeleton glass"></div>
     <div class="skeleton glass"></div>
     <div class="skeleton glass"></div>
   `;
 
   try{
-    const res = await fetch(API + "/api/ads");
-    const data = await res.json();
-    let list = Array.isArray(data) ? data : [];
+    let list = [];
+    if(useNetwork){
+      const res = await fetch(API + "/api/ads");
+      const data = await res.json();
+      list = Array.isArray(data) ? data : [];
+      localStorage.setItem(FEED_CACHE_KEY, JSON.stringify({ ts: Date.now(), list }));
+    }else{
+      const cache = JSON.parse(localStorage.getItem(FEED_CACHE_KEY) || "null");
+      list = Array.isArray(cache?.list) ? cache.list : [];
+    }
 
     // feed filter
     list = list.filter(a => (FEED_MODE==="drivers") ? a.role==="driver" : a.role==="client");
 
     // search
     const q = (qs("searchInput")?.value || "").trim().toLowerCase();
     if(q){
       list = list.filter(a=>{
         const s = `${a.name||""} ${a.from||""} ${a.to||""} ${a.carBrand||""} ${a.carNumber||""}`.toLowerCase();
         return s.includes(q);
       });
     }
 
     // filters
     if(FILTER.priceMax != null){
       list = list.filter(a => (parseInt(a.price||"0",10) <= FILTER.priceMax));
     }
     if(FILTER.seatsMin != null){
       list = list.filter(a => (parseInt(a.seats||"0",10) >= FILTER.seatsMin));
     }
 
     // sorting
     const geo = getGeo();
     const geoEnabled = !!geo && (qs("geoToggle")?.checked);
 
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
       cards.innerHTML = `<div class="glass card"><div class="muted">Hozircha e’lonlar yo‘q</div></div>`;
       return;
     }
 
     cards.innerHTML = "";
     list.forEach(ad => cards.appendChild(renderCard(ad, geo)));
   }catch(e){
+    try{
+      const cache = JSON.parse(localStorage.getItem(FEED_CACHE_KEY) || "null");
+      const cachedList = Array.isArray(cache?.list) ? cache.list : [];
+      if(cachedList.length){
+        cards.innerHTML = "";
+        cachedList.slice(0,40).forEach(ad => cards.appendChild(renderCard(ad, getGeo())));
+        toast("Offline feed cache ishlatildi");
+        return;
+      }
+    }catch(_e){}
     cards.innerHTML = `<div class="glass card"><div class="muted">⚠️ Load error</div></div>`;
   }
 }
 
 // =================== CARD RENDER ===================
 function moneyPretty(v){
   const s = String(v||"").replace(/\s/g,"");
   if(!s) return "";
   if(!/^\d+$/.test(s)) return s;
   return s.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
 }
 
 function renderCard(ad, geo){
   const card = document.createElement("div");
   card.className = "glass card clickable";
 
   const avatarStyle = ad.photo ? `style="background-image:url('${escapeHtml(ad.photo)}')"` : "";
   const carLine = `${ad.carBrand||""} ${ad.carNumber||""}`.trim();
   const typeLabel = (ad.type==="now") ? "SRAZU EDI" : (ad.type==="20" ? "20 daqiqada" : "Odam to‘lsa");
 
   let dist = "";
   if(geo && ad.lat && ad.lng){
     const d = distanceKm(geo.lat, geo.lng, ad.lat, ad.lng);
     dist = `📍 ${d.toFixed(1)} km`;
   }
@@ -732,50 +991,55 @@ function renderCard(ad, geo){
 
       <button class="like-btn" title="Like" onclick="event.stopPropagation(); likeDriver('${escapeJs(ad.id)}')">💛</button>
     </div>
 
     <div class="card-body" style="margin-top:10px;display:flex;flex-direction:column;gap:8px;">
       <div class="route-line">
         <span class="route-pill">${escapeHtml(ad.from || "")}</span>
         <span>→</span>
         <span class="route-pill">${escapeHtml(ad.to || "")}</span>
       </div>
 
       <div class="card-info">
         <div class="badge">⏱ ${escapeHtml(typeLabel)}</div>
         <div class="badge">👥 ${escapeHtml(String(ad.seats ?? ""))}</div>
         <div class="badge">💰 ${escapeHtml(moneyPretty(ad.price ?? ""))}</div>
         ${dist ? `<div class="badge">${dist}</div>` : ""}
         <div class="badge">👁 ${escapeHtml(String(ad.views ?? 0))}</div>
         <div class="badge">🏆 ${escapeHtml(String(ad.points ?? 0))}</div>
       </div>
 
       <div class="badge">${escapeHtml(ad.comment || "")}</div>
 
       <div class="card-actions">
         <button class="action call" onclick="event.stopPropagation(); callPhone('${escapeJs(ad.phone)}')">Qo‘ng‘iroq</button>
         <button class="action msg" onclick="event.stopPropagation(); openChat('${escapeJs(ad.phone)}','${escapeJs(ad.name||"")}')">Yozish</button>
+        <button class="action" onclick="event.stopPropagation(); toggleFavorite('${escapeJs(ad.phone)}')">❤️</button>
+        <button class="action" onclick="event.stopPropagation(); reportAd('${escapeJs(ad.id)}')">🚩</button>
+        <button class="action" onclick="event.stopPropagation(); quickShareAd('${escapeJs(ad.id)}','${escapeJs(ad.from||"")}','${escapeJs(ad.to||"")}')">🔗</button>
+        <button class="action" onclick="event.stopPropagation(); prefillBooking('${escapeJs(ad.phone)}')">⏳</button>
+        <button class="action" onclick="event.stopPropagation(); openMapDirections(${ad.lat||"null"}, ${ad.lng||"null"}, '${escapeJs(ad.from||"")}', '${escapeJs(ad.to||"")}')">🧭</button>
       </div>
     </div>
   `;
 
   card.onclick = ()=> openAdDetail(ad);
   return card;
 }
 
 // =================== AD DETAIL ===================
 function openAdDetail(ad){
   // For now, quick popup. Later Ultra modal.
   toast(`${ad.from} → ${ad.to} | ${moneyPretty(ad.price)} so'm`);
 }
 
 // =================== LIKE -> BACKEND ===================
 async function likeDriver(adId){
   playSfx("tap");
   try{
     const r = await fetch(API + `/api/ads/${adId}/like`, { method:"POST" });
     if(!r.ok) throw new Error("like fail");
     toast("💛 Like");
     await loadAds();
     await renderProfileView();
   }catch(e){
     toast("❌ Like error", true);
@@ -813,50 +1077,51 @@ function connectWs(){
     };
     ws.onclose = ()=>{
       wsConnected = false;
     };
   }catch(e){
     toast("❌ WS error", true);
   }
 }
 
 function sendWs(payload){
   try{
     if(ws && wsConnected){
       ws.send(JSON.stringify(payload));
     }
   }catch(e){}
 }
 
 function handleWs(msg){
   if(msg.type==="typing" && msg.from===currentChatPeer){
     qs("typingLine").innerText = "typing...";
     clearTimeout(typingTimer);
     typingTimer = setTimeout(()=> qs("typingLine").innerText="", 900);
   }
   if(msg.type==="chat"){
     addBubble(msg.text, msg.from === getProfile()?.phone);
+    if(msg.from !== getProfile()?.phone) playSfx("notif");
   }
 }
 
 function addBubble(text, mine){
   const room = qs("chatRoom");
   if(!room) return;
   const div = document.createElement("div");
   div.className = "bubble " + (mine ? "mine" : "");
   div.innerText = text;
   room.appendChild(div);
   room.scrollTop = room.scrollHeight;
 }
 
 window.__typing = ()=>{
   if(!currentChatPeer) return;
   sendWs({type:"typing", to:currentChatPeer, from:getProfile()?.phone});
 };
 
 window.__sendMsg = ()=>{
   const input = qs("chatInput");
   if(!input) return;
   const text = input.value.trim();
   if(!text) return;
   input.value = "";
   addBubble(text, true);
@@ -1101,94 +1366,788 @@ function renderCarGallery(){
     const img = document.createElement("img");
     img.src = src;
     img.onclick = ()=> openFullscreen(src);
     box.appendChild(img);
   });
 }
 
 function openFullscreen(src){
   let m = document.querySelector(".fullscreen-img");
   if(!m){
     m = document.createElement("div");
     m.className = "fullscreen-img";
     m.innerHTML = `<img/><div style="position:absolute;top:14px;right:14px;">
       <button class="icon-btn" id="closeFull">✕</button>
     </div>`;
     document.body.appendChild(m);
     m.addEventListener("click",(e)=>{
       if(e.target===m) m.classList.remove("active");
     });
     m.querySelector("#closeFull").onclick = ()=> m.classList.remove("active");
   }
   m.querySelector("img").src = src;
   m.classList.add("active");
 }
 
+
+
+
+
+// =================== NEWS / TOP / FAVORITES / NOTIFICATIONS ===================
+window.loadTopDrivers = async ()=>{
+  const el = qs("topDrivers");
+  if(!el) return;
+  try{
+    const r = await fetch(API + "/api/drivers/top?limit=8");
+    const j = await r.json();
+    const list = j.drivers || [];
+    if(!list.length){ el.innerHTML = ""; return; }
+    el.innerHTML = `<div class="muted small">🏆 Top Drivers</div>`;
+    list.forEach(d=>{
+      const div = document.createElement("div");
+      div.className = "glass card";
+      div.innerHTML = `<div style="font-weight:900;">${escapeHtml(d.phone)}</div>
+      <div class="muted small">Level ${escapeHtml(String(d.level))} | Trust ${escapeHtml(String(Number(d.trust_score).toFixed(1)))} | ${d.verified?"✅ Verified":"⚪ Unverified"}</div>`;
+      el.appendChild(div);
+    });
+  }catch(e){ el.innerHTML = ""; }
+};
+
+window.loadNews = async ()=>{
+  const el = qs("newsList");
+  if(!el) return;
+  try{
+    const r = await fetch(API + "/api/news");
+    const j = await r.json();
+    const list = j.news || [];
+    if(!list.length){ el.innerHTML = ""; return; }
+    el.innerHTML = `<div class="muted small">📰 News</div>`;
+    list.slice(0,5).forEach(n=>{
+      const div = document.createElement("div");
+      div.className = "glass card";
+      div.innerHTML = `<div style="font-weight:900;">${escapeHtml(n.title)}</div><div class="muted small">${escapeHtml(n.body)}</div>`;
+      el.appendChild(div);
+    });
+  }catch(e){ el.innerHTML = ""; }
+};
+
+window.toggleFavorite = async (driverPhone)=>{
+  const p = getProfile();
+  if(!p) return;
+  try{
+    const r = await fetch(API + "/api/favorites/toggle", {
+      method:"POST", headers:{"Content-Type":"application/json"},
+      body: JSON.stringify({ user_phone: p.phone, driver_phone: driverPhone })
+    });
+    const j = await r.json();
+    if(!r.ok || !j.ok) throw new Error();
+    toast(j.favorite ? "Saved" : "Unsaved");
+    await loadFavorites();
+  }catch(e){ toast("Favorite error", true); }
+};
+
+window.loadFavorites = async ()=>{
+  const el = qs("favoritesList");
+  if(!el) return;
+  const p = getProfile();
+  if(!p){ el.innerHTML=""; return; }
+  try{
+    const r = await fetch(API + `/api/favorites?user_phone=${encodeURIComponent(p.phone)}`);
+    const j = await r.json();
+    const list = j.favorites || [];
+    if(!list.length){ el.innerHTML = ""; return; }
+    el.innerHTML = `<div class="muted small">❤️ Saved drivers</div>`;
+    list.forEach(f=>{
+      const div = document.createElement("div");
+      div.className = "glass card";
+      div.innerHTML = `<div>${escapeHtml(f.driver_phone)}</div>`;
+      el.appendChild(div);
+    });
+  }catch(e){ el.innerHTML=""; }
+};
+
+window.reportAd = async (adId)=>{
+  const p = getProfile();
+  if(!p) return;
+  const reason = prompt("Report sababi?");
+  if(!reason) return;
+  try{
+    const r = await fetch(API + "/api/reports", {
+      method:"POST", headers:{"Content-Type":"application/json"},
+      body: JSON.stringify({ ad_id: adId, reporter_phone: p.phone, reason })
+    });
+    const j = await r.json();
+    if(!r.ok || !j.ok) throw new Error();
+    toast("Report yuborildi");
+  }catch(e){ toast("Report error", true); }
+};
+
+window.loadNotifications = async ()=>{
+  const el = qs("notificationsList");
+  if(!el) return;
+  const p = getProfile();
+  if(!p){ el.innerHTML=""; return; }
+  try{
+    const r = await fetch(API + `/api/notifications?user_phone=${encodeURIComponent(p.phone)}`);
+    const j = await r.json();
+    const list = j.notifications || [];
+    if(!list.length){ el.innerHTML = ""; return; }
+    el.innerHTML = `<div class="muted small">🔔 Notifications</div>`;
+    list.slice(0,10).forEach(n=>{
+      const div = document.createElement("div");
+      div.className = "glass card";
+      div.innerHTML = `<div style="font-weight:900;">${escapeHtml(n.title)}</div><div class="muted small">${escapeHtml(n.body)}</div>`;
+      el.appendChild(div);
+    });
+  }catch(e){ el.innerHTML=""; }
+};
+
+
+
+window.quickShareAd = async (adId, fromPlace, toPlace)=>{
+  const text = `Ingichka Taksi: ${fromPlace} → ${toPlace} | ad:${adId}`;
+  try{
+    if(navigator.share){
+      await navigator.share({ title:"Ingichka Taksi", text });
+    }else{
+      await navigator.clipboard.writeText(text);
+      toast("Link nusxalandi");
+    }
+  }catch(e){}
+};
+
+window.prefillBooking = (driverPhone)=>{
+  const el = qs("book-driver-phone");
+  if(el) el.value = driverPhone || "";
+  openSheet("bookingSheet");
+};
+
+window.createBookingPro = async ()=>{
+  const p = getProfile();
+  if(!p) return toast("Profil kerak", true);
+  const driver_phone = qs("book-driver-phone")?.value.trim();
+  const booking_time = qs("book-time")?.value.trim();
+  const seats = parseInt(qs("book-seats")?.value || "1", 10);
+  if(!driver_phone || !booking_time) return toast("Driver + vaqt kerak", true);
+  try{
+    const r = await fetch(API + "/api/bookings", {
+      method:"POST", headers:{"Content-Type":"application/json"},
+      body: JSON.stringify({ client_phone:p.phone, driver_phone, booking_time, seats })
+    });
+    const j = await r.json();
+    if(!r.ok || !j.ok) throw new Error();
+    toast("Bron yaratildi");
+    closeSheet("bookingSheet");
+    await loadBookingsPro();
+    await loadDriverCalendar();
+  }catch(e){ toast("Bron error", true); }
+};
+
+window.loadBookingsPro = async ()=>{
+  const el = qs("bookingsList");
+  if(!el) return;
+  const p = getProfile();
+  if(!p){ el.innerHTML=""; return; }
+  try{
+    const r = await fetch(API + `/api/bookings?client_phone=${encodeURIComponent(p.phone)}`);
+    const j = await r.json();
+    const list = j.bookings || [];
+    if(!list.length){ el.innerHTML=""; return; }
+    el.innerHTML = `<div class="muted small">⏳ Bronlarim</div>`;
+    list.slice(0,10).forEach(b=>{
+      const d = document.createElement("div"); d.className="glass card";
+      d.innerHTML = `<div style="font-weight:900;">${escapeHtml(b.booking_time)}</div><div class="muted small">Driver: ${escapeHtml(b.driver_phone||'—')} | Seats:${escapeHtml(String(b.seats))}</div>`;
+      el.appendChild(d);
+    });
+  }catch(e){ el.innerHTML=""; }
+};
+
+window.loadDriverCalendar = async ()=>{
+  const el = qs("driverCalendarList");
+  if(!el) return;
+  const p = getProfile();
+  if(!p || p.role!=="driver"){ el.innerHTML=""; return; }
+  try{
+    const r = await fetch(API + `/api/drivers/${encodeURIComponent(p.phone)}/calendar`);
+    const j = await r.json();
+    const list = j.calendar || [];
+    if(!list.length){ el.innerHTML = `<div class="muted small">📅 Calendar bo‘sh</div>`; return; }
+    el.innerHTML = `<div class="muted small">📅 Driver calendar (band vaqtlar)</div>`;
+    list.slice(0,20).forEach(c=>{
+      const d = document.createElement("div"); d.className="glass card";
+      d.innerHTML = `<div>${escapeHtml(c.booking_time)}</div><div class="muted small">Seats:${escapeHtml(String(c.seats))} | ${escapeHtml(c.status)}</div>`;
+      el.appendChild(d);
+    });
+  }catch(e){ el.innerHTML=""; }
+};
+
+window.loadBookingRemindersPreview = async ()=>{
+  try{
+    const r = await fetch(API + "/api/bookings/reminders?within_minutes=30");
+    const j = await r.json();
+    const n = (j.reminders||[]).length;
+    if(n>0) toast(`⏰ ${n} ta bron 30 min ichida. Bot ping worker shu endpointdan oladi.`);
+  }catch(e){}
+};
+
+
+
+window.openMapDirections = async (lat, lng, fromPlace, toPlace)=>{
+  try{
+    const q = new URLSearchParams();
+    if(lat && lng){ q.set("lat", String(lat)); q.set("lng", String(lng)); }
+    q.set("from", fromPlace || "");
+    q.set("to", toPlace || "");
+    const r = await fetch(API + `/api/maps/deeplink?${q.toString()}`);
+    const j = await r.json();
+    if(!r.ok || !j.ok) throw new Error();
+    window.open(j.google, "_blank");
+  }catch(e){ toast("Map deep link error", true); }
+};
+
+window.createSupportTicket = async ()=>{
+  const p = getProfile();
+  if(!p) return toast("Profil kerak", true);
+  const subject = qs("ticket-subject")?.value.trim();
+  const message = qs("ticket-message")?.value.trim();
+  if(!subject || !message) return toast("Mavzu va xabar kiriting", true);
+  try{
+    const r = await fetch(API + "/api/support/tickets", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ user_phone:p.phone, subject, message }) });
+    const j = await r.json();
+    if(!r.ok || !j.ok) throw new Error();
+    toast("🎫 Ticket yuborildi");
+    closeSheet("supportSheet");
+    await loadSupportTickets();
+  }catch(e){ toast("Ticket error", true); }
+};
+
+window.loadSupportTickets = async ()=>{
+  const el = qs("ticketsList");
+  if(!el) return;
+  const p = getProfile();
+  if(!p){ el.innerHTML=""; return; }
+  try{
+    const r = await fetch(API + `/api/support/tickets?user_phone=${encodeURIComponent(p.phone)}`);
+    const j = await r.json();
+    const list = j.tickets || [];
+    if(!list.length){ el.innerHTML=""; return; }
+    el.innerHTML = `<div class="muted small">🎫 Support ticketlarim</div>`;
+    list.slice(0,10).forEach(t=>{
+      const d=document.createElement("div"); d.className="glass card";
+      d.innerHTML = `<div style="font-weight:900;">${escapeHtml(t.subject)}</div><div class="muted small">${escapeHtml(t.message)}</div><div class="muted small">Status: ${escapeHtml(t.status)} ${t.admin_reply?"| Reply: "+escapeHtml(t.admin_reply):""}</div>`;
+      el.appendChild(d);
+    });
+  }catch(e){ el.innerHTML=""; }
+};
+
+window.loadSupportTicketsAdmin = async ()=>{
+  const el = qs("adminTickets");
+  if(!el) return;
+  try{
+    const r = await fetch(API + "/api/support/tickets");
+    const j = await r.json();
+    const list = j.tickets || [];
+    if(!list.length){ el.innerHTML = `<div class="muted small">Ticket yo‘q</div>`; return; }
+    el.innerHTML = "";
+    list.slice(0,20).forEach(t=>{
+      const d=document.createElement("div"); d.className="glass card";
+      d.innerHTML = `<div style="font-weight:900;">${escapeHtml(t.subject)} (${escapeHtml(t.user_phone)})</div><div class="muted small">${escapeHtml(t.message)}</div><div class="row2" style="margin-top:8px;"><input id="ticket-reply-${escapeHtml(t.id)}" placeholder="Admin javobi"/><button class="btn" onclick="replySupportTicket('${escapeJs(t.id)}')">Javob</button></div>`;
+      el.appendChild(d);
+    });
+  }catch(e){ el.innerHTML = `<div class="muted small">Ticket load error</div>`; }
+};
+
+window.replySupportTicket = async (ticketId)=>{
+  const reply = qs(`ticket-reply-${ticketId}`)?.value.trim();
+  if(!reply) return toast("Reply yozing", true);
+  try{
+    const r = await fetch(API + `/api/support/tickets/${ticketId}/reply`, { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ reply, status:"answered" }) });
+    const j = await r.json();
+    if(!r.ok || !j.ok) throw new Error();
+    toast("Ticketga javob yuborildi");
+    await loadSupportTicketsAdmin();
+  }catch(e){ toast("Reply error", true); }
+};
+
+// =================== ORDERS (Ride Request) ===================
+function orderStatusLabel(st){
+  const map = {
+    pending:"⏳ pending",
+    accepted:"✅ accepted",
+    on_the_way:"🚕 on the way",
+    done:"🏁 done",
+    canceled:"❌ canceled"
+  };
+  return map[st] || st;
+}
+
+window.createOrder = async ()=>{
+  const p = getProfile();
+  if(!p) return toast("Profil kerak", true);
+
+  const from = qs("ord-from")?.value.trim();
+  const to = qs("ord-to")?.value.trim();
+  const ride_time = qs("ord-time")?.value.trim();
+  const people_count = parseInt(qs("ord-people")?.value || "1", 10);
+  const note = qs("ord-note")?.value.trim() || "";
+
+  if(!from || !to || !ride_time || !people_count){
+    return toast("Marshrut + vaqt + odam soni kerak", true);
+  }
+
+  try{
+    const r = await fetch(API + "/api/orders", {
+      method:"POST",
+      headers:{"Content-Type":"application/json"},
+      body: JSON.stringify({
+        client_phone: p.phone,
+        client_name: p.name || "",
+        from, to, ride_time, people_count, note
+      })
+    });
+    const j = await r.json();
+    if(!r.ok || !j.ok) throw new Error("order_create_fail");
+
+    toast("📦 Buyurtma yuborildi");
+    closeSheet("createOrderSheet");
+    ["ord-from","ord-to","ord-time","ord-people","ord-note"].forEach(id=>{ if(qs(id)) qs(id).value=""; });
+    await loadOrders();
+  }catch(e){
+    toast("Buyurtma xatolik", true);
+  }
+};
+
+window.loadOrders = async ()=>{
+  const listEl = qs("ordersList");
+  if(!listEl) return;
+  const p = getProfile();
+  if(!p){ listEl.innerHTML = ""; return; }
+
+  const role = p.role === "driver" ? "driver" : "client";
+  listEl.innerHTML = `<div class="skeleton glass"></div>`;
+
+  try{
+    const res = await fetch(API + `/api/orders?role=${encodeURIComponent(role)}&phone=${encodeURIComponent(p.phone||"")}`);
+    const data = await res.json();
+    const orders = Array.isArray(data) ? data : [];
+
+    if(!orders.length){
+      listEl.innerHTML = `<div class="glass card"><div class="muted">Buyurtmalar yo‘q</div></div>`;
+      return;
+    }
+
+    listEl.innerHTML = "";
+    orders.slice(0, 20).forEach(o=>{
+      const card = document.createElement("div");
+      card.className = "glass card";
+      const mineClient = o.client_phone === p.phone;
+      const mineDriver = o.driver_phone === p.phone;
+
+      let actions = "";
+      if(role === "driver" && o.status === "pending"){
+        actions = `
+          <div class="row2" style="margin-top:8px;">
+            <button class="btn" onclick="respondOrder('${o.id}','accept')">Qabul</button>
+            <button class="btn danger" onclick="respondOrder('${o.id}','reject')">Rad</button>
+          </div>
+          <div class="row2" style="margin-top:8px;">
+            <input id="offer-${o.id}" placeholder="Taklif narx" />
+            <input id="reject-${o.id}" placeholder="Rad sababi" />
+          </div>`;
+      }
+
+      if((mineClient || mineDriver) && ["accepted","on_the_way"].includes(o.status)){
+        actions += `
+          <div class="row2" style="margin-top:8px;">
+            <button class="btn" onclick="setOrderStatus('${o.id}','on_the_way')">On the way</button>
+            <button class="btn primary" onclick="setOrderStatus('${o.id}','done')">Done</button>
+          </div>`;
+      }
+
+      if(["pending","accepted","on_the_way"].includes(o.status) && (mineClient || mineDriver)){
+        actions += `
+          <div class="row2" style="margin-top:8px;">
+            <input id="cancel-${o.id}" placeholder="Cancel sababi" />
+            <button class="btn danger" onclick="cancelOrder('${o.id}')">Cancel</button>
+          </div>`;
+      }
+
+      card.innerHTML = `
+        <div style="font-weight:900;">Order ID: ${escapeHtml(o.id)}</div>
+        <div class="muted small">${escapeHtml(o.from)} → ${escapeHtml(o.to)}</div>
+        <div class="muted small">🕒 ${escapeHtml(o.ride_time)} | 👥 ${escapeHtml(String(o.people_count))}</div>
+        <div class="muted small">Holati: ${escapeHtml(orderStatusLabel(o.status))}</div>
+        <div class="muted small">Mijoz: ${escapeHtml(o.client_phone || '—')} | Driver: ${escapeHtml(o.driver_phone || '—')}</div>
+        <div class="muted small">Taklif narx: ${escapeHtml(o.offer_price || '—')}</div>
+        ${o.cancel_reason ? `<div class="muted small">Cancel sababi: ${escapeHtml(o.cancel_reason)}</div>` : ''}
+        ${actions}
+      `;
+      listEl.appendChild(card);
+    });
+  }catch(e){
+    listEl.innerHTML = `<div class="glass card"><div class="muted">Order load error</div></div>`;
+  }
+};
+
+window.respondOrder = async (orderId, action)=>{
+  const p = getProfile();
+  if(!p) return;
+  const offer_price = qs(`offer-${orderId}`)?.value.trim() || "";
+  const reason = qs(`reject-${orderId}`)?.value.trim() || "";
+
+  try{
+    const r = await fetch(API + `/api/orders/${orderId}/respond`, {
+      method:"POST",
+      headers:{"Content-Type":"application/json"},
+      body: JSON.stringify({ driver_phone: p.phone, action, offer_price, reason })
+    });
+    const j = await r.json();
+    if(!r.ok || !j.ok) throw new Error("respond_fail");
+    toast(action === "accept" ? "✅ Qabul qilindi" : "⛔ Rad etildi");
+    await loadOrders();
+  }catch(e){
+    toast("Order javob xatolik", true);
+  }
+};
+
+window.setOrderStatus = async (orderId, status)=>{
+  const p = getProfile();
+  if(!p) return;
+  try{
+    const r = await fetch(API + `/api/orders/${orderId}/status`, {
+      method:"POST",
+      headers:{"Content-Type":"application/json"},
+      body: JSON.stringify({ actor_phone: p.phone, status })
+    });
+    const j = await r.json();
+    if(!r.ok || !j.ok) throw new Error("status_fail");
+    toast("Order holati yangilandi");
+    await loadOrders();
+  }catch(e){
+    toast("Status xatolik", true);
+  }
+};
+
+window.cancelOrder = async (orderId)=>{
+  const p = getProfile();
+  if(!p) return;
+  const reason = qs(`cancel-${orderId}`)?.value.trim();
+  if(!reason) return toast("Cancel sababi kiriting", true);
+
+  try{
+    const r = await fetch(API + `/api/orders/${orderId}/cancel`, {
+      method:"POST",
+      headers:{"Content-Type":"application/json"},
+      body: JSON.stringify({ actor_phone: p.phone, reason })
+    });
+    const j = await r.json();
+    if(!r.ok || !j.ok) throw new Error("cancel_fail");
+    toast("Order cancel qilindi");
+    await loadOrders();
+  }catch(e){
+    toast("Cancel xatolik", true);
+  }
+};
+
 // =================== ADMIN ===================
 const ADMIN_TELEGRAM_ID = "6813692852";
 function checkAdmin(){
   const btn = document.querySelector(".admin-only");
   if(!btn) return;
 
   const tgId = (window.Telegram && Telegram.WebApp && Telegram.WebApp.initDataUnsafe?.user?.id)
     ? String(Telegram.WebApp.initDataUnsafe.user.id)
     : "";
 
   if(tgId && tgId === ADMIN_TELEGRAM_ID){
     btn.style.display = "flex";
   }else{
     btn.style.display = "none";
   }
 }
 
 window.adminRefresh = async ()=>{
   try{
-    const res = await fetch(API + "/api/admin/analytics");
-    const data = await res.json();
-    qs("adminStats").innerText = `Ads: ${data.ads} | Users: ${data.users} | Likes: ${data.likes}`;
+    const [aRes, mRes, oRes, xRes] = await Promise.all([
+      fetch(API + "/api/admin/analytics"),
+      fetch(API + "/api/admin/monetization"),
+      fetch(API + "/api/orders/stats"),
+      fetch(API + "/api/admin/ops-analytics")
+    ]);
+    const a = await aRes.json();
+    const m = await mRes.json();
+    const o = await oRes.json();
+    const x = await xRes.json();
+
+    const d = m.driver_of_week;
+    const deal = m.daily_deal;
+    const driverLine = d ? ` | DoW: ${d.phone} (${d.points}pt)` : " | DoW: —";
+    const dealLine = deal ? ` | Deal: ${deal.title}` : " | Deal: —";
+
+    const os = o.stats || {};
+    const topCancel = (os.cancel_reasons && os.cancel_reasons[0]) ? `${os.cancel_reasons[0].reason} (${os.cancel_reasons[0].count})` : "—";
+
+    qs("adminStats").innerText =
+      `Ads: ${a.ads} | Users: ${a.users} | Likes: ${a.likes} | Views: ${a.views}` +
+      ` | VIP: ${m.vip_active} | Boost: ${m.boost_active} | Promo: ${m.promo_active}` +
+      ` | Donate: ${moneyPretty(m.donations_total)} so'm` +
+      ` | Orders: ${os.total||0} (cancel:${os.canceled||0}, done:${os.done||0})` +
+      ` | CancelTop: ${topCancel}` + driverLine + dealLine;
+
+    const xa = x.analytics || {};
+    const topRoute = (xa.top_routes && xa.top_routes[0]) ? `${xa.top_routes[0].from}→${xa.top_routes[0].to} (${xa.top_routes[0].count})` : "—";
+    const topDriver = (xa.top_drivers && xa.top_drivers[0]) ? `${xa.top_drivers[0].phone} (${xa.top_drivers[0].points})` : "—";
+    qs("opsAnalytics").innerText = `Ops: topRoute=${topRoute} | topDriver=${topDriver} | cancelRate=${xa.cancellation_rate||0}% | hiddenAds=${xa.hidden_ads||0} | openTickets=${xa.open_tickets||0}`;
   }catch(e){
     qs("adminStats").innerText = "Error";
   }
 };
 
+window.adminGrantVip = async ()=>{
+  const phone = qs("vip-phone")?.value.trim();
+  const days = parseInt(qs("vip-days")?.value || "30", 10);
+  if(!phone) return toast("Phone kerak", true);
+  try{
+    const r = await fetch(API + "/api/admin/vip/grant", {
+      method:"POST",
+      headers:{"Content-Type":"application/json"},
+      body: JSON.stringify({ phone, days })
+    });
+    const j = await r.json();
+    if(!r.ok || !j.ok) throw new Error("vip_fail");
+    toast("💎 VIP berildi");
+    await adminRefresh();
+  }catch(e){
+    toast("VIP error", true);
+  }
+};
+
+window.adminBoostAd = async ()=>{
+  const ad_id = qs("boost-ad-id")?.value.trim();
+  const days = parseInt(qs("boost-days")?.value || "7", 10);
+  if(!ad_id) return toast("Ad ID kerak", true);
+  try{
+    const r = await fetch(API + "/api/admin/boost", {
+      method:"POST",
+      headers:{"Content-Type":"application/json"},
+      body: JSON.stringify({ ad_id, days })
+    });
+    const j = await r.json();
+    if(!r.ok || !j.ok) throw new Error("boost_fail");
+    toast("📢 Boost yoqildi");
+    await adminRefresh();
+  }catch(e){
+    toast("Boost error", true);
+  }
+};
+
+window.adminCreatePromo = async ()=>{
+  const code = qs("promo-code")?.value.trim();
+  const discount_percent = parseInt(qs("promo-discount")?.value || "10", 10);
+  const max_uses = parseInt(qs("promo-uses")?.value || "1", 10);
+  if(!code) return toast("Promo code kerak", true);
+  try{
+    const r = await fetch(API + "/api/admin/promo", {
+      method:"POST",
+      headers:{"Content-Type":"application/json"},
+      body: JSON.stringify({ code, discount_percent, max_uses })
+    });
+    const j = await r.json();
+    if(!r.ok || !j.ok) throw new Error("promo_fail");
+    toast("🎟 Promo yaratildi");
+    await adminRefresh();
+  }catch(e){
+    toast("Promo error", true);
+  }
+};
+
+window.adminSetDailyDeal = async ()=>{
+  const title = qs("deal-title")?.value.trim();
+  const body = qs("deal-body")?.value.trim();
+  if(!title || !body) return toast("Deal title/body kerak", true);
+  try{
+    const r = await fetch(API + "/api/admin/daily-deal", {
+      method:"POST",
+      headers:{"Content-Type":"application/json"},
+      body: JSON.stringify({ title, body })
+    });
+    const j = await r.json();
+    if(!r.ok || !j.ok) throw new Error("deal_fail");
+    toast("🔥 Daily deal saqlandi");
+    await adminRefresh();
+  }catch(e){
+    toast("Deal error", true);
+  }
+};
+
+window.sendDonate = async ()=>{
+  const phone = qs("donate-phone")?.value.trim() || (getProfile()?.phone || "");
+  const amount = parseFloat(qs("donate-amount")?.value || "0");
+  if(amount <= 0) return toast("Donate miqdori noto‘g‘ri", true);
+  try{
+    const r = await fetch(API + "/api/donate", {
+      method:"POST",
+      headers:{"Content-Type":"application/json"},
+      body: JSON.stringify({ phone, amount })
+    });
+    const j = await r.json();
+    if(!r.ok || !j.ok) throw new Error("donate_fail");
+    toast("💰 Donate yuborildi");
+    closeSheet("donateSheet");
+    await adminRefresh();
+  }catch(e){
+    toast("Donate error", true);
+  }
+};
+
+window.applyPromoCode = async ()=>{
+  const code = qs("promo-apply-code")?.value.trim();
+  if(!code) return toast("Promo code kiriting", true);
+  try{
+    const r = await fetch(API + "/api/promo/apply", {
+      method:"POST",
+      headers:{"Content-Type":"application/json"},
+      body: JSON.stringify({ code })
+    });
+    const j = await r.json();
+    if(!r.ok || !j.ok) throw new Error("promo_apply_fail");
+    toast(`🎟 -${j.promo.discount_percent}% qo‘llandi`);
+    closeSheet("promoApplySheet");
+  }catch(e){
+    toast("Promo invalid yoki tugagan", true);
+  }
+};
+
+
+window.adminPostNews = async ()=>{
+  const title = qs("adminNewsTitle")?.value.trim();
+  const body = qs("adminNewsBody")?.value.trim();
+  if(!title || !body) return toast("News title/body kerak", true);
+  try{
+    const r = await fetch(API + "/api/admin/news", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ title, body }) });
+    const j = await r.json();
+    if(!r.ok || !j.ok) throw new Error();
+    toast("News post qilindi");
+    await loadNews();
+  }catch(e){ toast("News error", true); }
+};
+
+window.adminVerifyDriver = async (verified)=>{
+  const phone = qs("verify-phone")?.value.trim();
+  if(!phone) return toast("Driver phone kerak", true);
+  try{
+    const r = await fetch(API + `/api/admin/drivers/${encodeURIComponent(phone)}/verify`, { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ verified }) });
+    const j = await r.json();
+    if(!r.ok || !j.ok) throw new Error();
+    toast(verified ? "Driver verified" : "Driver unverified");
+    await loadTopDrivers();
+  }catch(e){ toast("Verify error", true); }
+};
+
 window.adminClearAll = async ()=>{
-  toast("Admin clear: backend needed", true);
+  toast("Clear ALL xavfsizlik sabab o‘chirildi", true);
 };
 
 window.adminUploadBanner = async ()=>{
-  toast("Banner upload backend next", true);
+  toast("Daily Deal banner orqali boshqariladi ✅");
 };
 
+
+function animateLoadingSequence(){
+  const steps = [
+    { pct: 18, text: 'INIT CORE', sub: 'created by <b>711 GROUP</b> · preparing liquid UI' },
+    { pct: 42, text: 'SYNC TELEGRAM', sub: 'secure WebApp session va theme sync' },
+    { pct: 68, text: 'FETCH FEED', sub: 'ads, support, orders va live data yuklanmoqda' },
+    { pct: 100, text: 'READY', sub: 'premium glass tajribasi tayyor ✅' }
+  ];
+  const textEl = qs('loadingText');
+  const subEl = qs('loadingSub');
+  const barEl = qs('loadingBar');
+  steps.forEach((step, idx)=>{
+    setTimeout(()=>{
+      if(textEl) textEl.textContent = step.text;
+      if(subEl) subEl.innerHTML = step.sub;
+      if(barEl) barEl.style.width = `${step.pct}%`;
+    }, idx * 190);
+  });
+}
+
+async function registerServiceWorker(){
+  if(!('serviceWorker' in navigator)) return;
+  try{
+    await navigator.serviceWorker.register('./sw.js');
+    console.log('SW registered');
+  }catch(e){
+    console.warn('SW register failed', e);
+  }
+}
+
 // =================== BOOT ===================
 document.addEventListener("DOMContentLoaded", async ()=>{
   applyTheme();
 
   // Telegram init
   try{
     if(window.Telegram && Telegram.WebApp){
       Telegram.WebApp.ready();
       Telegram.WebApp.expand();
+      TG_UI.expanded = true;
+      syncTelegramTheme();
+
+      Telegram.WebApp.BackButton.onClick(()=>{
+        const opened = document.querySelector('.sheet-wrap.open');
+        if(opened){
+          opened.classList.remove('open');
+          updateTelegramBackButton();
+          updateTelegramMainButton();
+          return;
+        }
+        if(document.querySelector('#screen-map.active')) return nav('home');
+        if(document.querySelector('#screen-profile-view.active')) return nav('home');
+        if(document.querySelector('#screen-admin.active')) return nav('home');
+      });
+
+      Telegram.WebApp.onEvent('themeChanged', ()=>{
+        syncTelegramTheme();
+        applyTheme();
+      });
+      Telegram.WebApp.onEvent('viewportChanged', ()=>{
+        TG_UI.expanded = !!Telegram.WebApp.isExpanded;
+      });
     }
   }catch(e){}
 
+  await verifyTelegramAuth();
+  await registerServiceWorker();
+
   // loading
-  setTimeout(()=> qs("loading")?.classList.remove("active"), 700);
+  animateLoadingSequence();
+  setTimeout(()=> qs("loading")?.classList.remove("active"), 920);
 
   initToggles();
   checkAdmin();
 
   // init start screen
   const role = localStorage.getItem("role");
   const profile = getProfile();
 
   if(!role){
     showScreen("screen-role");
   }else if(!profile){
     showScreen("screen-profile");
     updateProfileUIRole();
   }else{
     showScreen("screen-home");
     await loadAds();
+    await loadOrders();
+    await loadTopDrivers();
+    await loadNews();
+    await loadFavorites();
+    await loadNotifications();
+    await loadSupportTickets();
+    await loadBookingsPro();
+    await loadDriverCalendar();
+    await loadBookingRemindersPreview();
     await renderProfileView();
     renderCarGallery();
   }
 });
