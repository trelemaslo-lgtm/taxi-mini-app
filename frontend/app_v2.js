const tg = window.Telegram.WebApp;
tg.expand();

const API = "http://IP_BACKEND:10000";

const adsBox = document.getElementById("ads");
const btnDrivers = document.getElementById("btnDrivers");
const btnClients = document.getElementById("btnClients");
const loader = document.getElementById("loader");

let currentTab = "driver";
let userLat = null, userLon = null;

btnDrivers.onclick = ()=>switchTab("driver");
btnClients.onclick = ()=>switchTab("client");

// Загружаем объявления СРАЗУ
loadAds();

// Пытаемся получить геолокацию (необязательно)
if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(
    pos => {
      userLat = pos.coords.latitude;
      userLon = pos.coords.longitude;
      loadAds(); // перезагрузка с дистанцией
    },
    err => {
      console.log("Геолокация не получена");
    }
  );
}


function switchTab(role){
  currentTab = role;
  btnDrivers.classList.toggle("active", role==="driver");
  btnClients.classList.toggle("active", role==="client");
  loadAds();
}

function loadAds(){
  let url = API + "/api/ads";
  if (userLat) url += `?lat=${userLat}&lon=${userLon}`;

  fetch(url).then(r=>r.json()).then(data=>{
    adsBox.innerHTML="";
    data.filter(a=>a.role===currentTab).forEach(a=>{
      const d=document.createElement("div");
      d.className="glass card";
      d.innerHTML=`
        <b>${a.name}</b> 🏆 ${a.points}<br>
        <small>${a.route}</small><br>
        ${a.distance?`📍 ${a.distance} км<br>`:""}
        💰 ${a.price} | 👥 ${a.seats}<br>
        <button class="like" onclick="like(${a.id},this)">👍</button>
        <a href="tel:${a.phone}">📞</a>
      `;
      adsBox.appendChild(d);
    });

    setTimeout(()=>{
      loader.style.opacity="0";
      setTimeout(()=>loader.style.display="none",400);
    },300);
  });
}

function openForm(){ formOverlay.classList.remove("hidden"); }
function closeForm(){ formOverlay.classList.add("hidden"); }

function sendAd(){
  fetch(API+"/api/ads",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({
      role:role.value,
      name:name.value,
      phone:phone.value,
      route:route.value,
      mode:mode.value,
      price:price.value,
      seats:seats.value,
      comment:comment.value,
      lat:userLat,
      lon:userLon
    })
  }).then(()=>{
    closeForm();
    loadAds();
  });
}

function like(id,btn){
  btn.classList.add("liked");
  fetch(API+"/api/like",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({
      ad_id:id,
      user_id:tg.initDataUnsafe.user.id
    })
  }).then(()=>setTimeout(()=>btn.classList.remove("liked"),200));
}

loadAds();
