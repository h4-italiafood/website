(function () {
'use strict';
var d = document, w = window;
if (d.querySelector('[data-naht]')) { try { sessionStorage.setItem('h4-naht', '1'); } catch (e) {} }
var sec = d.querySelector('[data-story]');
if (!sec) return;
var $ = function (s, r) { return [].slice.call((r || d).querySelectorAll(s)); };
var liste = sec.querySelector('.story-liste'), buehne = sec.querySelector('.story-buehne');
var st = $('.st', sec), kap = $('.story-kapitel a', sec), n = st.length;
var breit = w.matchMedia('(min-width:900px)'), ruhig = w.matchMedia('(prefers-reduced-motion: reduce)');
var fenster = null, vorn = null, hinten = null, zahl = null, ist = -1, nah = false, kapIst = null;
function setzeKapitel(k) {
if (k === kapIst) return;
kapIst = k;
kap.forEach(function (a) { if (a.getAttribute('data-kap') === k) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current'); });
}
function baue() {
fenster = d.createElement('div');
fenster.className = 'story-fenster';
fenster.setAttribute('aria-hidden', 'true');
var ki = st[0].querySelector('figcaption').textContent;
fenster.innerHTML = '<div class="sf-rahmen"><div class="sf-box"><img alt="" decoding="async"><img alt="" decoding="async"></div></div>' +
'<p class="sf-fuss"><span class="ki-hinweis"></span><span class="sf-zahl"></span></p>';
fenster.querySelector('.ki-hinweis').textContent = ki;
var imgs = fenster.querySelectorAll('img');
vorn = imgs[0]; hinten = imgs[1]; zahl = fenster.querySelector('.sf-zahl');
buehne.insertBefore(fenster, liste);
}
function zeige(i) {
if (i === ist || !fenster) return;
if (ist >= 0) st[ist].classList.remove('ist');
ist = i;
st[i].classList.add('ist');
setzeKapitel(st[i].getAttribute('data-kap'));
zahl.textContent = (i < 9 ? '0' : '') + (i + 1) + ' / ' + n;
var q = st[i].querySelector('img'), neu = hinten, alt = vorn, ziel = i;
neu.onload = function () {
if (ziel !== ist) return;
neu.classList.add('an'); alt.classList.remove('an');
vorn = neu; hinten = alt;
};
neu.sizes = q.getAttribute('sizes');
neu.srcset = q.getAttribute('srcset');
neu.src = q.getAttribute('src');
}
function lesen() {
if (!sec.classList.contains('story-an')) {
var schritt = st[1] ? st[1].offsetLeft - st[0].offsetLeft : 1;
var k = Math.max(0, Math.min(n - 1, Math.round(liste.scrollLeft / (schritt || 1))));
setzeKapitel(st[k].getAttribute('data-kap'));
return;
}
if (!nah) return;
var mitte = w.innerHeight / 2, best = 0, abst = 1e9;
st.forEach(function (el, i) {
var r = el.getBoundingClientRect(), a = Math.abs(r.top + r.height / 2 - mitte);
if (a < abst) { abst = a; best = i; }
});
zeige(best);
}
function modus() {
var an = breit.matches && !ruhig.matches;
sec.classList.toggle('story-an', an);
if (an && !fenster) baue();
if (an && nah) { ist = -1; lesen(); }
if (!an) lesen();
}
/* Bildfeld erst in der Nähe füllen (spart das erste Laden der Startseite) */
if ('IntersectionObserver' in w) {
new IntersectionObserver(function (es) {
es.forEach(function (e) { nah = e.isIntersecting; if (nah) lesen(); });
}, { rootMargin: '300px 0px 300px 0px' }).observe(sec);
} else nah = true;
kap.forEach(function (a) {
a.addEventListener('click', function (e) {
var z = d.getElementById(a.getAttribute('href').slice(1));
if (!z) return;
e.preventDefault();
var art = ruhig.matches ? 'auto' : 'smooth';
if (sec.classList.contains('story-an')) {
var r = z.getBoundingClientRect();
w.scrollTo({ top: w.scrollY + r.top + r.height / 2 - w.innerHeight / 2, behavior: art });
} else {
var links = z.getBoundingClientRect().left - liste.getBoundingClientRect().left + liste.scrollLeft;
liste.scrollTo({ left: links - parseFloat(getComputedStyle(liste).paddingLeft || 0), behavior: art });
var rb = buehne.getBoundingClientRect(), kopf = d.querySelector('.kopf-in');
var oben = (kopf ? kopf.offsetHeight : 0) + 16;
if (rb.top < oben || rb.bottom > w.innerHeight) w.scrollTo({ top: w.scrollY + rb.top - oben - 60, behavior: art });
}
setzeKapitel(a.getAttribute('data-kap'));
});
});
var tick = false;
function anfordern() { if (!tick) { tick = true; w.requestAnimationFrame(function () { tick = false; lesen(); }); } }
w.addEventListener('scroll', anfordern, { passive: true });
liste.addEventListener('scroll', anfordern, { passive: true });
var rt;
w.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(modus, 150); });
modus();
setzeKapitel(st[0].getAttribute('data-kap'));
})();