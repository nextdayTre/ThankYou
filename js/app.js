/* Citation Globe — app logic. Data lives in data/citations.js, not here. */
(function () {
  'use strict';

  var CFG = Object.assign({
    pageTitle: document.title, bannerText: 'CURRENT INSPIRATIONS', bannerSubtitle: '', intro: '', showExampleBadges: true
  }, window.CITATION_GLOBE_CONFIG || {});
  var ENTRIES = (window.CITATIONS || []).slice();
  var $ = function (id) { return document.getElementById(id); };
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Static text from config ---------- */
  document.title = CFG.pageTitle;
  $('bannerText').textContent = CFG.bannerText;
  $('bannerSub').textContent = CFG.bannerSubtitle;
  $('bannerSub').hidden = !CFG.bannerSubtitle;
  if (CFG.intro) $('introText').textContent = CFG.intro;

  /* ---------- Country name handling ---------- */
  // Friendly aliases -> Natural Earth names used by the map.
  var ALIASES = {
    'usa': 'United States of America', 'us': 'United States of America', 'united states': 'United States of America', 'america': 'United States of America',
    'uk': 'United Kingdom', 'great britain': 'United Kingdom', 'england': 'United Kingdom', 'scotland': 'United Kingdom', 'wales': 'United Kingdom',
    'czech republic': 'Czechia', 'russian federation': 'Russia', 'south korea': 'South Korea', 'korea': 'South Korea',
    'the netherlands': 'Netherlands', 'holland': 'Netherlands', 'ivory coast': "Côte d'Ivoire", 'burma': 'Myanmar', 'turkey': 'Türkiye', 'turkiye': 'Türkiye',
    'bosnia': 'Bosnia and Herz.', 'bosnia and herzegovina': 'Bosnia and Herz.', 'dominican republic': 'Dominican Rep.', 'eswatini': 'eSwatini', 'swaziland': 'eSwatini',
    'democratic republic of the congo': 'Dem. Rep. Congo', 'drc': 'Dem. Rep. Congo', 'republic of the congo': 'Congo', 'north macedonia': 'North Macedonia',
    'central african republic': 'Central African Rep.', 'south sudan': 'S. Sudan', 'western sahara': 'W. Sahara', 'czechoslovakia': 'Czechia'
  };
  var norm = function (s) { return String(s || '').trim().toLowerCase(); };

  var geo = (window.COUNTRIES_GEOJSON || { features: [] }).features;
  var featureByName = {};
  geo.forEach(function (f) { featureByName[norm(f.properties.name)] = f; });
  function canonicalCountry(name) {
    var n = norm(name);
    if (featureByName[n]) return featureByName[n].properties.name;
    if (ALIASES[n] && featureByName[norm(ALIASES[n])]) return ALIASES[n];
    return null;
  }

  // Normalise + validate entries.
  var byCountry = {};   // canonical country name -> entries[]
  ENTRIES.forEach(function (e) {
    e.links = Array.isArray(e.links) ? e.links : [];
    e.tags = Array.isArray(e.tags) ? e.tags : [];
    e._country = canonicalCountry(e.country);
    if (!e._country) {
      console.warn('[citation-globe] Entry "' + e.id + '" has unknown country "' + e.country + '". The marker will still show, but the country will not be clickable. See README → Country names.');
      e._country = e.country;
    }
    (byCountry[e._country] = byCountry[e._country] || []).push(e);
  });
  var entryById = {};
  ENTRIES.forEach(function (e) { entryById[e.id] = e; });
  function sortYear(e) { var y = parseFloat(String(e.year).replace(/[^\d.\-]/g, '')); if (/bc/i.test(String(e.year))) y = -Math.abs(y); return isNaN(y) ? 1e9 : y; }
  var sorted = ENTRIES.slice().sort(function (a, b) { return sortYear(a) - sortYear(b); });

  // Group entries into markers by exact location.
  var markers = [];
  (function () {
    var m = {};
    ENTRIES.forEach(function (e) {
      var k = e.lat + ',' + e.lon + ',' + e.place;
      if (!m[k]) { m[k] = { lat: +e.lat, lng: +e.lon, place: e.place || e._country, entries: [], country: e._country }; markers.push(m[k]); }
      m[k].entries.push(e);
    });
  })();

  /* ---------- Sound (off by default; synthesised, no files) ---------- */
  var audio = { on: false, ctx: null };
  function tone(freq, t0, dur, vol, type) {
    var c = audio.ctx, o = c.createOscillator(), g = c.createGain();
    o.type = type || 'sine'; o.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, c.currentTime + t0);
    g.gain.exponentialRampToValueAtTime(vol, c.currentTime + t0 + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + t0 + dur);
    o.connect(g); g.connect(c.destination); o.start(c.currentTime + t0); o.stop(c.currentTime + t0 + dur + 0.05);
  }
  var SFX = {
    hover: function () { tone(1318, 0, 0.09, 0.035, 'sine'); },
    open: function () { tone(784, 0, 0.18, 0.07); tone(1047, 0.07, 0.2, 0.07); tone(1568, 0.14, 0.32, 0.06); },
    close: function () { tone(1047, 0, 0.14, 0.06); tone(698, 0.07, 0.22, 0.06); },
    nope: function () { tone(330, 0, 0.16, 0.05, 'triangle'); },
    whoosh: function () { tone(520, 0, 0.35, 0.03, 'sine'); tone(780, 0.1, 0.35, 0.03, 'sine'); }
  };
  function sfx(name) { if (audio.on && audio.ctx) { try { SFX[name](); } catch (e) { /* ignore */ } } }
  $('soundBtn').addEventListener('click', function () {
    audio.on = !audio.on;
    if (audio.on && !audio.ctx) { var AC = window.AudioContext || window.webkitAudioContext; if (AC) audio.ctx = new AC(); }
    if (audio.ctx && audio.ctx.state === 'suspended') audio.ctx.resume();
    this.setAttribute('aria-pressed', String(audio.on));
    this.setAttribute('aria-label', audio.on ? 'Turn UI sounds off' : 'Turn UI sounds on');
    this.title = 'UI sounds (' + (audio.on ? 'on' : 'off') + ')';
    sfx('open');
  });

  /* ---------- Starfield ---------- */
  (function stars() {
    var cv = $('stars'), cx = cv.getContext('2d'), S = [], W = 0, H = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
    function build() {
      W = window.innerWidth; H = window.innerHeight;
      cv.width = W * dpr; cv.height = H * dpr; cx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = Math.round(W * H / 2600); S = [];
      for (var i = 0; i < n; i++) S.push({ x: Math.random() * W, y: Math.random() * H, r: Math.random() < .06 ? 1.7 : Math.random() * 1.1 + .25, p: Math.random() * 6.28, s: .4 + Math.random() * 1.4, b: Math.random() < .12 ? 1 : 0 });
    }
    var last = 0;
    function draw(t) {
      if (t - last > 60) {
        last = t; cx.clearRect(0, 0, W, H);
        for (var i = 0; i < S.length; i++) {
          var s = S[i], a = reduceMotion ? .7 : .45 + .45 * Math.sin(t / 1000 * s.s + s.p);
          cx.fillStyle = s.b ? 'rgba(190,220,255,' + a + ')' : 'rgba(255,255,255,' + a * .85 + ')';
          cx.beginPath(); cx.arc(s.x, s.y, s.r, 0, 6.2832); cx.fill();
        }
      }
      requestAnimationFrame(draw);
    }
    window.addEventListener('resize', build); build(); requestAnimationFrame(draw);
  })();

  /* ---------- Helpers ---------- */
  function el(tag, cls, text) { var n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; }
  function safeUrl(u) { return /^https?:\/\//i.test(u) ? u : '#'; }
  var toastT;
  function toast(msg) { var t = $('toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(function () { t.classList.remove('show'); }, 2400); }

  if (typeof Globe !== 'function') { fatal('Could not load the globe library.'); return; }
  function fatal(msg) {
    var d = el('div', 'fatal'); d.appendChild(el('div', null, msg)); d.appendChild(el('small', null, 'Try a different browser, or make sure WebGL is enabled.'));
    document.body.appendChild(d); $('loading').remove();
  }

  /* ---------- State ---------- */
  var hoverPoly = null, selectedCountry = null, activeMarker = null, panelOpen = false, resumeTimer = null, interacted = false;
  var ALT = { base: 0.005, hover: 0.022, selected: 0.03 };

  /* ---------- Globe ---------- */
  var globeEl = $('globe');
  var world;
  try {
    world = Globe({ animateIn: false, rendererConfig: { antialias: true, alpha: true, powerPreference: 'high-performance' } })(globeEl);
  } catch (err) { console.error(err); fatal('Your browser could not start WebGL.'); return; }

  function hasEntries(f) { return !!byCountry[f.properties.name]; }
  function capColor(f) {
    var n = f.properties.name, has = hasEntries(f);
    if (n === selectedCountry) return 'rgba(255,226,70,0.55)';
    if (f === hoverPoly) return has ? 'rgba(255,240,120,0.50)' : 'rgba(255,255,255,0.30)';
    return has ? 'rgba(255,225,80,0.20)' : 'rgba(255,255,255,0.004)';
  }
  function strokeColor(f) { return hasEntries(f) ? 'rgba(255,245,170,0.9)' : 'rgba(255,255,255,0.38)'; }
  function altitude(f) { return f.properties.name === selectedCountry ? ALT.selected : (f === hoverPoly ? ALT.hover : ALT.base); }
  function refreshPolys() { world.polygonCapColor(capColor).polygonAltitude(altitude); }

  world
    .backgroundColor('rgba(0,0,0,0)')
    .globeImageUrl('assets/earth-wii.jpg')
    .showAtmosphere(true).atmosphereColor('#52b4ff').atmosphereAltitude(0.24)
    .polygonsData(geo)
    .polygonCapColor(capColor)
    .polygonSideColor(function () { return 'rgba(255,255,255,0.05)'; })
    .polygonStrokeColor(strokeColor)
    .polygonAltitude(altitude)
    .polygonsTransitionDuration(180)
    .polygonLabel(function (f) {
      var list = byCountry[f.properties.name];
      return '<div class="tip">' + escapeHtml(f.properties.name) + (list ? '<span>' + list.length + (list.length === 1 ? ' inspiration' : ' inspirations') + '</span>' : '') + '</div>';
    })
    .onPolygonHover(function (f) {
      hoverPoly = f || null;
      globeEl.classList.toggle('hovering', !!f);
      if (f && hasEntries(f)) sfx('hover');
      refreshPolys();
    })
    .onPolygonClick(function (f, ev, coords) {
      var list = byCountry[f.properties.name];
      if (!list) { toast('No inspirations in ' + f.properties.name + ' yet… maybe soon!'); sfx('nope'); return; }
      openCountry(f.properties.name, null, true);
    })
    .onGlobeClick(function () { if (panelOpen) closePanel(); })
    .htmlElementsData(markers)
    .htmlLat('lat').htmlLng('lng').htmlAltitude(0.012)
    .htmlElement(function (m) {
      var d = el('div', 'marker'); d.setAttribute('role', 'button'); d.setAttribute('tabindex', '-1');
      d.setAttribute('aria-label', m.place + ': ' + m.entries.length + (m.entries.length === 1 ? ' inspiration' : ' inspirations'));
      var pin = el('span', 'pin'); pin.appendChild(el('b')); pin.appendChild(el('b')); pin.appendChild(el('i'));
      var lbl = el('span', 'lbl', m.place);
      if (m.entries.length > 1) lbl.appendChild(el('small', null, String(m.entries.length)));
      d.appendChild(pin); d.appendChild(lbl);
      d.addEventListener('click', function (e) { e.stopPropagation(); openCountry(m.country, m.entries[0].id, true, m); });
      d.addEventListener('mouseenter', function () { sfx('hover'); });
      m._el = d; return d;
    })
    .htmlElementVisibilityModifier(function (d, vis) { d.classList.toggle('hidden', !vis); });

  function escapeHtml(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }

  /* Camera & controls */
  var controls = world.controls();
  controls.enableDamping = true; controls.dampingFactor = 0.07;
  controls.autoRotate = !reduceMotion; controls.autoRotateSpeed = 0.3;
  controls.minDistance = 135; controls.maxDistance = 520; controls.zoomSpeed = 0.7; controls.rotateSpeed = 0.55;
  controls.enablePan = false;
  function scheduleResume(ms) {
    clearTimeout(resumeTimer);
    resumeTimer = setTimeout(function () { if (!panelOpen && !reduceMotion) controls.autoRotate = true; }, ms);
  }
  controls.addEventListener('start', function () {
    controls.autoRotate = false; clearTimeout(resumeTimer);
    if (!interacted) { interacted = true; setTimeout(function () { $('hint').classList.add('gone'); }, 1600); }
  });
  controls.addEventListener('end', function () { scheduleResume(5000); });

  // Responsive sizing
  function resize() { world.width(window.innerWidth).height(window.innerHeight); }
  window.addEventListener('resize', resize); resize();

  // Glossy ocean: shininess + ocean-only specular map (best-effort).
  world.onGlobeReady(function () {
    try {
      var mat = world.globeMaterial();
      mat.shininess = 30; mat.specular.set(0x7fb8ff);
      var img = new Image();
      img.onload = function () {
        if (!mat.map) return;
        var T = mat.map.constructor, t = new T(img); t.needsUpdate = true; mat.specularMap = t; mat.needsUpdate = true;
      };
      img.src = 'assets/ocean-mask.png';
    } catch (e) { console.warn('gloss skipped', e); }
    // fly in
    world.pointOfView({ lat: 20, lng: 5, altitude: 6 }, 0);
    world.pointOfView({ lat: 28, lng: 18, altitude: window.innerWidth < window.innerHeight ? 3.1 : 2.15 }, reduceMotion ? 0 : 2600);
    setTimeout(function () { $('loading').classList.add('done'); }, 150);
    setTimeout(function () { if ($('loading')) $('loading').remove(); }, 1200);
    var h = decodeURIComponent((location.hash || '').slice(1));
    if (h && entryById[h]) setTimeout(function () { flyToEntry(entryById[h], true); }, 900);
    if (window.__globeReady) window.__globeReady();
  });
  window.addEventListener('webglcontextlost', function (e) { e.preventDefault(); });

  /* ---------- Panel ---------- */
  var panel = $('panel');
  function renderPanel(country, focusId) {
    var list = (byCountry[country] || []).slice().sort(function (a, b) { return sortYear(a) - sortYear(b); });
    $('panelTitle').textContent = country;
    $('panelSub').textContent = list.length + (list.length === 1 ? ' inspiration' : ' inspirations');
    var box = $('panelEntries'); box.textContent = '';
    list.forEach(function (e) {
      var c = el('article', 'card' + (e.id === focusId ? ' focus' : '')); c.dataset.id = e.id;
      if (e.example && CFG.showExampleBadges) c.appendChild(el('div', 'badge-ex', 'Example entry'));
      c.appendChild(el('h3', null, e.title));
      var by = el('p', 'by', e.creator); by.appendChild(el('span', 'yr', String(e.year))); c.appendChild(by);
      var where = [e.place, e._country].filter(Boolean).join(', ');
      c.appendChild(el('p', 'where', where));
      if (e.description) c.appendChild(el('p', 'desc', e.description));
      if (e.links.length) {
        var ls = el('div', 'links');
        e.links.forEach(function (l) {
          var a = el('a', 'link-pill'); a.href = safeUrl(l.url); a.target = '_blank'; a.rel = 'noopener noreferrer';
          a.appendChild(el('span', null, l.label || l.url));
          a.insertAdjacentHTML('beforeend', '<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path d="M7 17L17 7M9 7h8v8" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>');
          ls.appendChild(a);
        });
        c.appendChild(ls);
      }
      if (e.tags.length) { var tg = el('div', 'tags'); e.tags.forEach(function (t) { tg.appendChild(el('span', 'tag', '#' + t)); }); c.appendChild(tg); }
      box.appendChild(c);
    });
    var f = box.querySelector('.card.focus'); box.scrollTop = f ? Math.max(0, f.offsetTop - 70) : 0;
  }
  function showPanel() {
    panel.hidden = false; panel.setAttribute('aria-hidden', 'false');
    requestAnimationFrame(function () { requestAnimationFrame(function () { panel.classList.add('open'); }); });
    panelOpen = true; controls.autoRotate = false; clearTimeout(resumeTimer);
  }
  function openCountry(country, focusId, fly, marker) {
    var list = byCountry[country];
    if (!list) return;
    if (!focusId && marker) focusId = marker.entries[0].id;
    var wasOpen = panelOpen;
    selectedCountry = country; refreshPolys();
    renderPanel(country, focusId);
    setActiveMarker(marker || markerFor(focusId ? entryById[focusId] : list[0]));
    if (!wasOpen) sfx('open');
    showPanel();
    if (focusId) history.replaceState(null, '', '#' + encodeURIComponent(focusId));
    if (fly) {
      var tgt = marker ? { lat: marker.lat, lng: marker.lng } : centroid(list);
      var alt = Math.max(Math.min(world.pointOfView().altitude, 1.7), 0.9);
      world.pointOfView(viewFor(tgt.lat, tgt.lng, alt), reduceMotion ? 0 : 1200);
    }
  }
  // On narrow screens the panel is a bottom sheet, so aim the camera a bit south of the target
  // (which lifts the target into the visible upper half) and stay slightly further out.
  function viewFor(lat, lng, alt) {
    if (window.innerWidth < 760) { alt = Math.max(alt, 2.0); lat = Math.max(-80, lat - 24); }
    return { lat: lat, lng: lng, altitude: alt };
  }
  function centroid(list) {
    var la = 0, lo = 0; list.forEach(function (e) { la += +e.lat; lo += +e.lon; });
    return { lat: la / list.length, lng: lo / list.length };
  }
  function markerFor(e) { for (var i = 0; i < markers.length; i++) if (markers[i].entries.indexOf(e) > -1) return markers[i]; return null; }
  function setActiveMarker(m) {
    if (activeMarker && activeMarker._el) activeMarker._el.classList.remove('active');
    activeMarker = m || null; if (m && m._el) m._el.classList.add('active');
  }
  function closePanel() {
    if (!panelOpen) return;
    panelOpen = false; panel.classList.remove('open'); panel.setAttribute('aria-hidden', 'true');
    setTimeout(function () { if (!panelOpen) panel.hidden = true; }, 320);
    selectedCountry = null; setActiveMarker(null); refreshPolys(); sfx('close');
    history.replaceState(null, '', location.pathname + location.search);
    scheduleResume(2500);
  }
  $('panelClose').addEventListener('click', closePanel);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closePanel(); });

  function flyToEntry(e, openIt) {
    sfx('whoosh');
    interactedHide();
    var m = markerFor(e);
    if (openIt) openCountry(e._country, e.id, false, m);
    world.pointOfView(viewFor(+e.lat, +e.lon, 1.15), reduceMotion ? 0 : 1800);
  }
  function interactedHide() { $('hint').classList.add('gone'); controls.autoRotate = false; }

  /* ---------- Fly-to drawer ---------- */
  var listEl = $('entryList'), search = $('search');
  function renderList(q) {
    q = norm(q); listEl.textContent = '';
    var shown = 0;
    sorted.forEach(function (e) {
      var hay = norm([e.title, e.creator, e.place, e.country, e.year, e.description, e.tags.join(' ')].join(' '));
      if (q && !q.split(/\s+/).every(function (w) { return hay.indexOf(w) > -1; })) return;
      shown++;
      var li = el('li'), b = el('button'); b.type = 'button'; b.dataset.id = e.id;
      var t = el('span', 't', e.title);
      if (e.example && CFG.showExampleBadges) t.appendChild(el('span', 'ex', 'example'));
      b.appendChild(t); b.appendChild(el('span', 'm', e.creator + ' · ' + e.year + ' · ' + (e.place || e._country)));
      b.addEventListener('click', function () { flyToEntry(e, true); if (window.innerWidth < 760) $('drawer').classList.add('closed'); });
      li.appendChild(b); listEl.appendChild(li);
    });
    $('noResults').hidden = shown > 0;
  }
  search.addEventListener('input', function () { renderList(search.value); });
  search.addEventListener('keydown', function (e) { if (e.key === 'Enter') { var b = listEl.querySelector('button'); if (b) b.click(); } });
  $('drawerToggle').addEventListener('click', function () {
    var d = $('drawer'), closed = d.classList.toggle('closed'); this.setAttribute('aria-expanded', String(!closed));
  });
  renderList('');
  if (window.innerWidth < 760) { $('drawer').classList.add('closed'); $('drawerToggle').setAttribute('aria-expanded', 'false'); }

  // Handy for debugging / screenshots
  window.citationGlobe = { world: world, openEntry: function (id) { flyToEntry(entryById[id], true); }, entries: ENTRIES };
})();
