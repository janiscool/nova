/* NOVA · website JS — stars, history timeline (no overlapping planes), features, currency, buy */
(function(){
'use strict';
const $=s=>document.querySelector(s), $$=s=>Array.from(document.querySelectorAll(s));
/* ---------- stars ---------- */ 
(function(){const c=$('#stars'),x=c.getContext('2d');let W,H;function rs(){W=c.width=innerWidth;H=c.height=innerHeight}rs();addEventListener('resize',rs);
const S=Array.from({length:110},()=>({x:Math.random()*W,y:Math.random()*H,r:Math.random()*1.4+.2,tw:Math.random()*6.28}));
let t=0;function dr(){t+=.016;x.clearRect(0,0,W,H);for(const s of S){const a=.4+.6*Math.abs(Math.sin(s.tw+t));x.globalAlpha=a;x.fillStyle='#cfe2ff';x.beginPath();x.arc(s.x,s.y,s.r,0,7);x.fill()}requestAnimationFrame(dr)}dr();})();
/* ---------- config load ---------- */
let CFG={pricing:{regular:4.99,discount_pct:20,one_time:false},currencies:{EUR:{symbol:'\u20ac',flag:'',label:'Euro'},USD:{symbol:'$',flag:'',label:'US Dollar'},GBP:{symbol:'\u00a3',flag:'',label:'Pound'}},history:[]};
(async()=>{try{const r=await fetch('config.json',{cache:'no-store'});if(r.ok)CFG=await r.json()}catch{}renderAll();})();
/* ---------- currency ---------- */
const curStored=localStorage.getItem('nova_cur')||'AUTO';
let cur=curStored==='AUTO'?detect():curStored;
function detect(){const l=(navigator.language||'').toLowerCase(),z=(Intl.DateTimeFormat().resolvedOptions().timeZone||'');if(z.indexOf('Europe')===0||l.indexOf('nl')===0)return 'EUR';if(z.indexOf('America')===0||l.indexOf('en-us')===0)return 'USD';if(z.indexOf('Europe/London')===0||l.indexOf('en-gb')===0)return 'GBP';return 'EUR'}
function sym(c){return (CFG.currencies[c]||{}).symbol||(c==='USD'?'$':c==='GBP'?'\u00a3':'\u20ac')}
const RATE={EUR:1,USD:1.09,GBP:0.85};
function fmt(n,c){return sym(c)+n.toFixed(2)}
function setCur(c){cur=c;localStorage.setItem('nova_cur',c);renderPrice()}
/* ---------- planet history timeline (never overlapping) ---------- */
let planes=[];
function planeSvg(n){const p=planes.find(q=>q.n===n);return p?p.svg:''}
function renderHist(){
  const box=$('#hist');if(!box)return;
  box.innerHTML=CFG.history.map(h=>`<div class="plane-card ${h.now?'now':''}"><div class="plane-ic">${h.svg||''}</div><div class="yr">${h.y}</div><h3>${h.n}</h3><p>${h.t}</p></div>`).join('');
}
/* ---------- features ---------- */
const FEATS=[['Live VATSIM traffic','See every aircraft in the sky around you, updated in real time, with type, callsign, altitude and livery.','\u2708'],['Live weather & wind','METAR, TAF, radar and live wind for your origin, destination — and everywhere in between.','\u2601'],['Wind-optimal routes','NOVA reads the wind and plans the route that actually beats it — not the one a 1994 planner guessed.','\u21c4'],['SID / STAR & approach','Procedures, charts and approach plates at your fingertips, pulled from live data.','\u29bf'],['AI copilot','Ask anything: “is my fuel enough?”, “what’s the wind at cruise?”, “is this route safe?” It answers.','\u2726'],['Exports that work','.pln / .fms / CSV / SimBrief — hand your plan to anything that flies.','\u2797']];
function renderFeat(){const g=$('#feats');if(!g)return;g.innerHTML=FEATS.map(f=>`<div class="feat"><div class="fi">${f[2]}</div><h3>${f[0]}</h3><p>${f[1]}</p></div>`).join('')}
/* ---------- pricing ---------- */
let PR=CFG.pricing;
function renderPrice(){
  const w=$('#priceWrap');if(!w)return;
  const reg=PR.regular, dis=PR.discount_pct/100, now=reg*(1-dis);
  const eur=PR.currency==='USD'||PR.currency==='GBP'?PR.regular:PR.regular; /* always EUR base in config */
  const baseC=PR.currency||'EUR';
  w.innerHTML=`
    <div class="panel plan pro">
      <div class="plan-head"><div class="ph-name">NOVA <b>PRO</b></div><span class="off-badge">${PR.launch_off?PR.launch_off:'20% OFF LAUNCH'}</span></div>
      <p class="plan-lede">Monthly subscription. Cancel anytime. Keep the app forever.</p>
      <div class="price"><span class="old">${fmt(PR.currency==='EUR'?4.99:reg,cur)}</span><span class="big">${fmt(now,cur)}</span><span class="save">SAVE ${Math.round(dis*100)}%</span></div></div>
      <p class="plan-note">Beta v1 — more versions, profiles + charts land soon. Solo project by Jan Wijker, 18 · janwijker13@gmail.com</p>
      <div class="pay-row">
        <a class="btn primary paypal" href="#" id="pay">PayPal · Monthly ${fmt(now,cur)}</a>
        <a class="btn primary ideal" href="#" id="idb">iDEAL (#Wero) · Monthly ${fmt(now,cur)}<span class="soon">SOON</span></a>
      </div>
      <p class="tiny">PayPal for everyone · iDEAL/#Wero for NL. Secure, handled outside the app.</p>
    </div>`;
  $('#pay').onclick=e=>{e.preventDefault();buy('paypal')};
  $('#idb').onclick=e=>{e.preventDefault();buy('ideal')};
}
function buy(kind){const c=CFG.payments||{};const u=(kind==='ideal'?c.ideal_url:c.paypal_url);if(u){openInNew(u);return}toast(kind==='ideal'||kind==='wero'?'#Wero (iDEAL) is coming soon — right now PayPal is the only way to pay.':'Pay with PayPal — #Wero (iDEAL) arrives soon.')}
function openInNew(u){const w=window.open(u,'_blank','noopener');if(!w)location.href=u}
function toast(m){let t=$('#toast');if(!t){t=document.createElement('div');t.id='toast';document.body.appendChild(t)}t.textContent=m;t.classList.add('on');clearTimeout(t._h);t._h=setTimeout(()=>t.classList.remove('on'),3200)}
/* ---------- currency button + menu ---------- */
function renderCur(){const b=$('#curBtn');if(!b)return;b.textContent=sym(cur)+' '+cur;const m=$('#curMenu');b.onclick=e=>{e.stopPropagation();m.classList.toggle('open')};document.addEventListener('click',()=>m.classList.remove('open'));$$('#curMenu button').forEach(x=>x.onclick=()=>{setCur(x.dataset.c);b.textContent=sym(cur)+' '+cur;m.classList.remove('open')})}
/* ---------- all render ---------- */
function renderAll(){renderHist();renderFeat();renderPrice();renderCur()}
})();
