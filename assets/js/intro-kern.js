(function () {
'use strict';
var d = document, h = d.documentElement;
function melden(name, detail) { d.dispatchEvent(new CustomEvent(name, { detail: detail })); }
window.H4Intro = {
start: function (variante, bauen) {
var info = { variante: variante, grund: 'aus' };
if (!h.classList.contains('intro-an')) { h.classList.add('intro-ende'); melden('h4:intro-ende', info); return; }
try { sessionStorage.setItem('h4-intro', '1'); } catch (e) {}
var ov = d.createElement('div'), sk = d.createElement('button'), fertig = false, weg = [], uhr = 0;
ov.className = 'intro intro-' + variante; ov.setAttribute('aria-hidden', 'true');
sk.className = 'intro-skip'; sk.type = 'button'; sk.textContent = h.getAttribute('data-intro-skip') || 'Überspringen';
d.body.appendChild(ov); d.body.appendChild(sk); h.classList.add('intro-da');
function ende(grund) {
if (fertig) return; fertig = true; clearTimeout(uhr);
h.classList.add('naht-los', 'naht-fest', 'intro-ende'); h.classList.remove('intro-an');
hoerer.forEach(function (x) { removeEventListener(x[0], x[1], x[2]); });
weg.forEach(function (f) { try { f(); } catch (e) {} });
sk.remove();
if (grund === 'fertig' || !ov.animate) ov.remove();
else { ov.style.pointerEvents = 'none'; ov.animate({ opacity: [1, 0] }, { duration: 160, fill: 'forwards' }).onfinish = function () { ov.remove(); }; setTimeout(function () { ov.remove(); }, 400); }
info.grund = grund || 'fertig'; melden('h4:intro-ende', info);
}
function skip() { ende('skip'); }
var hoerer = [
['pointerdown', skip, true], ['wheel', skip, { passive: true }], ['touchmove', skip, { passive: true }], ['scroll', skip, { passive: true }],
['keydown', function (e) { if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') skip(); }, true]
];
hoerer.forEach(function (x) { addEventListener(x[0], x[1], x[2]); });
var k = {
ov: ov, skip: sk, W: innerWidth, H: innerHeight, mobil: innerWidth < 900, ende: ende,
weg: function (f) { weg.push(f); },
frei: function () { if (fertig) return; ov.style.pointerEvents = 'none'; h.classList.add('intro-frei'); melden('h4:intro-frei', info); },
naht: function () { h.classList.add('naht-los'); },
fest: function () { h.classList.add('naht-fest', 'naht-los', 'intro-liefert'); },
ziel: function () { var z = d.querySelector('[data-naht] .naht-rahmen'); return z ? z.getBoundingClientRect() : null; }
};
var dauer = 0;
try { dauer = bauen(k) || 0; } catch (e) { ende('fehler'); return; }
uhr = setTimeout(function () { ende('fertig'); }, Math.min(dauer || 0, 3600));
}
};
})();