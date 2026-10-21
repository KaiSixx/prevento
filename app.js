const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const yr=$('#yr'); if(yr) yr.textContent=new Date().getFullYear();

/* nav + progress (podstrony wewnętrzne mają nav zawsze jasny) */
const nav=$('#nav'), prog=$('#progress'), inner=document.body.dataset.inner==='1';
function onScroll(){
  nav.classList.toggle('solid',inner||scrollY>40);
  const h=document.documentElement;
  prog.style.width=(scrollY/Math.max(1,h.scrollHeight-h.clientHeight)*100)+'%';
}
addEventListener('scroll',onScroll,{passive:true});onScroll();
const burger=$('#burger'), menu=$('#menu');
burger.onclick=()=>{const o=menu.classList.toggle('open');burger.setAttribute('aria-expanded',o);nav.classList.toggle('menu-open',o)};
$$('#menu a').forEach(a=>a.addEventListener('click',()=>{menu.classList.remove('open');nav.classList.remove('menu-open');burger.setAttribute('aria-expanded',false)}));

/* reveal */
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.12});
$$('.rv').forEach((el,i)=>{el.style.transitionDelay=(i%3)*90+'ms';io.observe(el)});

/* card spotlight */
$$('.card').forEach(c=>c.addEventListener('pointermove',e=>{const r=c.getBoundingClientRect();c.style.setProperty('--mx',e.clientX-r.left+'px');c.style.setProperty('--my',e.clientY-r.top+'px')}));

/* hero particles: connected network */
if($('#bg')) (function(){
  const cv=$('#bg'), ctx=cv.getContext('2d');
  let W,H,pts=[],mouse={x:-999,y:-999};
  function size(){const d=Math.min(devicePixelRatio||1,2);W=cv.clientWidth;H=cv.clientHeight;cv.width=W*d;cv.height=H*d;ctx.setTransform(d,0,0,d,0,0);
    pts=Array.from({length:Math.round(W*H/16000)},()=>({x:Math.random()*W,y:Math.random()*H,vx:(Math.random()-.5)*.35,vy:(Math.random()-.5)*.35}))}
  size();addEventListener('resize',size);
  cv.parentElement.addEventListener('pointermove',e=>{const r=cv.getBoundingClientRect();mouse.x=e.clientX-r.left;mouse.y=e.clientY-r.top});
  (function loop(){
    ctx.clearRect(0,0,W,H);
    for(const p of pts){
      p.x+=p.vx;p.y+=p.vy;if(p.x<0||p.x>W)p.vx*=-1;if(p.y<0||p.y>H)p.vy*=-1;
      const dx=p.x-mouse.x,dy=p.y-mouse.y,d=Math.hypot(dx,dy);
      if(d<120){p.x+=dx/d*1.2;p.y+=dy/d*1.2}
      ctx.fillStyle='rgba(126,224,143,.8)';ctx.beginPath();ctx.arc(p.x,p.y,1.8,0,7);ctx.fill();
    }
    for(let i=0;i<pts.length;i++)for(let j=i+1;j<pts.length;j++){
      const d=Math.hypot(pts[i].x-pts[j].x,pts[i].y-pts[j].y);
      if(d<130){ctx.strokeStyle=`rgba(126,224,143,${.22*(1-d/130)})`;ctx.beginPath();ctx.moveTo(pts[i].x,pts[i].y);ctx.lineTo(pts[j].x,pts[j].y);ctx.stroke()}
    }
    requestAnimationFrame(loop);
  })();
})();

/* narzędzia: zakładki, kalkulator szkoleń, macierz ryzyka */
if($('#grp')){
  $$('.tab').forEach(t=>t.onclick=()=>{
    $$('.tab').forEach(x=>x.setAttribute('aria-selected',x===t));
    $$('.panel').forEach(p=>p.classList.toggle('on',p.id===t.dataset.p));
  });
  const years={'6':6,'3':3,'1':1,'5':5,'5b':5};
  const last=$('#last');
  last.valueAsDate=new Date();
  function calc1(){
    const y=years[$('#grp').value];
    const d=new Date(last.value||Date.now());
    const n=new Date(d);n.setFullYear(n.getFullYear()+y);
    const days=Math.ceil((n-new Date().setHours(0,0,0,0))/864e5);
    const fmt=n.toLocaleDateString('pl-PL',{day:'numeric',month:'long',year:'numeric'});
    let col='#7ee08f',msg=`Zostało ok. ${days} dni`;
    if(days<0){col='#ff6b6b';msg=`Po terminie o ${-days} dni`}
    else if(days<=60){col='#f5b50a';msg=`Zbliża się: ${days} dni`}
    $('#r1').innerHTML=`<small>Następne szkolenie okresowe najpóźniej</small><div class="big" style="color:${col}">${fmt}</div><small>${msg} · cykl co ${y} ${y==1?'rok':y<5?'lata':'lat'}</small><a class="btn btn-primary" href="kontakt.html">Umów szkolenie</a>`;
  }
  $('#grp').onchange=calc1;last.onchange=calc1;calc1();

  function calc2(){
    const p=+$('#prob').value,s=+$('#sev').value,e=+$('#exp').value;
    $('#pv').textContent=p;$('#sv').textContent=s;$('#ev').textContent=e;
    const r=p*s*e,pct=r/125*100;
    let lvl,col,txt;
    if(r<=20){lvl='Małe';col='#7ee08f';txt='Ryzyko akceptowalne, wystarczy monitorowanie.'}
    else if(r<=60){lvl='Średnie';col='#f5b50a';txt='Warto wdrożyć działania ograniczające i dopilnować szkoleń.'}
    else{lvl='Duże';col='#ff6b6b';txt='Wymaga pilnych działań zaradczych. Skontaktuj się ze mną.'}
    $('#r2').innerHTML=`<small>Poziom ryzyka</small><div class="big" style="color:${col}">${lvl}</div><div class="meter"><i style="width:${pct}%;background:${col}"></i></div><small>Wskaźnik ${r} / 125 · ${txt}</small><a class="btn btn-primary" href="kontakt.html">Zleć ocenę ryzyka</a>`;
  }
  ['prob','sev','exp'].forEach(i=>$('#'+i).oninput=calc2);calc2();
}

/* ===== TREŚCI DO UZUPEŁNIENIA (strona „O mnie”) =====
   Galeria: wrzuć zdjęcia do folderu "galeria" obok index.html i dopisz nazwy plików.
   Referencje: dopisz opinie klientów (tylko za ich zgodą). Puste listy = sekcje ukryte. */
const GALERIA=[
  // {plik:'targi-prosave-1.jpg', opis:'Targi Prosave, Czeladź'},
];
const REFERENCJE=[
  // {tekst:'Treść opinii...', autor:'Imię Nazwisko', firma:'Nazwa firmy'},
];

if($('#gal')) (function(){
  const g=$('#gal'), lb=$('#lb'), li=lb.querySelector('img'), lp=lb.querySelector('p');
  GALERIA.forEach(f=>{
    const b=document.createElement('button');
    b.innerHTML=`<img loading="lazy" src="galeria/${encodeURIComponent(f.plik)}" alt=""><figcaption></figcaption>`;
    b.querySelector('img').alt=f.opis||'Zdjęcie z galerii Prevento';
    b.querySelector('figcaption').textContent=f.opis||'';
    b.querySelector('img').onerror=()=>b.remove();
    b.onclick=()=>{li.src=b.querySelector('img').src;li.alt=f.opis||'';lp.textContent=f.opis||'';lb.classList.add('on')};
    g.appendChild(b);
  });
  if(GALERIA.length)$('#galeria').hidden=false;
  lb.onclick=e=>{if(e.target!==li)lb.classList.remove('on')};
  addEventListener('keydown',e=>{if(e.key==='Escape')lb.classList.remove('on')});
  const r=$('#refs');
  REFERENCJE.forEach(x=>{
    const d=document.createElement('div');d.className='ref';
    d.innerHTML='<p></p><b></b><span></span>';
    d.querySelector('p').textContent=x.tekst;
    d.querySelector('b').textContent=x.autor||'';
    d.querySelector('span').textContent=x.firma||'';
    r.appendChild(d);
  });
  if(REFERENCJE.length)$('#referencje').hidden=false;
})();

/* formularz -> mailto */
if($('#form')) $('#form').onsubmit=e=>{
  e.preventDefault();
  const body=`Imię i nazwisko: ${$('#fn').value}\nTelefon: ${$('#fp').value}\nE-mail: ${$('#fe').value}\nTemat: ${$('#fs').value}\nLiczba pracowników: ${$('#fk').value}\n\n${$('#fm').value}`;
  location.href=`mailto:jszarek@prevento.hub.pl?subject=${encodeURIComponent('Zapytanie ze strony: '+$('#fs').value)}&body=${encodeURIComponent(body)}`;
};
