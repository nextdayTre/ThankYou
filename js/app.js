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

  /* ---------- Sound (off by default; all generated live in js/audio.js — no files) ---------- */
  var NA = window.NightAudio;
  var PREF_KEY = 'citationGlobe.audio.v1';
  var pref = { on: false, music: true, fx: true, vol: 0.5 };
  try { var saved = JSON.parse(localStorage.getItem(PREF_KEY) || 'null'); if (saved) { pref.on = !!saved.on; pref.music = saved.music !== false; pref.fx = saved.fx !== false; if (typeof saved.vol === 'number') pref.vol = Math.max(0, Math.min(1, saved.vol)); } } catch (e) { /* storage blocked */ }
  function savePref() { try { localStorage.setItem(PREF_KEY, JSON.stringify(pref)); } catch (e) { /* ignore */ } }
  function sfx(name) { if (NA && pref.on && pref.fx) NA.sfx(name); }
  var soundBtn = $('soundBtn'), audioMore = $('audioMore'), audioPanel = $('audioPanel'), soundHint = $('soundHint');
  var audioStarted = false;
  function hideSoundHint() { if (soundHint) soundHint.classList.add('gone'); }
  function applyAudio() {
    if (!NA || !NA.supported) return;
    NA.setVolume(pref.vol); NA.setFx(pref.on && pref.fx); NA.setMusic(pref.on && pref.music);
  }
  function paintAudioUI() {
    soundBtn.setAttribute('aria-pressed', String(pref.on));
    soundBtn.setAttribute('aria-label', pref.on ? 'Turn night music and sounds off' : 'Turn night music and sounds on');
    soundBtn.title = pref.on ? 'Night music & sounds (on)' : 'Night music & sounds (off)';
    audioMore.hidden = !pref.on; if (!pref.on) setPanel(false);
    $('optMusic').checked = pref.music; $('optFx').checked = pref.fx; $('optVol').value = Math.round(pref.vol * 100);
  }
  function setPanel(open) { audioPanel.hidden = !open; audioMore.setAttribute('aria-expanded', String(open)); }
  function startAudio() { if (!NA || !NA.supported) return false; audioStarted = true; return NA.start(); }
  if (!NA || !NA.supported) { soundBtn.hidden = true; hideSoundHint(); }
  soundBtn.addEventListener('click', function () {
    hideSoundHint();
    pref.on = !pref.on;
    if (pref.on && !startAudio()) pref.on = false;
    applyAudio(); paintAudioUI(); savePref();
    if (pref.on) setTimeout(function () { sfx('open'); }, 60);
  });
  audioMore.addEventListener('click', function () { setPanel(audioPanel.hidden); });
  $('optMusic').addEventListener('change', function () { pref.music = this.checked; applyAudio(); savePref(); });
  $('optFx').addEventListener('change', function () { pref.fx = this.checked; applyAudio(); savePref(); if (pref.fx) sfx('open'); });
  $('optVol').addEventListener('input', function () { pref.vol = this.value / 100; if (NA) NA.setVolume(pref.vol); });
  $('optVol').addEventListener('change', function () { savePref(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !audioPanel.hidden) setPanel(false); });
  document.addEventListener('pointerdown', function (e) { if (!audioPanel.hidden && !audioPanel.contains(e.target) && e.target !== audioMore && !audioMore.contains(e.target)) setPanel(false); });
  // Browsers block autoplay: if you turned sound on last visit, it begins at your first tap/click/key.
  if (pref.on && NA && NA.supported) {
    var resumeOnGesture = function () {
      document.removeEventListener('pointerdown', resumeOnGesture, true); document.removeEventListener('keydown', resumeOnGesture, true);
      if (pref.on && !audioStarted && startAudio()) applyAudio();
    };
    document.addEventListener('pointerdown', resumeOnGesture, true); document.addEventListener('keydown', resumeOnGesture, true);
  } else if (soundHint && NA && NA.supported) {
    setTimeout(function () { soundHint.classList.remove('gone'); }, 2500);
    setTimeout(hideSoundHint, 22000);
  }
  paintAudioUI();
  document.addEventListener('visibilitychange', function () { if (!NA) return; if (document.hidden) NA.suspend(); else if (pref.on) NA.resume(); });

  /* ---------- Milky Way & faint dust backdrop (drawn once per resize; 3D stars live in WebGL) ---------- */
  (function stars() {
    var cv = $('stars'), cx = cv.getContext('2d'), dpr = Math.min(window.devicePixelRatio || 1, 2), resizeT;
    function drawOnce() {
      var W = window.innerWidth, H = window.innerHeight, diag = Math.hypot(W, H);
      cv.width = W * dpr; cv.height = H * dpr; cx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cx.clearRect(0, 0, W, H);
      // Diagonal Milky Way glow (top-left to bottom-right)
      cx.save();
      cx.translate(W * 0.5, H * 0.5);
      cx.rotate(0.58);
      var band = cx.createLinearGradient(0, -diag * 0.24, 0, diag * 0.24);
      band.addColorStop(0, 'rgba(30,70,145,0)');
      band.addColorStop(0.32, 'rgba(36,88,175,0.08)');
      band.addColorStop(0.5, 'rgba(65,130,225,0.13)');
      band.addColorStop(0.68, 'rgba(36,88,175,0.08)');
      band.addColorStop(1, 'rgba(30,70,145,0)');
      cx.fillStyle = band;
      cx.fillRect(-diag * 0.7, -diag * 0.24, diag * 1.4, diag * 0.48);
      // Soft nebula knots along the galactic plane
      for (var k = 0; k < 14; k++) {
        var kx = (Math.random() - 0.5) * diag * 0.95, ky = (Math.random() - 0.5) * diag * 0.14;
        var kr = diag * (0.06 + Math.random() * 0.1);
        var kg = cx.createRadialGradient(kx, ky, 0, kx, ky, kr);
        kg.addColorStop(0, 'rgba(72,148,245,0.085)');
        kg.addColorStop(1, 'rgba(30,70,145,0)');
        cx.fillStyle = kg; cx.beginPath(); cx.arc(kx, ky, kr, 0, 6.2832); cx.fill();
      }
      // Fine faint dust stars concentrated near the Milky Way band
      var dustN = Math.round(W * H / 4500);
      for (var j = 0; j < dustN; j++) {
        var dx = (Math.random() - 0.5) * diag * 1.1;
        var dy = (Math.random() + Math.random() - 1) * diag * 0.18;
        var dr = Math.random() * 0.7 + 0.2;
        cx.fillStyle = Math.random() < 0.35 ? 'rgba(175,215,255,0.34)' : 'rgba(255,255,255,0.24)';
        cx.beginPath(); cx.arc(dx, dy, dr, 0, 6.2832); cx.fill();
      }
      cx.restore();
      // Background field dust
      var n = Math.round(W * H / 11000);
      for (var i = 0; i < n; i++) {
        var x = Math.random() * W, y = Math.random() * H, r = Math.random() * 0.75 + 0.2;
        cx.fillStyle = Math.random() < 0.25 ? 'rgba(175,212,255,0.26)' : 'rgba(255,255,255,0.20)';
        cx.beginPath(); cx.arc(x, y, r, 0, 6.2832); cx.fill();
      }
    }
    window.addEventListener('resize', function () { clearTimeout(resizeT); resizeT = setTimeout(drawOnce, 120); });
    drawOnce();
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
  var isDragging = false, isFlying = false, flyTimer = null;
  var ALT = { base: 0.0012, hover: 0.011, selected: 0.018 };
  function beginFly(ms) {
    clearTimeout(flyTimer);
    if (!ms || ms <= 0) { isFlying = false; layoutCountryLabels(); return; }
    isFlying = true;
    flyTimer = setTimeout(function () { isFlying = false; layoutCountryLabels(); }, ms + 50);
  }

  /* ---------- Globe ---------- */
  var globeEl = $('globe');
  var world;
  try {
    world = Globe({ animateIn: false, rendererConfig: { antialias: true, alpha: true, powerPreference: 'high-performance' } })(globeEl);
  } catch (err) { console.error(err); fatal('Your browser could not start WebGL.'); return; }

  function hasEntries(f) { return !!byCountry[f.properties.name]; }
  function capColor(f) {
    var n = f.properties.name, has = hasEntries(f);
    if (n === selectedCountry) return 'rgba(255,220,95,0.32)';
    if (f === hoverPoly) return has ? 'rgba(255,228,110,0.26)' : 'rgba(130,200,255,0.16)';
    return has ? 'rgba(255,215,90,0.08)' : 'rgba(120,175,255,0.003)';
  }
  function strokeColor(f) {
    if (f.properties.name === selectedCountry) return 'rgba(255,238,145,0.88)';
    return hasEntries(f) ? 'rgba(255,228,130,0.48)' : 'rgba(135,190,255,0.14)';
  }
  function altitude(f) { return f.properties.name === selectedCountry ? ALT.selected : (f === hoverPoly ? ALT.hover : ALT.base); }
  function refreshPolys() { world.polygonCapColor(capColor).polygonAltitude(altitude); }

  world
    .backgroundColor('rgba(0,0,0,0)')
    .globeImageUrl('assets/earth-day.webp')
    .globeCurvatureResolution(2)
    .showAtmosphere(true).atmosphereColor('#3eb8ff').atmosphereAltitude(0.18)
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
      var next = (isDragging || isFlying) ? null : (f || null);
      if (next === hoverPoly) return;
      hoverPoly = next;
      globeEl.classList.toggle('hovering', !!next);
      if (next && hasEntries(next)) sfx('hover');
      refreshPolys();
    })
    .onPolygonClick(function (f, ev, coords) {
      var list = byCountry[f.properties.name];
      if (!list) { toast('No inspirations in ' + f.properties.name + ' yet… maybe soon!'); sfx('nope'); return; }
      openCountry(f.properties.name, null, true);
    })
    .onGlobeClick(function () { if (panelOpen) closePanel(); })
    .ringsData([])
    .ringLat('lat').ringLng('lng').ringAltitude(0.021)
    .ringResolution(36).ringMaxRadius(2.4).ringPropagationSpeed(1.35).ringRepeatPeriod(1800)
    .ringColor(function (m) {
      return m === activeMarker
        ? function (t) { return 'rgba(255,244,140,' + Math.max(0, 1 - t) + ')'; }
        : function (t) { return 'rgba(255,220,75,' + Math.max(0, 0.72 * (1 - t)) + ')'; };
    })
    .htmlElementsData(markers)
    .htmlLat('lat').htmlLng('lng').htmlAltitude(0.006)
    .htmlElement(function (m) {
      var cls = 'marker'
        + (selectedCountry && m.country === selectedCountry ? ' in-country' : '')
        + (activeMarker === m ? ' active' : '');
      var d = el('div', cls); d.setAttribute('role', 'button'); d.setAttribute('tabindex', '-1');
      d.setAttribute('aria-label', m.place + ': ' + m.entries.length + (m.entries.length === 1 ? ' inspiration' : ' inspirations'));
      var pin = el('span', 'pin'); pin.appendChild(el('b')); pin.appendChild(el('i'));
      var lbl = el('span', 'lbl', m.place);
      if (m.entries.length > 1) lbl.appendChild(el('small', null, String(m.entries.length)));
      d.appendChild(pin); d.appendChild(lbl);
      d.addEventListener('click', function (e) { e.stopPropagation(); openCountry(m.country, m.entries[0].id, true, m); });
      d.addEventListener('mouseenter', function () { sfx('hover'); });
      m._el = d; m._lbl = lbl; return d;
    })
    .htmlElementVisibilityModifier(function (d, vis) {
      var wasHidden = d.classList.contains('hidden');
      d.classList.toggle('hidden', !vis);
      if (vis && wasHidden && d.classList.contains('in-country')) requestAnimationFrame(layoutCountryLabels);
    });

  var LABEL_SLOTS = ['', 'lbl-left', 'lbl-down', 'lbl-up'];
  var labelLayoutT = null;
  function scheduleLabelLayout(delay) {
    if (!selectedCountry) return;
    clearTimeout(labelLayoutT);
    labelLayoutT = setTimeout(layoutCountryLabels, delay == null ? 90 : delay);
  }
  function layoutCountryLabels() {
    if (!selectedCountry) return;
    var activeList = [];
    for (var i = 0; i < markers.length; i++) {
      var m = markers[i];
      if (!m._el) continue;
      if (m.country !== selectedCountry) {
        m._el.classList.remove('lbl-left', 'lbl-up', 'lbl-down');
        continue;
      }
      if (!m._el.classList.contains('hidden')) activeList.push(m);
    }
    if (!activeList.length) return;
    // Place active marker first, then northernmost to southernmost, choosing the first non-overlapping slot.
    activeList.sort(function (a, b) {
      if (a === activeMarker) return -1;
      if (b === activeMarker) return 1;
      return b.lat - a.lat;
    });
    var placed = [];
    var pad = 4;
    if (panelOpen && panel && !panel.hidden) {
      var panR = panel.getBoundingClientRect();
      if (panR.width > 0 && panR.height > 0) placed.push({ l: panR.left - 8, r: panR.right + 8, t: panR.top - 8, b: panR.bottom + 8 });
    }
    // Reserve the 18x18 pins first so labels never cover another city's dot.
    var pinBoxes = activeList.map(function (m) {
      var pr = m._el.getBoundingClientRect();
      return { m: m, l: pr.left - 2, r: pr.right + 2, t: pr.top - 2, b: pr.bottom + 2 };
    });
    var vw = window.innerWidth, vh = window.innerHeight;
    activeList.forEach(function (m) {
      var d = m._el, chosen = '', chosenBox = null;
      for (var s = 0; s < LABEL_SLOTS.length; s++) {
        var slot = LABEL_SLOTS[s];
        d.classList.remove('lbl-left', 'lbl-up', 'lbl-down');
        if (slot) d.classList.add(slot);
        var r = m._lbl.getBoundingClientRect();
        var box = { l: r.left - pad, r: r.right + pad, t: r.top - pad, b: r.bottom + pad };
        var collides = box.l < 6 || box.r > vw - 6 || box.t < 6 || box.b > vh - 6;
        if (!collides) {
          for (var p = 0; p < placed.length; p++) {
            var q = placed[p];
            if (box.l < q.r && box.r > q.l && box.t < q.b && box.b > q.t) { collides = true; break; }
          }
        }
        if (!collides) {
          for (var k = 0; k < pinBoxes.length; k++) {
            var pb = pinBoxes[k];
            if (pb.m === m) continue;
            if (box.l < pb.r && box.r > pb.l && box.t < pb.b && box.b > pb.t) { collides = true; break; }
          }
        }
        if (!collides) { chosen = slot; chosenBox = box; break; }
      }
      d.classList.remove('lbl-left', 'lbl-up', 'lbl-down');
      if (chosen) d.classList.add(chosen);
      if (!chosenBox) {
        var fr = m._lbl.getBoundingClientRect();
        chosenBox = { l: fr.left - pad, r: fr.right + pad, t: fr.top - pad, b: fr.bottom + pad };
      }
      placed.push(chosenBox);
    });
  }

  function syncSelectedVisuals() {
    var list = [];
    for (var i = 0; i < markers.length; i++) {
      var m = markers[i], inSel = !!selectedCountry && m.country === selectedCountry;
      if (m._el) {
        m._el.classList.toggle('in-country', inSel);
        if (!inSel) m._el.classList.remove('lbl-left', 'lbl-up', 'lbl-down');
      }
      if (inSel) list.push(m);
    }
    world.ringsData(reduceMotion ? [] : list);
    requestAnimationFrame(layoutCountryLabels);
  }

  function escapeHtml(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }

  /* Camera & controls */
  var controls = world.controls();
  controls.enableDamping = true; controls.dampingFactor = 0.065;
  controls.autoRotate = !reduceMotion; controls.autoRotateSpeed = 0.35;
  controls.minDistance = 135; controls.maxDistance = 520; controls.zoomSpeed = 0.7; controls.rotateSpeed = 0.55;
  controls.enablePan = false;
  var keyLight = null, rimLight = null, sunDirVec = null, cloudMesh = null;
  function updateLights() {
    if (!keyLight) return;
    var p = world.camera().position, len = Math.hypot(p.x, p.y, p.z) || 1;
    var fx = p.x / len, fy = p.y / len, fz = p.z / len;
    var rx = fz, rz = -fx, rlen = Math.hypot(rx, rz);
    if (rlen < 1e-4) { rx = 1; rz = 0; } else { rx /= rlen; rz /= rlen; }
    var ux = fy * rz, uy = fz * rx - fx * rz, uz = -fy * rx;
    // Side-front crescent lighting (~75 deg left) so the sunlit crescent & clouds flow smoothly across twilight into night city lights.
    var sx = fx * 0.22 - rx * 0.93 + ux * 0.29;
    var sy = fy * 0.22 + uy * 0.29;
    var sz = fz * 0.22 - rz * 0.93 + uz * 0.29;
    var sl = Math.hypot(sx, sy, sz) || 1;
    sx /= sl; sy /= sl; sz /= sl;
    keyLight.position.set(sx, sy, sz);
    if (sunDirVec) sunDirVec.set(sx, sy, sz);
    if (rimLight) rimLight.position.set(-fx * 0.25 + rx * 0.90 - ux * 0.30, -fy * 0.25 - uy * 0.30, -fz * 0.25 + rz * 0.90 - uz * 0.30);
  }
  function scheduleResume(ms) {
    clearTimeout(resumeTimer);
    resumeTimer = setTimeout(function () { if (!panelOpen && !reduceMotion) controls.autoRotate = true; }, ms);
  }
  controls.addEventListener('start', function () {
    isDragging = true; controls.autoRotate = false; clearTimeout(resumeTimer);
    if (hoverPoly) { hoverPoly = null; globeEl.classList.remove('hovering'); refreshPolys(); }
    if (!interacted) { interacted = true; setTimeout(function () { $('hint').classList.add('gone'); }, 1600); }
  });
  controls.addEventListener('end', function () { isDragging = false; layoutCountryLabels(); scheduleResume(5000); });

  // Spin speed -> swoosh. Measured as the angle the camera moves around the globe per second
  // (drag, fling inertia, fly-to). Gentle auto-rotate is far below the threshold, so it stays silent.
  var lastDir = null, lastDirT = 0, spinDecay = null;
  function cameraDir() { var p = world.camera().position, l = Math.sqrt(p.x * p.x + p.y * p.y + p.z * p.z) || 1; return [p.x / l, p.y / l, p.z / l]; }
  controls.addEventListener('change', function () {
    updateLights();
    scheduleLabelLayout(90);
    if (!NA || !pref.on || !pref.fx) { lastDir = null; return; }
    var now = performance.now(), d = cameraDir();
    if (lastDir && now - lastDirT > 4) {
      var dot = Math.max(-1, Math.min(1, d[0] * lastDir[0] + d[1] * lastDir[1] + d[2] * lastDir[2]));
      var deg = Math.acos(dot) * 180 / Math.PI / ((now - lastDirT) / 1000);
      NA.spin(deg); lastDir = d; lastDirT = now;
    } else if (!lastDir) { lastDir = d; lastDirT = now; }
    clearTimeout(spinDecay);
    spinDecay = setTimeout(function () { NA.spin(0); lastDir = null; }, 120);   // no movement -> let the swoosh fade
  });

  // Responsive sizing
  function resize() { world.width(window.innerWidth).height(window.innerHeight); scheduleLabelLayout(100); }
  window.addEventListener('resize', resize); resize();

  function makeStarTexture(Tex, rgb) {
    var c = document.createElement('canvas'); c.width = 32; c.height = 32;
    var g = c.getContext('2d'), grad = g.createRadialGradient(16, 16, 0, 16, 16, 15);
    grad.addColorStop(0, 'rgba(' + rgb + ',1)');
    grad.addColorStop(0.45, 'rgba(' + rgb + ',0.92)');
    grad.addColorStop(0.65, 'rgba(' + rgb + ',0.35)');
    grad.addColorStop(1, 'rgba(' + rgb + ',0)');
    g.fillStyle = grad; g.fillRect(0, 0, 32, 32);
    var tex = new Tex(c); tex.needsUpdate = true; return tex;
  }
  function initStarfield(Tex) {
    var tiers = [
      { rgb: '255,255,255', size: 2.5, count: 650, minAlt: 10, maxAlt: 22 },
      { rgb: '185,222,255', size: 3.4, count: 290, minAlt: 11, maxAlt: 24 },
      { rgb: '255,243,205', size: 4.4, count: 130, minAlt: 12, maxAlt: 24 }
    ];
    tiers.forEach(function (tier) {
      tier.tex = makeStarTexture(Tex, tier.rgb);
      tier.stars = [];
      for (var i = 0; i < tier.count; i++) {
        var u = Math.random() * 2 - 1;
        tier.stars.push({
          lat: Math.asin(u) * 180 / Math.PI,
          lng: Math.random() * 360 - 180,
          alt: tier.minAlt + Math.random() * (tier.maxAlt - tier.minAlt)
        });
      }
    });
    world
      .particlesData(tiers)
      .particlesList('stars')
      .particleLat('lat').particleLng('lng').particleAltitude('alt')
      .particlesSize('size')
      .particlesSizeAttenuation(false)
      .particlesTexture('tex');
  }

  function loadTex(Tex, url, maxAniso, srgbSpace, onLoad) {
    var img = new Image();
    img.onload = function () {
      var t = new Tex(img);
      t.anisotropy = maxAniso;
      if (srgbSpace) t.colorSpace = srgbSpace;
      t.needsUpdate = true;
      onLoad(t);
    };
    img.src = url;
  }

  function applyTwilightShader(mat, fallbackMap, sunVec) {
    var uniforms = {
      uNightMap: { value: fallbackMap },
      uHasNightMap: { value: 0.0 },
      uSunDir: { value: sunVec }
    };
    mat.customProgramCacheKey = function () { return 'citation-twilight-v1'; };
    mat.onBeforeCompile = function (shader) {
      shader.uniforms.uNightMap = uniforms.uNightMap;
      shader.uniforms.uHasNightMap = uniforms.uHasNightMap;
      shader.uniforms.uSunDir = uniforms.uSunDir;
      shader.vertexShader = 'varying vec3 vGlobeWorldNormal;\n' + shader.vertexShader.replace(
        '#include <worldpos_vertex>',
        '#include <worldpos_vertex>\nvGlobeWorldNormal = normalize(mat3(modelMatrix) * objectNormal);'
      );
      shader.fragmentShader = [
        'uniform sampler2D uNightMap;',
        'uniform float uHasNightMap;',
        'uniform vec3 uSunDir;',
        'varying vec3 vGlobeWorldNormal;',
        ''
      ].join('\n') + shader.fragmentShader.replace(
        '#include <aomap_fragment>',
        [
          '#include <aomap_fragment>',
          'float sunFacing = dot(normalize(vGlobeWorldNormal), normalize(uSunDir));',
          'float dayMix = smoothstep(-0.24, 0.22, sunFacing);',
          'float twilightBand = smoothstep(-0.34, -0.02, sunFacing) * (1.0 - smoothstep(-0.02, 0.26, sunFacing));',
          'vec3 nightTint = vec3(0.30, 0.42, 0.76);',
          'reflectedLight.indirectDiffuse *= mix(nightTint, vec3(1.0), dayMix);',
          'reflectedLight.indirectDiffuse += diffuseColor.rgb * vec3(0.08, 0.05, 0.12) * twilightBand;',
          '#ifdef USE_MAP',
          '  if (uHasNightMap > 0.5) {',
          '    vec3 cityRaw = texture2D(uNightMap, vMapUv).rgb;',
          '    float cityMask = smoothstep(0.14, -0.18, sunFacing);',
          '    totalEmissiveRadiance += cityRaw * vec3(0.96, 0.74, 0.40) * 0.68 * cityMask;',
          '  }',
          '#endif',
          'float rimFresnel = pow(clamp(1.0 - max(dot(normalize(vViewPosition), normal), 0.0), 0.0, 1.0), 3.4);',
          'float rimLit = mix(0.36, 1.0, smoothstep(-0.40, 0.35, sunFacing));',
          'totalEmissiveRadiance += vec3(0.22, 0.72, 1.0) * rimFresnel * 0.68 * rimLit;'
        ].join('\n')
      );
    };
    mat.needsUpdate = true;
    return uniforms;
  }

  function initClouds(Tex, mat, maxAniso) {
    var globeObj = null;
    world.scene().traverse(function (o) { if (o.isMesh && o.material === mat) globeObj = o; });
    if (!globeObj) return;
    loadTex(Tex, 'assets/earth-clouds.webp', maxAniso, null, function (cloudTex) {
      var cloudMat = new mat.constructor({
        color: 0xf4f9ff,
        alphaMap: cloudTex,
        transparent: true,
        opacity: 0.45,
        depthWrite: false,
        shininess: 2,
        specular: 0x000000,
        emissive: 0x071329,
        emissiveIntensity: 0.12
      });
      cloudMesh = new globeObj.constructor(globeObj.geometry, cloudMat);
      cloudMesh.scale.setScalar(1.007);
      cloudMesh.renderOrder = 1;
      globeObj.add(cloudMesh);
      if (!reduceMotion) {
        var lastT = performance.now();
        (function drift(now) {
          var dt = Math.min(0.1, (now - lastT) / 1000);
          lastT = now;
          if (!document.hidden && cloudMesh) cloudMesh.rotation.y += dt * 0.004;
          requestAnimationFrame(drift);
        })(lastT);
      }
    });
  }

  // High-res 8K day/night terminator shader, 4K relief & ocean gloss, 3D clouds, and 3D starfield
  world.onGlobeReady(function () {
    try {
      var lights = world.lights();
      if (lights && lights.length >= 2) {
        var ambient = lights[0], key = lights[1];
        ambient.color.setHex(0xa8c6f2); ambient.intensity = 0.85;
        key.color.setHex(0xfff9f0); key.intensity = 1.85;
        keyLight = key;
        sunDirVec = key.position.clone();
        rimLight = new key.constructor(0x38b6ff, 0.50);
        world.lights([ambient, keyLight, rimLight]);
        updateLights();
      }
    } catch (e) { console.warn('lights skipped', e); }

    try {
      var mat = world.globeMaterial();
      var maxAniso = Math.min(8, (world.renderer().capabilities.getMaxAnisotropy && world.renderer().capabilities.getMaxAnisotropy()) || 1);
      mat.shininess = 55; mat.specular.set(0x285a94);
      if (mat.map) {
        var Tex = mat.map.constructor;
        mat.map.anisotropy = maxAniso; mat.map.needsUpdate = true;
        initStarfield(Tex);
        if (sunDirVec) {
          var shaderUniforms = applyTwilightShader(mat, mat.map, sunDirVec);
          loadTex(Tex, 'assets/earth-night.webp', maxAniso, mat.map.colorSpace, function (nightTex) {
            shaderUniforms.uNightMap.value = nightTex;
            shaderUniforms.uHasNightMap.value = 1.0;
          });
        }
        loadTex(Tex, 'assets/earth-normal.webp', maxAniso, null, function (normTex) {
          mat.normalMap = normTex;
          if (mat.normalScale && mat.normalScale.set) mat.normalScale.set(0.65, 0.65);
          mat.needsUpdate = true;
        });
        loadTex(Tex, 'assets/earth-specular.webp', maxAniso, null, function (specTex) {
          mat.specularMap = specTex;
          mat.needsUpdate = true;
        });
        initClouds(Tex, mat, maxAniso);
      }
    } catch (e) { console.warn('surface detail skipped', e); }
    // fly in
    var flyMs = reduceMotion ? 0 : 2600;
    beginFly(flyMs);
    world.pointOfView({ lat: 20, lng: 5, altitude: 6 }, 0);
    world.pointOfView({ lat: 28, lng: 18, altitude: window.innerWidth < window.innerHeight ? 3.1 : 2.15 }, flyMs);
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
    requestAnimationFrame(function () { requestAnimationFrame(function () { panel.classList.add('open'); layoutCountryLabels(); }); });
    setTimeout(layoutCountryLabels, 360);
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
    syncSelectedVisuals();
    if (!wasOpen) sfx('open');
    showPanel();
    if (focusId) history.replaceState(null, '', '#' + encodeURIComponent(focusId));
    if (fly) {
      var tgt = marker ? { lat: marker.lat, lng: marker.lng } : centroid(list);
      var alt = Math.max(Math.min(world.pointOfView().altitude, 1.7), 0.9);
      var flyMs = reduceMotion ? 0 : 1200;
      beginFly(flyMs);
      world.pointOfView(viewFor(tgt.lat, tgt.lng, alt), flyMs);
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
    selectedCountry = null; setActiveMarker(null); syncSelectedVisuals(); refreshPolys(); sfx('close');
    history.replaceState(null, '', location.pathname + location.search);
    scheduleResume(2500);
  }
  $('panelClose').addEventListener('click', closePanel);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closePanel(); });

  function flyToEntry(e, openIt) {
    interactedHide();
    var m = markerFor(e);
    if (openIt) openCountry(e._country, e.id, false, m);
    var flyMs = reduceMotion ? 0 : 1800;
    beginFly(flyMs);
    world.pointOfView(viewFor(+e.lat, +e.lon, 1.15), flyMs);
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
