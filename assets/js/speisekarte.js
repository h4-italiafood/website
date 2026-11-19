(function () {
'use strict';
var d = document, w = window, H = d.documentElement;
var $ = function (s, r) { return [].slice.call((r || d).querySelectorAll(s)); };
var klemme = function (v, a, b) { return v < a ? a : v > b ? b : v; };
var ruhig = w.matchMedia('(prefers-reduced-motion: reduce)');
var breit = w.matchMedia('(min-width:900px)');
var kats = $('.kat, .a-kat');
var sprung = d.querySelector('.sprung');
var T = {};
try { T = JSON.parse(d.getElementById('h4-daten').textContent).t || {}; } catch (e) {}
function f(s, o) { return String(s || '').replace(/\{(\w)\}/g, function (_, k) { return o[k]; }); }
/* ---------- Sprungleiste: Höhe, aktive Kategorie ---------- */
/* --sprung-h = klebender Teil der Leiste. Am Handy fährt die Werkzeugzeile (oben) unter die Kopfzeile (--wz-h), P2-03 */
function hoehe() {
if (!sprung) return;
var wz = sprung.querySelector('.werkzeug'), wh = (!breit.matches && wz) ? wz.offsetHeight : 0;
H.style.setProperty('--wz-h', wh + 'px');
H.style.setProperty('--sprung-h', (sprung.getBoundingClientRect().height - wh) + 'px');
}
hoehe();
var links = sprung ? $('ul a', sprung) : [];
var leiste = sprung ? sprung.querySelector('ul') : null, aktiv = null;
function spy() {
if (!sprung) return;
var grenze = sprung.getBoundingClientRect().bottom + 48, id = null;
kats.forEach(function (k) { if (k.getBoundingClientRect().top <= grenze) id = k.id; });
if (w.innerHeight + w.scrollY >= H.scrollHeight - 4 && kats.length) id = id || kats[kats.length - 1].id;
if (id === aktiv) return;
aktiv = id;
links.forEach(function (a) {
var an = a.getAttribute('href') === '#' + id;
a.classList.toggle('aktiv', an);
if (an) {
a.setAttribute('aria-current', 'true');
if (leiste.scrollWidth > leiste.clientWidth) leiste.scrollTo({ left: a.offsetLeft - (leiste.clientWidth - a.offsetWidth) / 2, behavior: 'smooth' });
} else a.removeAttribute('aria-current');
});
}
/* ---------- Bühnen ---------- */
function an() { return H.classList.contains('a-an'); }
var buehnen = $('[data-a]').map(function (el) {
var B = { el: el, spur: el.querySelector('.a-spur'), buehne: el.querySelector('.a-buehne'), liste: el.querySelector('.a-liste'),
g: $('.a-g', el), links: $('.a-rail a', el), railOl: el.querySelector('.a-rail ol'), live: el.querySelector('[data-a-live]'),
tipp: el.querySelector('[data-a-tipp]'), pos: el.querySelector('[data-a-pos]'), zur: el.querySelector('[data-a-zurueck]'),
wei: el.querySelector('[data-a-weiter]'), p: 0, ist: -1, nah: [], schritt: 420, oben: 116, t: 0 };
B.n = B.g.length;
B.links.forEach(function (a, k) {
a.addEventListener('click', function (e) { if (!an()) return; e.preventDefault(); gehe(B, k, true); });
});
B.zur.addEventListener('click', function () { gehe(B, B.ist - 1, true); });
B.wei.addEventListener('click', function () { gehe(B, B.ist + 1, true); });
B.buehne.addEventListener('keydown', function (e) {
if (!an() || e.altKey || e.metaKey || e.ctrlKey) return;
if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); gehe(B, B.ist + (e.key === 'ArrowRight' ? 1 : -1), true); }
});
var tick = false;
B.liste.addEventListener('scroll', function () {
if (tick || breit.matches || !an()) return;
tick = true; requestAnimationFrame(function () { tick = false; lesen(B); });
}, { passive: true });
return B;
});
function masse() {
buehnen.forEach(function (B) {
if (an() && breit.matches) {
B.schritt = Math.round(Math.min(w.innerHeight * 0.52, 440));
B.spur.style.setProperty('--schritt', B.schritt + 'px');
B.oben = parseFloat(getComputedStyle(B.buehne).top) || 116;
var kinder = $('.a-steuer > *', B.el).filter(function (x) { return x.offsetHeight; }), ob = B.buehne.getBoundingClientRect().bottom;
if (kinder.length) B.buehne.style.setProperty('--steuer-h', Math.ceil(ob - Math.min.apply(null, kinder.map(function (x) { return x.getBoundingClientRect().top; }))) + 'px');
B.g.forEach(function (g) { g.classList.remove('eng', 'eng2'); g._passt = false; });
} else if (B.g[1]) B.schritt = B.g[1].offsetLeft - B.g[0].offsetLeft || 1;
});
}
/* Weg mit Rast: jedes Gericht ruht im mittleren Teil seines Schritts, dazwischen fährt es. */
function weg(a) { var r = 0.2, t = klemme((a - r) / (1 - r), 0, 1.4); return t <= 1 ? t * t * (3 - 2 * t) : t; }
function lesen(B) {
if (!an()) return;
var p;
if (breit.matches) {
var r = B.spur.getBoundingClientRect();
if (r.bottom < -200 || r.top > w.innerHeight + 200) { if (B.ist < 0) zeichne(B, 0); return; }
p = klemme((B.oben - r.top) / B.schritt, 0, B.n - 1);
} else p = klemme(B.liste.scrollLeft / B.schritt, 0, B.n - 1);
zeichne(B, p);
}
function zeichne(B, p) {
B.p = p;
var von = Math.max(0, Math.floor(p) - 2), bis = Math.min(B.n - 1, Math.ceil(p) + 2), neu = [], k, u, a;
for (k = von; k <= bis; k++) {
u = k - p; a = Math.abs(u);
if (breit.matches) u = (u < 0 ? -1 : 1) * weg(a);
B.g[k].style.setProperty('--u', u.toFixed(4));
B.g[k].style.setProperty('--ab', Math.min(1, a).toFixed(3));
B.g[k].classList.add('nah'); neu.push(k);
}
B.nah.forEach(function (i) { if (neu.indexOf(i) < 0) B.g[i].classList.remove('nah'); });
B.nah = neu;
var ist = Math.round(p);
if (ist === B.ist) return;
if (B.ist >= 0 && B.g[B.ist]) B.g[B.ist].classList.remove('ist');
B.ist = ist;
var g = B.g[ist], nr = g.getAttribute('data-nr');
g.classList.add('ist');
if (breit.matches) passen(B, g);
B.links.forEach(function (l, i) { if (i === ist) l.setAttribute('aria-current', 'true'); else l.removeAttribute('aria-current'); });
if (!breit.matches && B.railOl) { var l = B.links[ist]; B.railOl.scrollTo({ left: l.offsetLeft - (B.railOl.clientWidth - l.offsetWidth) / 2, behavior: ruhig.matches ? 'auto' : 'smooth' }); }
B.pos.textContent = ist + 1;
B.tipp.textContent = nr ? ': ' + nr : '';
B.zur.disabled = ist === 0; B.wei.disabled = ist === B.n - 1;
clearTimeout(B.t);
B.t = setTimeout(function () {
var pr = g.querySelector(H.getAttribute('data-groesse') === '45' ? '.p45' : '.p30') || g.querySelector('.a-preis');
B.live.textContent = (nr ? nr + ' ' : '') + g.querySelector('.a-name').textContent + ', ' + pr.textContent.replace(/\s+/g, ' ').trim();
}, 600);
}
/* Passt der Text nicht über den Bedienblock, erst kleinere Schrift (eng), dann ohne Allergenzeile (eng2, steht im Filter und in der Liste) */
function passen(B, g) {
if (g._passt) return;
var tx = g.querySelector('.a-text');
function zuGross() { return tx.scrollHeight > tx.clientHeight + 1; }
if (zuGross()) g.classList.add('eng');
if (zuGross()) g.classList.add('eng2');
g._passt = true;
}
function frei() { var k = d.querySelector('.kopf-in'); return (k ? k.offsetHeight : 0) + (parseFloat(getComputedStyle(H).getPropertyValue('--sprung-h')) || 0); }
function gehe(B, k, weich) {
k = klemme(k, 0, B.n - 1);
var art = weich && !ruhig.matches ? 'smooth' : 'auto';
if (breit.matches) w.scrollTo({ top: w.scrollY + B.spur.getBoundingClientRect().top - B.oben + k * B.schritt, behavior: art });
else {
B.liste.scrollTo({ left: k * B.schritt, behavior: art });
var r = B.buehne.getBoundingClientRect(), fr = frei() + 4;
if (r.top < fr - 4 || r.top > fr + 40) w.scrollTo({ top: w.scrollY + r.top - fr, behavior: art });
}
if (history.replaceState) history.replaceState(null, '', '#' + B.g[k].id);
}
function lies() { buehnen.forEach(lesen); }
/* Anker auf ein Gericht (#pizza-07) übernimmt die Bühne selbst (site.js fragt hier nach). */
w.h4springeEigen = function (id) {
if (!an()) return false;
var z = d.getElementById(id), treffer = false;
buehnen.forEach(function (B) { var k = B.g.indexOf(z); if (k >= 0) { masse(); gehe(B, k, false); treffer = true; } });
return treffer;
};
/* ---------- Ansicht: Einzeln / Liste ---------- */
var ans = d.querySelector('[data-ansicht]');
function ansicht(m) {
var halt = null;
buehnen.forEach(function (B) { var r = B.el.getBoundingClientRect(); if (!halt && r.top < w.innerHeight * 0.6 && r.bottom > 120) halt = B; });
var ziel = halt && halt.ist > 0 ? halt.g[halt.ist] : null;
H.classList.toggle('a-an', m === 'einzeln');
if (ans) $('button', ans).forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-wert') === m)); });
buehnen.forEach(function (B) {
B.ist = -1; B.nah = []; B.liste.scrollLeft = 0;
B.g.forEach(function (g) { g.classList.remove('ist', 'nah'); g.style.removeProperty('--u'); g.style.removeProperty('--ab'); });
$('.a-blaettern', B.el).forEach(function (x) { x.hidden = m !== 'einzeln'; });
});
masse();
if (m === 'einzeln') { lies(); if (halt && ziel) gehe(halt, halt.g.indexOf(ziel), false); }
else if (ziel) ziel.scrollIntoView();
}
if (ans && buehnen.length) {
ans.hidden = false;
$('button', ans).forEach(function (b) { b.addEventListener('click', function () { ansicht(b.getAttribute('data-wert')); }); });
ansicht(ruhig.matches ? 'liste' : 'einzeln');
}
/* Nach dem Laden der Schrift neu messen (Bedienblock, Textpassung) */
if (d.fonts && d.fonts.ready) d.fonts.ready.then(function () {
if (!an()) return;
hoehe(); masse();
buehnen.forEach(function (B) { var i = B.ist; B.ist = -1; if (B.g[i]) B.g[i].classList.remove('ist'); });
lies();
});
d.addEventListener('h4:groesse', function () { buehnen.forEach(function (B) { B.ist = -1; }); lies(); });
/* ---------- Handy/Tablet: „Mehr lesen“, wenn der Text in der festen Karte gekürzt ist ---------- */
function mehrPruefen() {
$('[data-a-mehr]').forEach(function (bt) {
var g = bt.closest('.a-g');
if (!an() || breit.matches) { bt.hidden = true; g.classList.remove('voll'); return; }
if (g.classList.contains('voll')) { bt.hidden = false; return; }
var t = g.querySelector('.a-text');
bt.hidden = true;
var gekuerzt = t.scrollHeight > t.clientHeight + 2;
bt.hidden = !gekuerzt;
});
}
$('[data-a-mehr]').forEach(function (bt) {
var mehr = bt.textContent, weniger = bt.getAttribute('data-weniger');
bt.addEventListener('click', function () {
var g = bt.closest('.a-g'), auf = !g.classList.contains('voll');
g.classList.toggle('voll', auf);
bt.setAttribute('aria-expanded', auf ? 'true' : 'false');
bt.textContent = auf ? weniger : mehr;
if (!auf) g.querySelector('.a-text').scrollTop = 0;
});
});
setTimeout(mehrPruefen, 60);
w.addEventListener('load', mehrPruefen);
var mt; w.addEventListener('resize', function () { clearTimeout(mt); mt = setTimeout(mehrPruefen, 200); });
d.addEventListener('h4:groesse', function () { setTimeout(mehrPruefen, 50); });
/* ---------- Bildfenster (übrige Kategorien) ---------- */
kats.forEach(function (k) {
var bf = k.querySelector('[data-bf]');
if (!bf) return;
var img = bf.querySelector('img'), icon = bf.querySelector('.bf-icon'), cap = bf.querySelector('figcaption'),
pfad = bf.getAttribute('data-pfad'), aktuell = img ? img.getAttribute('data-bild') : null;
function zeige(li) {
var b = li.getAttribute('data-bild');
cap.innerHTML = '';
var n = d.createElement('b'); n.textContent = li.getAttribute('data-titel'); cap.appendChild(n);
cap.appendChild(d.createTextNode(li.getAttribute('data-preis') || ''));
if (!b) { if (img) img.hidden = true; if (icon) icon.hidden = false; aktuell = null; return; }
if (!img || b === aktuell) { if (img) img.hidden = false; if (icon) icon.hidden = true; return; }
aktuell = b;
img.classList.add('blass');
var neu = new Image();
neu.onload = function () {
if (aktuell !== b) return;
img.src = neu.src; img.alt = li.getAttribute('data-alt') || '';
img.removeAttribute('srcset');
img.hidden = false; if (icon) icon.hidden = true;
requestAnimationFrame(function () { img.classList.remove('blass'); });
};
neu.src = pfad + b + (w.devicePixelRatio > 1.2 ? '-720.webp' : '-360.webp');
}
$('.g', k).forEach(function (li) {
li.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') zeige(li); });
li.addEventListener('click', function (e) { if (!e.target.closest('a,abbr,button')) zeige(li); });
li.addEventListener('focusin', function () { zeige(li); });
});
});
/* ---------- Scrollen, Größe ändern ---------- */
var roll = false;
w.addEventListener('scroll', function () { if (roll) return; roll = true; requestAnimationFrame(function () { roll = false; if (an() && breit.matches) lies(); spy(); }); }, { passive: true });
var rt;
w.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(function () { hoehe(); masse(); buehnen.forEach(function (B) { var i = B.ist; B.ist = -1; if (B.g[i]) B.g[i].classList.remove('ist'); }); lies(); }, 120); });
spy();
/* ---------- Allergen-Filter (gilt für Liste und Bühne) ---------- */
var knopf = d.querySelector('[data-filter-knopf]'), panel = d.getElementById('allergen-filter');
if (!knopf || !panel) return;
knopf.hidden = false;
hoehe();
var hinter = d.createElement('div'); hinter.className = 'filter-hinter'; hinter.hidden = true; d.body.appendChild(hinter);
var boxen = $('input[type=checkbox]', panel);
var zahl = panel.querySelector('[data-filter-zahl]'), titel = panel.querySelector('[tabindex="-1"]');
function auf() {
panel.hidden = false; hinter.hidden = false; knopf.setAttribute('aria-expanded', 'true');
if (w.h4sperre) w.h4sperre(true, true);
if (titel) titel.focus({ preventScroll: true });
}
function zu() { if (w.h4sperre) w.h4sperre(false, true); panel.hidden = true; hinter.hidden = true; knopf.setAttribute('aria-expanded', 'false'); knopf.focus({ preventScroll: true }); }
knopf.addEventListener('click', function () { panel.hidden ? auf() : zu(); });
hinter.addEventListener('click', zu);
$('[data-filter-zu]', panel).forEach(function (b) { b.addEventListener('click', zu); });
d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !panel.hidden) zu(); });
panel.querySelector('[data-filter-reset]').addEventListener('click', function () { boxen.forEach(function (b) { b.checked = false; }); anwenden(); });
function liste(a) { return a.length < 2 ? a.join('') : a.slice(0, -1).join(', ') + ' ' + T.und + ' ' + a[a.length - 1]; }
function anwenden() {
var wahl = boxen.filter(function (b) { return b.checked; });
var codes = wahl.map(function (b) { return b.value; });
var namen = liste(wahl.map(function (b) { return b.getAttribute('data-name'); }));
var alle = 0, frei_ = 0;
kats.forEach(function (k) {
var items = $('.g[data-k], .a-g[data-k]', k), n = 0;
var rail = $('.a-rail li', k);
items.forEach(function (li, i) {
var ks = (li.getAttribute('data-k') || '').split(' ');
var raus = codes.some(function (c) { return ks.indexOf(c) > -1; });
li.classList.toggle('aus', raus);
if (rail[i]) rail[i].classList.toggle('aus', raus);
var sr = li.querySelector('.aus-sr');
if (raus && !sr) { sr = d.createElement('span'); sr.className = 'sr aus-sr'; sr.textContent = T.aus_sr; li.querySelector('.g-name,.a-name').appendChild(sr); }
if (!raus && sr) sr.remove();
if (!raus) n++;
});
alle += items.length; frei_ += n;
var z = k.querySelector('[data-zaehler]');
if (z) {
z.hidden = !codes.length;
z.textContent = codes.length ? f(T.zaehler, { n: n, m: items.length, k: k.getAttribute('data-name'), a: namen }) : '';
}
});
zahl.textContent = codes.length ? f(T.gesamt, { n: frei_, m: alle, a: namen }) : f(T.keine, { m: alle });
knopf.classList.toggle('aktiv', codes.length > 0);
knopf.querySelector('.f-zahl').textContent = codes.length ? ' (' + codes.length + ')' : '';
}
boxen.forEach(function (b) { b.addEventListener('change', anwenden); });
anwenden();
})();