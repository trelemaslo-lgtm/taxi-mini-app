const API = "https://taxi-backend-5kl2.onrender.com"; // ← ВСТАВЬ СВОЙ BACKEND URL
const ADMIN_ID = 6813692852; // ← ТВОЙ TELEGRAM ID
const DONATE_URL = "https://your-payment-link";

const tg = Telegram.WebApp;
tg.expand();

let currentTab = "driver";
let userLocation = null;
let likes = JSON.parse(localStorage.getItem("likes") || "{}");

document.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
    loader.classList.add("hidden");
    app.classList.remove("hidden");
    loadAds();
  }, 1000);

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(pos => {
      userLocation = {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude
      };
    });
  }

  const tgId = tg.initDataUnsafe?.user?.id;
  if (tgId === ADMIN_ID) {
    document.getElementById("admin-btn").style.display = "block";
  }
});

function switchTab(tab) {
  currentTab = tab;
  loadAds();
}

function getDistanceKm(lat1,lng1,lat2,lng2){
  const R=6371;
  const dLat=(lat2-lat1)*Math.PI/180;
  const dLng=(lng2-lng1)*Math.PI/180;
  const a=Math.sin(dLat/2)**2+
    Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*
    Math.sin(dLng/2)**2;
  return R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));
}

function loadAds() {
  fetch(API+"/api/ads")
    .then(r=>r.json())
    .then(data=>{
      let list=data.filter(a=>a.role===currentTab);
      if(userLocation){
        list=list.map(a=>{
          if(a.lat&&a.lng){
            a.distance=getDistanceKm(userLocation.lat,userLocation.lng,a.lat,a.lng);
          }
          return a;
        }).sort((a,b)=>(a.distance||999)-(b.distance||999));
      }
      ads.innerHTML="";
      list.forEach(a=>{
        const card=document.createElement("div");
        card.className="card glass";
        card.innerHTML=`
          <b>${a.route}</b><br>
          💰 ${a.price}<br>
          🪑 ${a.seats}<br>
          ${a.distance?`📍 ${a.distance.toFixed(1)} км<br>`:""}
          ❤️ ${(likes[a.phone]||0)}
          <button onclick="like('${a.phone}')">❤️</button>
          <br><a href="tel:${a.phone}">📞 ${a.phone}</a>
        `;
        ads.appendChild(card);
      });
    });
}

function like(phone){
  likes[phone]=(likes[phone]||0)+1;
  localStorage.setItem("likes",JSON.stringify(likes));
  loadAds();
}

function openForm(){ form.classList.remove("hidden"); }
function closeForm(){ form.classList.add("hidden"); }

function publishAd(){
  fetch(API+"/api/ads",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({
      role:role.value,
      route:route.value,
      time:time.value,
      seats:seats.value,
      price:price.value,
      phone:phone.value,
      comment:comment.value,
      lat:userLocation?.lat,
      lng:userLocation?.lng
    })
  }).then(()=>{ closeForm(); loadAds(); });
}

function openProfile(){
  p-info.innerText="Профиль активен";
  profile.classList.remove("hidden");
}
function closeProfile(){ profile.classList.add("hidden"); }

function openSettings(){ settings.classList.remove("hidden"); }
function closeSettings(){ settings.classList.add("hidden"); }

function openDonate(){ donate.classList.remove("hidden"); }
function closeDonate(){ donate.classList.add("hidden"); }

function donate(amount){
  fetch(API+"/api/stats/donate",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({amount})});
  window.open(DONATE_URL,"_blank");
}

function openAdmin(){
  admin.classList.remove("hidden");
  fetch(API+"/api/ads").then(r=>r.json()).then(data=>{
    admin-ads.innerHTML="";
    data.forEach(a=>{
      const el=document.createElement("div");
      el.className="glass";
      el.innerHTML=`${a.route}
        <button onclick="delAd(${a.id})">🗑</button>`;
      admin-ads.appendChild(el);
    });
  });
}
function closeAdmin(){ admin.classList.add("hidden"); }
function delAd(id){
  fetch(`${API}/api/admin/ad/${id}?admin_id=${ADMIN_ID}`,{method:"DELETE"})
    .then(()=>openAdmin());
}

