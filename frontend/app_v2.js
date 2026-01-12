const API = "https://taxi-backend-5kl2.onrender.com";
const tg = window.Telegram.WebApp;
tg.expand();

let user = { lang:null, name:null, phone:null, role:null };
let currentTab = "driver";
let points = {}; // local likes

function show(id){
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

/* Loading */
setTimeout(()=>show("screen-lang"),1200);

/* Steps */
function setLang(l){ user.lang=l; show("screen-profile-input"); }
function saveProfile(){
  user.name = name.value;
  user.phone = phone.value;
  show("screen-role");
}
function setRole(r){ user.role=r; show("screen-main"); loadAds(); }

/* Navigation */
function goMain(){ show("screen-main"); }
function goAds(){ show("screen-main"); }
function goProfile(){
  p-name.innerText=user.name;
  p-phone.innerText=user.phone;
  p-role.innerText=user.role;
  p-points.innerText = points[user.phone]||0;
  show("screen-profile-view");
}
function goSettings(){ show("screen-settings"); }
function openForm(){ show("screen-form"); }

/* Tabs */
function switchTab(t){ currentTab=t; loadAds(); }

/* Load ads */
function loadAds(){
  const box = ads;
  box.innerHTML = `<div class="skeleton"></div><div class="skeleton"></div>`;

  fetch(API+"/api/ads")
    .then(r=>r.json())
    .then(data=>{
      box.innerHTML="";
      data.filter(a=>a.role===currentTab).forEach(a=>{
        const card=document.createElement("div");
        card.className="glass card";
        const p = points[a.phone]||0;
        card.innerHTML=`
          <b>${a.route}</b><br>
          💰 ${a.price} | 👥 ${a.seats}<br>
          <a href="tel:${a.phone}">📞 ${a.phone}</a>
          <div class="like">
            <button onclick="like('${a.phone}')">
              <svg width="16" height="16"><use href="#icon-heart"/></svg>
            </button>
            <span>${p}</span>
          </div>
        `;
        box.appendChild(card);
      });
      if(!box.innerHTML) box.innerHTML="<p>Нет объявлений</p>";
    });
}

/* Like */
function like(phone){
  points[phone]=(points[phone]||0)+1;
  loadAds();
}

/* Publish */
function publishAd(){
  fetch(API+"/api/ads",{
    method:"POST",
    headers:{ "Content-Type":"application/json" },
    body:JSON.stringify({
      role:user.role,
      route:route.value,
      price:price.value,
      seats:seats.value,
      phone:user.phone,
      mode:mode.value,
      car:car.value,
      comment:comment.value
    })
  }).then(()=>{ goMain(); loadAds(); });
}

