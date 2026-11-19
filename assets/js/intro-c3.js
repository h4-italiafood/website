(function () {
'use strict';
if (!window.H4Intro) return;
var d = document, sc = d.currentScript, bildMuster = (sc && sc.dataset.pizza) || 'assets/img/gerichte/pizza-margherita-{b}.webp';
H4Intro.start('c3', function (k) {
var ov = k.ov, W = k.W, H = k.H, S = Math.round(Math.min(W * .64, H * .4, 420)), h = Math.round(S * .115),
x0 = (W - S) / 2, y0 = H * .5 + S * .3 - S / 2, r = S * .028;
var hb = d.querySelector('[data-naht] img'), foto = hb ? (hb.currentSrc || hb.src) : '', z = k.ziel(), kl = d.querySelector('[data-logo-marke]');
var b = function (n) { return bildMuster.replace('{b}', n); }, LOGO = '<svg viewBox="110 212 597 595"><use href="#h4p-r"/><use href="#h4p-z"/></svg>';
ov.style.setProperty('--h', h + 'px'); ov.style.perspective = Math.round(S * 3.4) + 'px';
ov.innerHTML =
'<div class="k3-flaeche"></div><div class="kt-kamera"><div class="k3-szene">' +
'<div class="k3-weit"></div><div class="k3-nah"></div>' +
'<div class="k2-box"><div class="k2-boden">' + (foto ? '<img class="kt-foto" alt="" src="' + foto + '">' : '') +
'<img class="kt-pizza" alt="" decoding="sync" src="' + b(360) + '" srcset="' + b(360) + ' 360w, ' + b(720) + ' 720w" sizes="' + Math.round(S * .85) + 'px">' +
'<i class="k2-schatten"></i></div>' +
'<i class="k2-w k2-hi"></i><i class="k2-w k2-li"></i><i class="k2-w k2-re"></i><i class="k2-w k2-vo"></i></div>' +
'<div class="k2-deckel"><div class="k2-aussen"></div><div class="k2-innen"></div><i class="k2-lippe"></i><i class="k2-lippe k2-ll"></i><i class="k2-lippe k2-lr"></i>' +
'<div class="k2-logo k3-druck">' + LOGO + '</div></div></div>' +
'<div class="k2-logo k3-flug">' + LOGO + '</div></div><div class="k3-blende"></div>';
var q = function (s) { return ov.querySelector(s); }, kam = q('.kt-kamera'), szene = q('.k3-szene'), box = q('.k2-box'), boden = q('.k2-boden'), pizza = q('.kt-pizza'),
bild = q('.kt-foto'), deckel = q('.k2-deckel'), druck = q('.k3-druck'), flug = q('.k3-flug'), weit = q('.k3-weit'), nah = q('.k3-nah'), flaeche = q('.k3-flaeche'),
RUHIG = 'cubic-bezier(.16,1,.3,1)', WEICH = 'cubic-bezier(.22,1,.36,1)', GLEICH = 'cubic-bezier(.45,.05,.25,1)';
function px(o) { for (var n in o) o[n] += 'px'; return o; }
function an(el, kf, o) { o.fill = o.fill || 'both'; return el.animate(kf, o); }
[box, deckel, weit, nah, flug].forEach(function (el) { Object.assign(el.style, px({ left: x0, top: y0, width: S, height: S })); });
Object.assign(boden.style, px({ left: r, top: r, right: r, bottom: r }));
/* Die Pizza ist eine Fläche in Bildgröße (freigestellt, 708 × 720 px), damit sie beim Gleiten frei wandert und skaliert.
Im Karton: 88 % der Bodenhöhe, mittig (wie vorher mit padding 6 %). Gedreht wie im Hero-Foto: dort liegt dasselbe Pizzafoto
(gemessen 18.11.2026 per Bildregistrierung: Bildbreite 51,32 % der Fotobreite, Mitte 50,06 % / 50,12 %, 30,5 Grad gegen den Uhrzeiger). */
var PZ = { w: .51315, x: .50062, y: .50124, dreh: -30.5, ar: 708 / 720, fw: 1600, fh: 1074 },
B0 = S - 2 * r, ph0 = B0 * .88, pw0 = ph0 * PZ.ar, pz0 = px({ left: (B0 - pw0) / 2, top: (B0 - ph0) / 2, width: pw0, height: ph0 });
Object.assign(pizza.style, pz0); pizza.style.rotate = PZ.dreh + 'deg';
szene.style.transformOrigin = (x0 + S / 2) + 'px ' + (y0 + S / 2) + 'px';
flug.style.visibility = 'hidden';
function blick(p) { return 'translate3d(0px,' + p[3] + 'px,' + p[2] + 'px) rotateX(' + p[0] + 'deg) rotateZ(' + p[1] + 'deg)'; }
function klappe(auf) { return 'translateZ(' + (h + 1) + 'px) translateY(-50%) rotateX(' + auf + 'deg) translateY(50%)'; }
var VON = [58, -8, -S * .16, S * .1], BL = [52, -4, 0, 0], FLACH = [0, 0, 0, 0], AUF = 106, AB = 30, T_AUF = 480, D_AUF = 680;
/* 0 bis 0,75 s: der Karton schwebt herein, die Kamera bewegt sich nur um wenige Grad */
an(q('.k3-blende'), { opacity: [1, 0] }, { duration: 520, easing: 'ease-out' });
an(szene, { transform: [blick(VON), blick(BL)] }, { duration: 900, easing: RUHIG });
/* 0,48 bis 1,16 s: Deckel öffnet gleichmäßig am hinteren Scharnier, ohne Nachfedern. Schatten wandern leise mit. */
deckel.style.transform = klappe(0);
var oeffnen = an(deckel, { transform: [klappe(0), klappe(AUF)] }, { duration: D_AUF, delay: T_AUF, easing: GLEICH });
an(q('.k2-schatten'), { opacity: [1, 0] }, { duration: D_AUF, delay: T_AUF + 60, easing: 'ease-out' });
an(weit, { translate: ['0px ' + S * .16 + 'px', '0px ' + S * .02 + 'px'], scale: ['1.08 1', '1.1 1.28'] }, { duration: D_AUF, delay: T_AUF, easing: GLEICH });
/* Das Zeichen bleibt auf dem Deckel, bis er rund 30 Grad offen ist (bei 40 Grad stünde er schon auf der Kante),
löst sich dann und gleitet ohne Bogen auf die Bildmarke in der Kopfzeile. Weiß wird dabei zu Tinte. */
var lr = kl ? kl.getBoundingClientRect() : null, raf = 0, los = false;
function abheben() {
var t = oeffnen.effect.getComputedTiming().progress || 0, w = t * AUF;
if (w < AB && !los) { raf = requestAnimationFrame(abheben); return; }
if (los) return; los = true;
druck.style.visibility = 'hidden';
if (!(lr && lr.width)) return;
flug.style.visibility = 'visible';
var ls = lr.width * 597 / 600 + 'px', o = { duration: 960, easing: 'cubic-bezier(.35,0,.15,1)', fill: 'forwards' }, weiss = getComputedStyle(flug).color;
an(flug, { transform: [blick(BL) + ' ' + klappe(w) + ' translateZ(4px)',
blick([BL[0] * .62, BL[1] * .6, S * .34, 0]) + ' translateZ(' + h * .6 + 'px) translateY(-50%) rotateX(' + w * .25 + 'deg) translateY(50%) translateZ(2px)',
blick(FLACH) + ' translateZ(0px) translateY(-50%) rotateX(0deg) translateY(50%) translateZ(0px)'], offset: [0, .34, 1] }, o);
an(flug, { left: [x0 + 'px', lr.left + 'px'], top: [y0 + 'px', lr.top + 'px'], width: [S + 'px', ls], height: [S + 'px', ls] }, o);
an(flug, { color: [weiss, weiss, '#111111', '#111111'], offset: [0, .02, .17, 1] }, o);
an(flug.firstChild, { left: ['16%', '0%'], top: ['16%', '0%'], width: ['68%', '100%'], height: ['68%', '100%'] }, o);
}
raf = requestAnimationFrame(abheben);
/* Zeiger oder Neigen kippt die Szene minimal */
var landet = false;
function kipp(x, y) { if (landet) return; kam.style.setProperty('--kx', (Math.max(-1, Math.min(1, x)) * .45).toFixed(3)); kam.style.setProperty('--ky', (Math.max(-1, Math.min(1, y)) * .45).toFixed(3)); }
function zeiger(e) { kipp(e.clientX / W * 2 - 1, e.clientY / H * 2 - 1); }
function neigen(e) { if (e.gamma != null) kipp(e.gamma / 25, (e.beta - 45) / 25); }
addEventListener('pointermove', zeiger, { passive: true }); addEventListener('deviceorientation', neigen);
/* 1,2 s: Seite klickbar. Die Pizza bleibt im offenen Karton liegen (kein Foto mehr über ihr). */
var T_FREI = 1200, T = 1420, DAUER = 900, RUHE = 400, UEBER = 620, AUS = 160, uhr2 = 0, uhr3 = 0, uhr5 = 0;
uhr3 = setTimeout(function () { k.frei(); k.fest(); }, T_FREI);
/* Grund deckt die Seite, bis der Karton fast im Hero-Rahmen liegt (vorher schienen Text und Buttons durch);
erst in den letzten 30 % des Gleitens blendet er weg. */
an(flaeche, { opacity: [1, 0] }, { duration: Math.round(DAUER * .3) + 240, delay: T + Math.round(DAUER * .7), easing: 'ease-in-out' });
/* ab 1,42 s: der Karton gleitet in den Hero-Rahmen, die Pizza fährt mit und landet auf ihrem Platz im Foto.
Ab 1,92 s blendet das Hero-Foto unter der Pizza ein (Teller und Tisch erscheinen, der Salat liegt noch unter der Pizza).
2,32 s Landung, 400 ms Ruhe, dann blendet nur die Pizza aus: links bleibt dieselbe Pizza, rechts kommt der Salat dazu.
Danach liegt der echte Rahmen deckungsgleich darunter, das Overlay blendet kurz auf 0 und wird erst dann entfernt. */
/* 160 ms vor dem Flug: Schatten, Wände und Deckel blenden einzeln aus, damit beim Gleiten nur noch Boden und Foto unterwegs sind */
var uhr4 = setTimeout(function () {
var kurz = { duration: 260, easing: 'ease-out' }, unscharf = k.mobil ? 'blur(0px)' : 'blur(5px)';
an(weit, { opacity: [1, 0] }, kurz); an(nah, { opacity: [1, 0] }, kurz);
[].forEach.call(ov.querySelectorAll('.k2-w'), function (w) {
['::before', '::after'].forEach(function (ps) { w.animate({ opacity: [1, 0] }, { duration: 260, easing: 'ease-out', fill: 'both', pseudoElement: ps }); });
});
[].forEach.call(deckel.children, function (f) { an(f, { opacity: [1, 0], filter: ['blur(0px)', unscharf] }, kurz); });
}, T - 160);
var uhr = setTimeout(function () {
landet = true; kam.style.setProperty('--kx', 0); kam.style.setProperty('--ky', 0);
var o = { duration: DAUER, easing: WEICH }, kurz = { duration: 280, easing: 'ease-out' }, unscharf = k.mobil ? 'blur(0px)' : 'blur(5px)';
if (z && z.width) {
var p = z.width * .042 + 'px', rr = r + 'px';
an(szene, { transform: [blick(BL), blick(FLACH)] }, o);
an(box, { left: [x0 + 'px', z.left + 'px'], top: [y0 + 'px', z.top + 'px'], width: [S + 'px', z.width + 'px'], height: [S + 'px', z.height + 'px'] }, o);
an(box, { backgroundColor: [getComputedStyle(box).backgroundColor, '#111111'] }, { duration: 460, delay: 140, easing: 'ease-out' });
an(boden, { left: [rr, p], top: [rr, p], right: [rr, p], bottom: [rr, p] }, o);
/* Zielplatz der Pizza im Boden, wie das Foto dort liegt (object-fit: cover, gilt für jede Breite) */
var bw = z.width - 2 * z.width * .042, bh = z.height - 2 * z.width * .042, fs = Math.max(bw / PZ.fw, bh / PZ.fh),
fx = (bw - PZ.fw * fs) / 2, fy = (bh - PZ.fh * fs) / 2, pw1 = PZ.w * PZ.fw * fs, ph1 = pw1 / PZ.ar,
pz1 = px({ left: fx + PZ.x * PZ.fw * fs - pw1 / 2, top: fy + PZ.y * PZ.fh * fs - ph1 / 2, width: pw1, height: ph1 });
an(pizza, { left: [pz0.left, pz1.left], top: [pz0.top, pz1.top], width: [pz0.width, pz1.width], height: [pz0.height, pz1.height],
filter: ['drop-shadow(0 6px 10px rgba(17,17,17,.2))', 'drop-shadow(0 2px 4px rgba(17,17,17,.14))'] }, o);
if (bild) an(bild, { opacity: [0, 1] }, { duration: 450, delay: 500, easing: 'ease-out' });
uhr2 = setTimeout(function () {
if (bild) an(pizza, { opacity: [1, 0] }, { duration: UEBER, easing: 'ease-in-out' });
uhr5 = setTimeout(function () {
d.documentElement.classList.remove('intro-liefert');
an(ov, { opacity: [1, 0] }, { duration: AUS, easing: 'ease-out' });
}, bild ? UEBER : 0);
}, DAUER + RUHE);
} else an(box, { opacity: [1, 0] }, kurz);
}, T);
k.weg(function () { clearTimeout(uhr); clearTimeout(uhr2); clearTimeout(uhr3); clearTimeout(uhr4); clearTimeout(uhr5); cancelAnimationFrame(raf); removeEventListener('pointermove', zeiger); removeEventListener('deviceorientation', neigen); });
return T + DAUER + RUHE + UEBER + AUS + 20;
});
})();