(function () {
'use strict';
var d = document, w = window, html = d.documentElement;
var ruhig = w.matchMedia && w.matchMedia('(prefers-reduced-motion: reduce)').matches;
var kopf = d.querySelector('[data-kopf]');
function lies(k) { try { return w.localStorage.getItem(k); } catch (e) { return null; } }
function schreib(k, v) { try { w.localStorage.setItem(k, v); } catch (e) {} }
/* ---------- Öffnungszeiten (Europe/Berlin) ---------- */
var daten = {};
try { daten = JSON.parse(d.getElementById('h4-daten').textContent); } catch (e) {}
/* Texte der Seitensprache aus build.py (content.py), Platzhalter {u} {w} {t} {v} */
var T = daten.t || {};
var TAGE = daten.tage || [];
function f(s, o) { return String(s || '').replace(/\{(\w)\}/g, function (_, k) { return o[k]; }); }
var WT = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
function berlin(dt) {
var f = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Berlin', weekday: 'short', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
var t = {};
f.formatToParts(dt).forEach(function (p) { t[p.type] = p.value; });
return { tag: WT[t.weekday], datum: t.year + '-' + t.month + '-' + t.day, min: (+t.hour % 24) * 60 + (+t.minute) };
}
function uhr(m) {
var h = Math.floor(m / 60), mm = m % 60;
if (daten.uhr !== 'de') return (h < 10 ? '0' : '') + h + ':' + (mm < 10 ? '0' : '') + mm;
return h + (mm ? '.' + (mm < 10 ? '0' : '') + mm : '') + ' Uhr';
}
function bloecke(datum, tag) {
if ((daten.feiertage || []).indexOf(datum) > -1) return null;
return (daten.zeiten || {})[tag] || [];
}
function zustand(jetzt) {
var b = berlin(jetzt || new Date());
if (b.datum < '2026-11-20') return { z: 'zu', lang: T.eroeffnung_lang, kurz: T.eroeffnung_kurz, mini: T.eroeffnung_mini, tag: b.tag, e: true };
var heute = bloecke(b.datum, b.tag);
if (heute === null) return { z: 'zu', lang: T.feiertag, kurz: T.zu_kurz, mini: T.zu_mini, tag: b.tag };
for (var i = 0; i < heute.length; i++) {
var von = heute[i][0], bis = heute[i][1];
if (b.min >= von && b.min < bis) {
var ub = { u: uhr(bis) };
if (bis - b.min <= 30) return { z: 'bald', lang: f(T.bald_lang, ub), kurz: f(T.bald_kurz, ub), mini: T.bald_mini, tag: b.tag };
return { z: 'offen', lang: f(T.offen_lang, ub), kurz: f(T.offen_kurz, ub), mini: T.offen_mini, tag: b.tag };
}
if (b.min < von) {
var uv = { u: uhr(von) };
if (i > 0) return { z: 'pause', lang: f(T.pause_lang, uv), kurz: f(T.oeffnet_kurz, uv), mini: f(T.ab_mini, uv), tag: b.tag };
return { z: 'zu', lang: f(T.zu_heute, uv), kurz: f(T.oeffnet_kurz, uv), mini: f(T.ab_mini, uv), tag: b.tag };
}
}
for (var n = 1; n < 15; n++) {
var x = berlin(new Date((jetzt || new Date()).getTime() + n * 864e5));
var bl = bloecke(x.datum, x.tag);
if (bl && bl.length) return { z: 'zu', lang: f(T.zu_naechst, { w: n === 1 ? T.morgen : f(T.am_tag, { t: TAGE[x.tag] }), u: uhr(bl[0][0]) }), kurz: T.zu_kurz, mini: T.zu_mini, tag: b.tag };
}
return { z: 'zu', lang: T.zu, kurz: T.zu_kurz, mini: T.zu_mini, tag: b.tag };
}
function status() {
var s;
try { s = zustand(); } catch (e) { return; }
d.querySelectorAll('[data-status]').forEach(function (el) {
var art = el.getAttribute('data-status');
var txt = el.querySelector('.s-text');
if (txt) txt.textContent = art === 'kurz' ? s.kurz : s.lang;
var mini = el.querySelector('.s-mini');
if (mini) mini.textContent = s.mini;
el.setAttribute('data-zustand', s.z);
el.classList.toggle('s-eroeffnung', !!s.e);
el.hidden = false;
});
d.querySelectorAll('tr[data-tag]').forEach(function (tr) {
var an = +tr.getAttribute('data-tag') === s.tag;
tr.classList.toggle('heute', an);
var m = tr.querySelector('.heute-sr');
if (m) m.hidden = !an;
});
}
status();
setInterval(status, 60000);
/* ---------- Kopfzeile ---------- */
var hero = d.querySelector('[data-hero]');
function kopfAn() {
if (!kopf) return;
/* Hysterese (P1-01): klein ab 64 px, groß erst wieder unter 8 px */
var y = w.scrollY;
if (y > 64) kopf.classList.add('klein'); else if (y < 8) kopf.classList.remove('klein');
if (hero) kopf.classList.toggle('nach-hero', hero.getBoundingClientRect().bottom < 64);
}
if (kopf && !hero) kopf.classList.add('nach-hero');
/* ---------- Leiste unten (Handy) ab 100vh ---------- */
/* Ausgeblendet, solange ein roter Button im Inhalt sichtbar ist: ein roter Button je Bildschirm (P2-09) */
var leiste = d.querySelector('[data-leiste]'), rotSichtbar = 0;
function leisteAn() { if (leiste) leiste.classList.toggle('an', w.scrollY > w.innerHeight * 0.95 && rotSichtbar === 0); }
if (leiste && 'IntersectionObserver' in w) {
var rotIo = new IntersectionObserver(function (es) {
es.forEach(function (e) {
var war = e.target._sicht === true;
if (e.isIntersecting !== war) { rotSichtbar += e.isIntersecting ? 1 : -1; e.target._sicht = e.isIntersecting; }
});
leisteAn();
}, { rootMargin: '0px 0px -72px 0px' });
d.querySelectorAll('main .btn-primaer').forEach(function (b) { rotIo.observe(b); });
}
/* ---------- Menü ---------- */
var knopf = d.querySelector('[data-menue-knopf]'), menue = d.getElementById('menue');
/* Hintergrund während Menü/Filter nicht erreichbar (Fokus bleibt im Menü) */
function sperre(an, auchKopf) {
var ziele = ['main', '.fuss', '.leiste', '.skip'];
if (auchKopf) ziele.push('.kopf', '#menue');
ziele.forEach(function (sel) { var el = d.querySelector(sel); if (!el) return; if (an) el.setAttribute('inert', ''); else el.removeAttribute('inert'); });
}
w.h4sperre = sperre;
function menueZu(fokus) {
if (!menue || menue.hidden) return;
menue.hidden = true; html.classList.remove('menue-offen'); sperre(false);
knopf.setAttribute('aria-expanded', 'false'); knopf.setAttribute('aria-label', T.menue_auf);
if (fokus) knopf.focus();
}
if (knopf && menue) {
knopf.hidden = false;
knopf.addEventListener('click', function (e) {
if (!menue.hidden) return menueZu(false);
var r = kopf.getBoundingClientRect();
menue.style.setProperty('--menue-top', Math.max(0, r.bottom) + 'px');
menue.hidden = false; html.classList.add('menue-offen'); sperre(true);
knopf.setAttribute('aria-expanded', 'true'); knopf.setAttribute('aria-label', T.menue_zu);
/* Easter Egg: die drei Striche werden kurz zur wehenden Trikolore, dann zum X (nicht bei reduzierter Bewegung) */
if (!ruhig) { knopf.classList.remove('flagge-an'); void knopf.offsetWidth; knopf.classList.add('flagge-an'); setTimeout(function () { knopf.classList.remove('flagge-an'); }, 1000); }
if (e.detail === 0) { var a = menue.querySelector('a'); if (a) a.focus(); }
});
d.addEventListener('keydown', function (e) { if (e.key === 'Escape') menueZu(true); });
menue.addEventListener('click', function (e) { if (e.target.closest('a')) menueZu(false); });
w.addEventListener('resize', function () { if (w.innerWidth >= 900) menueZu(false); });
}
/* ---------- Größen-Umschalter 30/45 ---------- */
var gruppen = d.querySelectorAll('.groesse[data-groesse]');
function groesse(v, merken) {
html.setAttribute('data-groesse', v);
gruppen.forEach(function (g) {
g.querySelectorAll('button').forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-wert') === v ? 'true' : 'false'); });
});
d.querySelectorAll('[data-groesse-info]').forEach(function (el) { el.textContent = f(T.groesse, { v: v }); el.hidden = false; });
d.querySelectorAll('[data-durchmesser]').forEach(function (el) { el.textContent = 'Ø ' + v + ' cm'; });
if (merken) schreib('h4-groesse', v);
d.dispatchEvent(new CustomEvent('h4:groesse', { detail: v }));
}
if (gruppen.length) {
gruppen.forEach(function (g) {
g.hidden = false;
g.addEventListener('click', function (e) { var b = e.target.closest('button[data-wert]'); if (b) groesse(b.getAttribute('data-wert'), true); });
});
groesse(lies('h4-groesse') === '45' ? '45' : '30', false);
}
/* ---------- Kennzeichnung als Hinweis (Antippen) ---------- */
var tip;
d.addEventListener('click', function (e) {
var a = e.target.closest('.kz abbr');
if (tip) { tip.remove(); tip = null; }
if (!a) return;
tip = d.createElement('div'); tip.className = 'tip'; tip.setAttribute('role', 'status');
tip.textContent = a.textContent + ': ' + a.getAttribute('title');
d.body.appendChild(tip);
var r = a.getBoundingClientRect();
var x = Math.min(w.innerWidth - tip.offsetWidth - 8, Math.max(8, r.left + w.scrollX - 20));
tip.style.left = x + 'px'; tip.style.top = (r.top + w.scrollY - tip.offsetHeight - 8) + 'px';
});
/* ---------- Einblenden .rv mit Sicherheitsnetz ---------- */
var rv = [].slice.call(d.querySelectorAll('.rv'));
function zeig(el) { el.classList.add('sichtbar'); }
function imBild() {
var h = w.innerHeight;
rv = rv.filter(function (el) {
var r = el.getBoundingClientRect();
if (r.top < h * 0.98 && r.bottom > 0) { zeig(el); return false; }
return true;
});
}
function alleImBild() { rv.forEach(function (el) { var r = el.getBoundingClientRect(); if (r.top < w.innerHeight && r.bottom > -w.innerHeight) zeig(el); }); imBild(); }
if (ruhig || !('IntersectionObserver' in w)) { rv.forEach(zeig); rv = []; }
else {
var io = new IntersectionObserver(function (es) {
es.forEach(function (e) { if (e.isIntersecting) { zeig(e.target); io.unobserve(e.target); } });
}, { rootMargin: '0px 0px -6% 0px' });
rv.forEach(function (el) { io.observe(el); });
imBild();
setTimeout(imBild, 300);
var netz = setInterval(function () { imBild(); if (!rv.length) clearInterval(netz); }, 400);
}
/* ---------- Anker: Ziel nach Laden sicher erreichen ---------- */
function versatz() {
/* sichtbare Höhe: Kopfzeile klein (nach dem Sprung), Sprungleiste ohne die Werkzeugzeile am Handy */
var cs = getComputedStyle(html), v = kopf ? (parseFloat(cs.getPropertyValue('--kopf')) || kopf.querySelector('.kopf-in').offsetHeight) : 0;
var sp = d.querySelector('.sprung');
if (sp) v += parseFloat(cs.getPropertyValue('--sprung-h')) || sp.getBoundingClientRect().height;
return v + 12;
}
function springe(hash, sanft) {
if (!hash || hash.length < 2) return false;
try { if (w.h4springeEigen && w.h4springeEigen(decodeURIComponent(hash.slice(1)))) return true; } catch (e) {}
var z; try { z = d.getElementById(decodeURIComponent(hash.slice(1))); } catch (e) { z = null; }
if (!z) return false;
var y = z.getBoundingClientRect().top + w.scrollY - versatz();
w.scrollTo({ top: Math.max(0, y), behavior: sanft && !ruhig ? 'smooth' : 'auto' });
alleImBild();
/* Fokus mitnehmen, damit der nächste Tab im Ziel weitergeht (P2-03) */
if (!z.matches('a[href],button,input,select,textarea,[tabindex]')) z.setAttribute('tabindex', '-1');
try { z.focus({ preventScroll: true }); } catch (e) {}
return true;
}
w.h4springe = springe;
if (location.hash) {
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
var nach = function () { springe(location.hash, false); };
d.addEventListener('DOMContentLoaded', nach);
w.addEventListener('load', nach);
if (d.fonts && d.fonts.ready) d.fonts.ready.then(nach);
}
w.addEventListener('hashchange', function () { springe(location.hash, false); });
d.addEventListener('click', function (e) {
var a = e.target.closest('a[href*="#"]');
if (!a || a.target || e.defaultPrevented) return;
var u = new URL(a.href, location.href);
if (u.pathname !== location.pathname || !u.hash) return;
if (springe(u.hash, true)) { e.preventDefault(); history.pushState(null, '', u.hash); }
});
/* ---------- Easter Egg 1: Trikolore weht nach dem Wechsel auf Italienisch (nur bei Interaktion, nicht bei reduzierter Bewegung) ---------- */
d.addEventListener('click', function (e) {
var a = e.target.closest('.sprachen a[lang="it"]');
if (a && html.lang !== 'it') { try { sessionStorage.setItem('h4-flagge', '1'); } catch (er) {} }
});
var flagge = null;
try { flagge = sessionStorage.getItem('h4-flagge'); if (flagge) sessionStorage.removeItem('h4-flagge'); } catch (e) {}
if (flagge && html.lang === 'it' && !ruhig && Element.prototype.animate) {
var wehen = function () {
if (html.classList.contains('intro-an')) { setTimeout(wehen, 150); return; }
var ziel = [].filter.call(d.querySelectorAll('.sprachen-kopf a[lang="it"], [data-menue-knopf]'), function (x) { return x.offsetParent; })[0];
if (!ziel) return;
var r = ziel.getBoundingClientRect(), f = d.createElement('div');
f.className = 'flagge'; f.setAttribute('aria-hidden', 'true');
f.innerHTML = '<i></i><i></i><i></i><b></b>';
f.style.left = (r.left + r.width / 2 - 2) + 'px'; f.style.top = Math.max(4, r.top - 30) + 'px';
d.body.appendChild(f);
f.animate([{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none', offset: .15 }, { opacity: 1, transform: 'none', offset: .8 }, { opacity: 0, transform: 'translateY(-4px)' }],
{ duration: 1300, easing: 'ease-out', fill: 'forwards' }).onfinish = function () { f.remove(); };
[].forEach.call(f.querySelectorAll('i'), function (s, k) {
s.animate([{ transform: 'translateY(0) skewY(0)' }, { transform: 'translateY(-2px) skewY(-6deg)' }, { transform: 'translateY(1.5px) skewY(5deg)' }, { transform: 'translateY(0) skewY(0)' }],
{ duration: 420, delay: k * 70, iterations: 2, easing: 'ease-in-out' });
});
};
/* Start erst nach dem Seitenübergang (P2-04): UE_JS meldet h4:ue-ende nach viewTransition.finished; Not-Start nach 1,6 s */
var los = false, start = function () { if (los) return; los = true; setTimeout(wehen, 120); };
if (w.h4ueFertig) start(); else { d.addEventListener('h4:ue-ende', start); setTimeout(start, 1600); }
}
/* ---------- Easter Egg 2: Klick auf das Logo im Footer, eine kleine Pizza dreht sich im Rahmen ---------- */
var ei = d.querySelector('[data-ei]');
if (ei) ei.addEventListener('click', function () {
var feld = ei.querySelector('.ei-pizza'), txt = d.querySelector('[data-ei-text]');
if (!feld.firstChild) { var im = new Image(); im.alt = ''; im.decoding = 'async'; im.src = ei.getAttribute('data-pizza'); feld.appendChild(im); }
ei.classList.remove('ei-an'); void ei.offsetWidth; ei.classList.add('ei-an');
if (txt) txt.textContent = T.ei || 'Buon appetito!';
clearTimeout(ei._t);
ei._t = setTimeout(function () { ei.classList.remove('ei-an'); if (txt) txt.textContent = ''; }, 3200);
});
/* ---------- Scroll-Takt ---------- */
var tick = false;
function lauf() { tick = false; kopfAn(); leisteAn(); imBild(); }
w.addEventListener('scroll', function () { if (!tick) { tick = true; requestAnimationFrame(lauf); } }, { passive: true });
w.addEventListener('resize', lauf);
lauf();
})();