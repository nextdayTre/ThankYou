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
  var isDragging = false, isFlying = false, flyTimer = null, lastMarkerClickAt = 0;
  function isMarkerClick(ev) {
    return (performance.now() - lastMarkerClickAt < 250) || !!(ev && ev.target && ev.target.closest && ev.target.closest('.marker'));
  }
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
  function ringSpan(ring) {
    var minX = 180, maxX = -180, minY = 90, maxY = -90;
    for (var i = 0; i < ring.length; i++) {
      var x = ring[i][0], y = ring[i][1];
      if (x < minX) minX = x; if (x > maxX) maxX = x;
      if (y < minY) minY = y; if (y > maxY) maxY = y;
    }
    return { minX: minX, maxX: maxX, minY: minY, maxY: maxY, span: Math.max(maxX - minX, maxY - minY) };
  }
  // Precompute country bounding boxes for instant empty-country click lookup, and filter activeGeo for fast WebGL caps.
  var emptyGeo = [], activeGeo = [];
  geo.forEach(function (f) {
    var coords = f.geometry.coordinates;
    var fMinX = 180, fMaxX = -180, fMinY = 90, fMaxY = -90;
    var partBboxes = [];
    coords.forEach(function (poly) {
      var bb = ringSpan(poly[0]);
      partBboxes.push(bb);
      if (bb.minX < fMinX) fMinX = bb.minX; if (bb.maxX > fMaxX) fMaxX = bb.maxX;
      if (bb.minY < fMinY) fMinY = bb.minY; if (bb.maxY > fMaxY) fMaxY = bb.maxY;
    });
    f._bbox = { minX: fMinX, maxX: fMaxX, minY: fMinY, maxY: fMaxY };
    f._partBboxes = partBboxes;
    if (!hasEntries(f)) { emptyGeo.push(f); return; }
    if (coords.length <= 6) { activeGeo.push(f); return; }
    var kept = [];
    var bestIdx = 0, bestSpan = -1;
    for (var i = 0; i < coords.length; i++) {
      var sp = partBboxes[i].span;
      if (sp > bestSpan) { bestSpan = sp; bestIdx = i; }
      if (sp >= 0.8) kept.push(coords[i]);
    }
    if (!kept.length) kept.push(coords[bestIdx]);
    activeGeo.push({ type: 'Feature', id: f.id, properties: f.properties, geometry: { type: 'MultiPolygon', coordinates: kept } });
  });

  function pointInRing(x, y, ring) {
    var inside = false;
    for (var i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      var xi = ring[i][0], yi = ring[i][1], xj = ring[j][0], yj = ring[j][1];
      if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) inside = !inside;
    }
    return inside;
  }
  function countryAt(lat, lng) {
    for (var i = 0; i < emptyGeo.length; i++) {
      var f = emptyGeo[i], b = f._bbox;
      if (lng < b.minX || lng > b.maxX || lat < b.minY || lat > b.maxY) continue;
      var coords = f.geometry.coordinates, pb = f._partBboxes;
      for (var p = 0; p < coords.length; p++) {
        var pbb = pb[p];
        if (lng < pbb.minX || lng > pbb.maxX || lat < pbb.minY || lat > pbb.maxY) continue;
        if (pointInRing(lng, lat, coords[p][0])) {
          var inHole = false;
          for (var h = 1; h < coords[p].length; h++) if (pointInRing(lng, lat, coords[p][h])) { inHole = true; break; }
          if (!inHole) return f.properties.name;
        }
      }
    }
    return null;
  }

  function capColor(f) {
    var n = f.properties.name;
    if (n === selectedCountry) return 'rgba(255,220,95,0.32)';
    if (f === hoverPoly) return 'rgba(255,228,110,0.26)';
    return 'rgba(255,215,90,0.08)';
  }
  function strokeColor(f) {
    if (f.properties.name === selectedCountry) return 'rgba(255,238,145,0.92)';
    if (f === hoverPoly) return 'rgba(255,238,145,0.72)';
    return null;
  }
  function altitude(f) { return f.properties.name === selectedCountry ? ALT.selected : (f === hoverPoly ? ALT.hover : ALT.base); }
  function refreshPolys() { world.polygonCapColor(capColor).polygonStrokeColor(strokeColor).polygonAltitude(altitude); }

  world
    .backgroundColor('rgba(0,0,0,0)')
    .globeImageUrl('assets/earth-day.webp')
    .globeCurvatureResolution(2)
    .showAtmosphere(true).atmosphereColor('#38b2ff').atmosphereAltitude(0.11)
    .pointerEventsFilter(function (obj) { return obj && obj.__globeObjType !== 'particles'; })
    .polygonsData(activeGeo)
    .polygonCapColor(capColor)
    .polygonSideColor(null)
    .polygonStrokeColor(strokeColor)
    .polygonAltitude(altitude)
    .polygonCapCurvatureResolution(8)
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
      if (isMarkerClick(ev)) return;
      var list = byCountry[f.properties.name];
      if (!list) { toast('No inspirations in ' + f.properties.name + ' yet… maybe soon!'); sfx('nope'); return; }
      openCountry(f.properties.name, null, true);
    })
    .onGlobeClick(function (coords, ev) {
      if (isMarkerClick(ev)) return;
      if (coords) {
        var emptyName = countryAt(coords.lat, coords.lng);
        if (emptyName) { toast('No inspirations in ' + emptyName + ' yet… maybe soon!'); sfx('nope'); return; }
      }
      if (panelOpen) closePanel();
    })
    .particlesData([{ stars: [{ lat: 0, lng: 0, alt: 10 }] }])
    .particlesList('stars')
    .particleLat('lat').particleLng('lng').particleAltitude('alt')
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
      d.addEventListener('click', function (e) {
        e.stopPropagation();
        lastMarkerClickAt = performance.now();
        openCountry(m.country, m.entries[0].id, true, m);
      });
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
  var keyLight = null, rimLight = null, sunDirVec = null, cloudMesh = null, skyGroup = null, starShaderMat = null;
  var prevSkyCamQ = null, skyDeltaQ = null, skyStepQ = null;
  function updateSky(now) {
    if (!skyGroup) return;
    var cam = world.camera();
    skyGroup.position.copy(cam.position);
    // Continuous incremental deep-space parallax (~15% of globe rotation, zero 180-deg seam jumps).
    if (!prevSkyCamQ) {
      prevSkyCamQ = cam.quaternion.clone();
      skyDeltaQ = cam.quaternion.clone();
      skyStepQ = cam.quaternion.clone();
    } else {
      skyDeltaQ.copy(prevSkyCamQ).invert().premultiply(cam.quaternion);
      skyStepQ.identity().slerp(skyDeltaQ, 0.85);
      skyGroup.quaternion.premultiply(skyStepQ).normalize();
      prevSkyCamQ.copy(cam.quaternion);
    }
    if (starShaderMat && !reduceMotion && now != null) starShaderMat.uniforms.uTime.value = now * 0.001;
  }
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
    updateSky();
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
  function getPixelRatio() { return Math.min(1.5, window.devicePixelRatio || 1); }
  function resize() {
    world.width(window.innerWidth).height(window.innerHeight);
    try { world.renderer().setPixelRatio(getPixelRatio()); } catch (e) { /* ignore */ }
    if (starShaderMat) starShaderMat.uniforms.uPixelRatio.value = getPixelRatio();
    scheduleLabelLayout(100);
  }
  window.addEventListener('resize', resize); resize();

  function addWorldBorders(scene, grat, BufGeo, FloatAttr) {
    var LineSegs = grat.constructor;
    var LineMat = grat.material.constructor;
    function buildMesh(features, colorHex, opacity) {
      var verts = [];
      for (var fi = 0; fi < features.length; fi++) {
        var polys = features[fi].geometry.coordinates;
        for (var pi = 0; pi < polys.length; pi++) {
          var ring = polys[pi][0];
          for (var i = 0; i < ring.length - 1; i++) {
            var a = ring[i], b = ring[i + 1];
            if ((a[1] <= -89.8 && b[1] <= -89.8) || Math.abs(b[0] - a[0]) > 180) continue;
            var span = Math.max(Math.abs(b[0] - a[0]), Math.abs(b[1] - a[1]));
            var steps = span > 4 ? Math.ceil(span / 4) : 1;
            var prev = world.getCoords(a[1], a[0], ALT.base);
            for (var s = 1; s <= steps; s++) {
              var t = s / steps;
              var cur = world.getCoords(a[1] + (b[1] - a[1]) * t, a[0] + (b[0] - a[0]) * t, ALT.base);
              verts.push(prev.x, prev.y, prev.z, cur.x, cur.y, cur.z);
              prev = cur;
            }
          }
        }
      }
      var g = new BufGeo();
      g.setAttribute('position', new FloatAttr(new Float32Array(verts), 3));
      var m = new LineMat({ color: colorHex, transparent: true, opacity: opacity, depthWrite: false });
      var lines = new LineSegs(g, m);
      lines.raycast = function () {};
      return lines;
    }
    scene.add(buildMesh(emptyGeo, 0x8ac4ff, 0.28));
    scene.add(buildMesh(geo.filter(hasEntries), 0xffe482, 0.52));
  }

  function initDeepSky(scene, pts, atmo, globeObj, globeGrp, BufGeo, FloatAttr) {
    var Group = globeGrp.constructor, Mesh = globeObj.constructor;
    var ShaderMat = atmo.material.constructor;

    skyGroup = new Group();
    // 1. Seamless procedural Milky Way galactic dust backdrop (safely behind Earth at R=1400)
    var milkyMat = new ShaderMat({
      side: 1, depthWrite: false, depthTest: true, transparent: false,
      vertexShader: 'varying vec3 vSkyDir;\nvoid main(){ vSkyDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
      fragmentShader: [
        'varying vec3 vSkyDir;',
        'void main(){',
        '  vec3 dir = normalize(vSkyDir);',
        '  vec3 galN = normalize(vec3(0.42, 0.78, 0.46));',
        '  float p = dot(dir, galN);',
        '  float band = exp(-p * p * 12.0) + 0.50 * exp(-p * p * 44.0);',
        '  float n1 = sin(dir.x * 5.0 + dir.z * 4.0) * cos(dir.y * 6.0 - dir.x * 3.0);',
        '  float n2 = sin(dir.z * 11.0 - dir.y * 8.0) * 0.5 + 0.5;',
        '  float n3 = sin(dir.x * 19.0 + dir.y * 17.0 - dir.z * 15.0) * 0.5 + 0.5;',
        '  float dust = smoothstep(-0.35, 0.78, n1) * (0.65 + 0.25 * n2 + 0.10 * n3);',
        '  float rift = 1.0 - 0.52 * exp(-p * p * 170.0) * (0.45 + 0.55 * sin(dir.x * 9.0 + dir.y * 7.0));',
        '  vec3 bg = vec3(0.008, 0.017, 0.048);',
        '  vec3 gal = vec3(0.055, 0.122, 0.275) * band * (0.45 + 0.55 * dust) * rift;',
        '  gl_FragColor = vec4(bg + gal, 1.0);',
        '}'
      ].join('\n')
    });
    var milkyMesh = new Mesh(globeObj.geometry, milkyMat);
    milkyMesh.scale.setScalar(14);
    milkyMesh.renderOrder = -20;
    milkyMesh.frustumCulled = false;
    milkyMesh.raycast = function () {};
    skyGroup.add(milkyMesh);

    // 2. Soft anti-aliased Gaussian GPU stars in the same deep-space group (R=1200)
    if (pts && BufGeo && FloatAttr) {
      var Points = pts.constructor;
      world.particlesData([]);

      var count = 1600, R = 1200;
      var pos = new Float32Array(count * 3), col = new Float32Array(count * 3);
      var size = new Float32Array(count), phase = new Float32Array(count), speed = new Float32Array(count);
      var galNx = 0.42, galNy = 0.78, galNz = 0.46, gLen = Math.hypot(galNx, galNy, galNz);
      galNx /= gLen; galNy /= gLen; galNz /= gLen;
      for (var i = 0; i < count; i++) {
        var x, y, z;
        if (i < count * 0.35) {
          // Concentrate ~35% of fainter stars near the Milky Way plane
          var th = Math.random() * 6.2832;
          var dPlane = (Math.random() + Math.random() - 1) * 0.24;
          var rPlane = Math.sqrt(Math.max(0, 1 - dPlane * dPlane));
          var ux = galNz, uy = 0, uz = -galNx, ul = Math.hypot(ux, uz) || 1;
          ux /= ul; uz /= ul;
          var vx = galNy * uz - galNz * uy, vy = galNz * ux - galNx * uz, vz = galNx * uy - galNy * ux;
          var cT = Math.cos(th) * rPlane, sT = Math.sin(th) * rPlane;
          x = cT * ux + sT * vx + dPlane * galNx;
          y = cT * uy + sT * vy + dPlane * galNy;
          z = cT * uz + sT * vz + dPlane * galNz;
        } else {
          var u = Math.random() * 2 - 1, th2 = Math.random() * 6.2832, r2 = Math.sqrt(1 - u * u);
          x = r2 * Math.cos(th2); y = u; z = r2 * Math.sin(th2);
        }
        pos[i * 3] = x * R; pos[i * 3 + 1] = y * R; pos[i * 3 + 2] = z * R;
        var mag = Math.random();
        var bright = mag < 0.04 ? 1.0 : (mag < 0.20 ? 0.72 : 0.34 + Math.random() * 0.30);
        var tint = Math.random();
        if (tint < 0.26) { col[i * 3] = 0.74 * bright; col[i * 3 + 1] = 0.88 * bright; col[i * 3 + 2] = 1.0 * bright; }
        else if (tint < 0.40) { col[i * 3] = 1.0 * bright; col[i * 3 + 1] = 0.93 * bright; col[i * 3 + 2] = 0.80 * bright; }
        else { col[i * 3] = 0.96 * bright; col[i * 3 + 1] = 0.98 * bright; col[i * 3 + 2] = 1.0 * bright; }
        size[i] = mag < 0.04 ? 5.4 : (mag < 0.20 ? 3.7 : 2.3 + Math.random() * 0.9);
        phase[i] = Math.random() * 6.2832;
        speed[i] = 0.5 + Math.random() * 1.4;
      }
      var sGeo = new BufGeo();
      sGeo.setAttribute('position', new FloatAttr(pos, 3));
      sGeo.setAttribute('aColor', new FloatAttr(col, 3));
      sGeo.setAttribute('aSize', new FloatAttr(size, 1));
      sGeo.setAttribute('aPhase', new FloatAttr(phase, 1));
      sGeo.setAttribute('aSpeed', new FloatAttr(speed, 1));
      starShaderMat = new ShaderMat({
        transparent: true, blending: 2, depthWrite: false, depthTest: true,
        uniforms: { uTime: { value: 0 }, uPixelRatio: { value: getPixelRatio() } },
        vertexShader: [
          'attribute vec3 aColor;',
          'attribute float aSize;',
          'attribute float aPhase;',
          'attribute float aSpeed;',
          'uniform float uTime;',
          'uniform float uPixelRatio;',
          'varying vec3 vColor;',
          'varying float vAlpha;',
          'void main(){',
          '  vColor = aColor;',
          '  vAlpha = 0.76 + 0.24 * sin(uTime * aSpeed + aPhase);',
          '  gl_PointSize = aSize * uPixelRatio;',
          '  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);',
          '}'
        ].join('\n'),
        fragmentShader: [
          'varying vec3 vColor;',
          'varying float vAlpha;',
          'void main(){',
          '  float d = length(gl_PointCoord - vec2(0.5)) * 2.0;',
          '  if (d > 1.0) discard;',
          '  float core = exp(-d * d * 5.2);',
          '  float halo = 0.35 * exp(-d * d * 2.1);',
          '  float alpha = min(1.0, core + halo) * vAlpha;',
          '  gl_FragColor = vec4(vColor, alpha);',
          '}'
        ].join('\n')
      });
      var starPoints = new Points(sGeo, starShaderMat);
      starPoints.renderOrder = -19;
      starPoints.frustumCulled = false;
      starPoints.raycast = function () {};
      skyGroup.add(starPoints);
    } else {
      console.error('Deep sky stars skipped: particles layer or BufferGeometry missing');
    }
    scene.add(skyGroup);
    updateSky(performance.now());
  }

  function initSceneEnhancements() {
    var scene = world.scene(), tries = 0;
    var cam = world.camera();
    if (cam && cam.far < 5000) {
      cam.far = 50000;
      cam.updateProjectionMatrix();
    }
    (function tryMount() {
      var pts = null, grat = null, atmo = null, globeObj = null, globeGrp = null;
      scene.traverse(function (o) {
        if (o.isPoints && o.geometry && o.geometry.type === 'BufferGeometry' && o.geometry.attributes && o.geometry.attributes.position && (!pts || o.__globeObjType === 'particles')) pts = o;
        if (!grat && o.isLineSegments && o.geometry && o.material) grat = o;
        if (o.__globeObjType === 'atmosphere') atmo = o;
        if (o.__globeObjType === 'globe') globeGrp = o;
        if (o.isMesh && o.material === world.globeMaterial()) globeObj = o;
      });
      if ((!pts || !grat || !atmo || !globeObj || !globeGrp) && tries++ < 120) {
        requestAnimationFrame(tryMount);
        return;
      }
      var BufGeo = (pts && pts.geometry.constructor) || (grat && Object.getPrototypeOf(Object.getPrototypeOf(grat.geometry)).constructor);
      var FloatAttr = (pts && pts.geometry.attributes.position.constructor) || (grat && grat.geometry.attributes.position.constructor);
      if (grat && BufGeo && FloatAttr) {
        try { addWorldBorders(scene, grat, BufGeo, FloatAttr); }
        catch (e) { console.error('borders failed:', e); }
      }
      if (atmo && globeObj && globeGrp) {
        try { initDeepSky(scene, pts, atmo, globeObj, globeGrp, BufGeo, FloatAttr); }
        catch (e) { console.error('deep sky failed:', e); }
      } else {
        console.error('Deep sky skipped: globe meshes not ready');
      }
    })();
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
      cloudMesh.raycast = function () {};
      globeObj.add(cloudMesh);
    });
  }

  // Unified lightweight animation loop for cloud drift & star twinkle/parallax
  (function startSkyAndCloudLoop() {
    if (reduceMotion) return;
    var lastT = performance.now();
    (function step(now) {
      var dt = Math.min(0.1, (now - lastT) / 1000);
      lastT = now;
      if (!document.hidden) {
        if (cloudMesh) cloudMesh.rotation.y += dt * 0.004;
        updateSky(now);
      }
      requestAnimationFrame(step);
    })(lastT);
  })();

  // High-res 8K day/night terminator shader, 4K relief & ocean gloss, 3D clouds, merged borders, and parallax sky
  world.onGlobeReady(function () {
    initSceneEnhancements();

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
