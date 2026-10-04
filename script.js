
/* =========================================================
   JAVASCRIPT — small, simple pieces. Each block has a title.
   ========================================================= */
const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
document.documentElement.classList.add('js');   // turns on the scroll animations

/* ---------- Pop-up message ---------- */
function toast(msg){
  const t = document.createElement('div');
  t.className = 'toast';
  t.innerHTML = '<svg class="i"><use href="#i-check"/></svg><span></span>';
  t.querySelector('span').textContent = msg;
  $('#toasts').appendChild(t);
  requestAnimationFrame(() => t.classList.add('show'));
  setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 400); }, 3200);
}

/* ---------- PAGE SWITCHING ----------
   Any link/button with data-page="about" opens the "about" page.
   Add data-anchor="some-id" to also scroll to that spot.            */
const titles = {home:'HopeTogether — Better People, Brighter Future', about:'About Us — HopeTogether',
  work:'Our Work — HopeTogether', involved:'Get Involved — HopeTogether', donate:'Donate — HopeTogether',
  gallery:'Gallery — HopeTogether', contact:'Contact — HopeTogether'};

function showPage(name, anchor){
  if(!$('#page-' + name)) name = 'home';
  $$('.page').forEach(p => p.classList.toggle('active', p.id === 'page-' + name));
  $$('#nav a').forEach(a => a.classList.toggle('active', a.dataset.page === name));
  document.body.classList.remove('menu-open');
  document.title = titles[name];
  try { history.replaceState(null, '', '#' + name); } catch(e) {}
  if(anchor){
    setTimeout(() => { const el = document.getElementById(anchor); if(el) window.scrollTo({top: el.getBoundingClientRect().top + scrollY - 90, behavior:'smooth'}); }, 120);
  } else {
    window.scrollTo(0, 0);
  }
}

document.addEventListener('click', e => {
  const link = e.target.closest('[data-page]');
  if(!link) return;
  e.preventDefault();
  if(link.dataset.subject) $('#cSubject').value = link.dataset.subject;   // pre-fill contact subject
  showPage(link.dataset.page, link.dataset.anchor);
});

/* ---------- Mobile menu ---------- */
$('#menuBtn').onclick = () => document.body.classList.toggle('menu-open');
$('#veil').onclick    = () => document.body.classList.remove('menu-open');

/* ---------- Header turns solid + back-to-top button ---------- */
addEventListener('scroll', () => {
  $('#header').classList.toggle('solid', scrollY > 30);
  $('#toTop').classList.toggle('show', scrollY > 500);
}, {passive:true});
$('#toTop').onclick = () => scrollTo({top:0, behavior:'smooth'});

/* ---------- Scroll animations + number counters ---------- */
function countUp(el){
  const end = +el.dataset.count; let start = null;
  (function step(t){
    if(!start) start = t;
    const p = Math.min((t - start) / 1500, 1);
    el.textContent = Math.floor(end * (1 - Math.pow(1 - p, 3))).toLocaleString() + (p === 1 ? '+' : '');
    if(p < 1) requestAnimationFrame(step);
  })(performance.now());
}
const watcher = new IntersectionObserver(entries => {
  entries.forEach(en => {
    if(!en.isIntersecting) return;
    en.target.classList.add('show');
    if(en.target.dataset.count) countUp(en.target);
    watcher.unobserve(en.target);
  });
}, {threshold:.15});
$$('.reveal, .rimg, [data-count]').forEach(el => watcher.observe(el));

/* ---------- Hero image: 3D tilt when the mouse moves over it ---------- */
const photo = $('.hero-photo'), tilt = $('.tilt');
if(photo && matchMedia('(hover:hover)').matches){
  photo.addEventListener('mousemove', e => {
    const r = photo.getBoundingClientRect();
    tilt.style.setProperty('--ry', ((e.clientX - r.left) / r.width  - .5) * 12 + 'deg');
    tilt.style.setProperty('--rx', ((e.clientY - r.top)  / r.height - .5) * -12 + 'deg');
  });
  photo.addEventListener('mouseleave', () => { tilt.style.setProperty('--rx','0deg'); tilt.style.setProperty('--ry','0deg'); });
}

/* ---------- Testimonial slider ---------- */
const slides = $$('.slide'); let cur = 0, timer;
slides.forEach((_, i) => { const d = document.createElement('button'); d.className = 'dot'; d.onclick = () => { go(i); auto(); }; $('#dots').appendChild(d); });
function go(i){
  cur = (i + slides.length) % slides.length;
  slides.forEach((s, k) => s.classList.toggle('on', k === cur));
  $$('.dot').forEach((d, k) => d.classList.toggle('on', k === cur));
}
function auto(){ clearInterval(timer); timer = setInterval(() => go(cur + 1), 6000); }
$('#prev').onclick = () => { go(cur - 1); auto(); };
$('#next').onclick = () => { go(cur + 1); auto(); };
go(0); auto();

/* ---------- Gallery: filter buttons + lightbox ---------- */
const items = $$('.g-item');
$$('.chip').forEach(c => c.onclick = () => {
  $$('.chip').forEach(x => x.classList.toggle('on', x === c));
  items.forEach(it => it.classList.toggle('hide', c.dataset.f !== 'all' && it.dataset.cat !== c.dataset.f));
});
let shown = [], pos = 0;
function showLightbox(){
  const img = $('img', shown[pos]);
  $('#lbImg').src = img.src; $('#lbCap').textContent = img.alt;
  $('#lightbox').classList.add('open');
}
items.forEach(it => it.onclick = () => { shown = items.filter(x => !x.classList.contains('hide')); pos = shown.indexOf(it); showLightbox(); });
$('#lbClose').onclick = () => $('#lightbox').classList.remove('open');
$('#lbNext').onclick  = () => { pos = (pos + 1) % shown.length; showLightbox(); };
$('#lbPrev').onclick  = () => { pos = (pos - 1 + shown.length) % shown.length; showLightbox(); };
$('#lightbox').onclick = e => { if(e.target.id === 'lightbox') $('#lightbox').classList.remove('open'); };
addEventListener('keydown', e => { if(e.key === 'Escape') $('#lightbox').classList.remove('open'); });

/* ---------- Form helper: show / clear an error under a field ---------- */
function check(input, ok, msg){
  const box = input.closest('.field');
  box.classList.toggle('bad', !ok);
  $('.err', box).textContent = ok ? '' : msg;
  return ok;
}
const validEmail = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

/* ---------- Donate form ---------- */
let amount = 1500, freq = 'once';
function updateLabel(){ $('#donateLabel').textContent = 'Donate ₹' + amount.toLocaleString() + (freq === 'monthly' ? ' / month' : ''); }
$$('.amt').forEach(b => b.onclick = () => {
  $$('.amt').forEach(x => x.classList.toggle('on', x === b));
  amount = +b.dataset.v; $('#custom').value = ''; updateLabel();
});
$('#custom').oninput = e => { $$('.amt').forEach(x => x.classList.remove('on')); amount = +e.target.value || 0; updateLabel(); };
$$('.freq button').forEach(b => b.onclick = () => {
  $$('.freq button').forEach(x => x.classList.toggle('on', x === b));
  freq = b.dataset.f; updateLabel();
});
$('#donateGo').onclick = () => {
  const okName  = check($('#dName'),  $('#dName').value.trim().length > 1, 'Please enter your name');
  const okEmail = check($('#dEmail'), validEmail($('#dEmail').value.trim()), 'Enter a valid email');
  if(amount <= 0){ toast('Please choose an amount'); return; }
  if(!okName || !okEmail) return;
  $('#donateMsg').textContent = 'Your ₹' + amount.toLocaleString() + (freq === 'monthly' ? ' monthly' : ' one-time') + ' gift is on its way to changing lives, ' + $('#dName').value.trim() + '.';
  $('#donateForm').style.display = 'none';
  $('#donateDone').classList.add('show');
};
$('#donateAgain').onclick = () => { $('#donateDone').classList.remove('show'); $('#donateForm').style.display = ''; };

/* ---------- Contact form ---------- */
$('#contactForm').onsubmit = e => {
  e.preventDefault();
  const a = check($('#cName'),    $('#cName').value.trim().length > 1,     'Please enter your name');
  const b = check($('#cEmail'),   validEmail($('#cEmail').value.trim()),   'Enter a valid email');
  const c = check($('#cSubject'), $('#cSubject').value.trim().length > 1,  'Please add a subject');
  const d = check($('#cMessage'), $('#cMessage').value.trim().length > 4,  'Please write a short message');
  if(!(a && b && c && d)) return;
  $('#contactForm').style.display = 'none';
  $('#contactDone').classList.add('show');
  toast('Message sent successfully');
};
$('#contactAgain').onclick = () => { $('#contactForm').reset(); $('#contactForm').style.display = ''; $('#contactDone').classList.remove('show'); };

/* ---------- Newsletter ---------- */
$('#newsForm').onsubmit = e => {
  e.preventDefault();
  if(validEmail($('#newsEmail').value.trim())){ toast('Subscribed! Watch your inbox.'); $('#newsEmail').value = ''; }
  else toast('Please enter a valid email');
};

/* ---------- If any image fails to load, show a green placeholder instead ---------- */
const FALLBACK = 'data:image/svg+xml;utf8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><rect width="400" height="300" fill="#1c3226"/><circle cx="200" cy="150" r="46" fill="#3fa85f" opacity=".55"/></svg>');
$$('img').forEach(img => {
  const fix = () => { if(img.src !== FALLBACK) img.src = FALLBACK; };
  img.addEventListener('error', fix);
  if(img.complete && img.naturalWidth === 0 && img.getAttribute('src')) fix();
});

/* ---------- Start on the page named in the address (#about etc.) ---------- */
showPage(location.hash.slice(1) || 'home');
