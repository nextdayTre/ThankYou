/* ============================================================
   Night audio for the Citation Globe — 100% original, generated live
   with the Web Audio API. No audio files, no samples, nothing from
   anywhere else. (Not Nintendo's music: just a calm pad in D major,
   soft pentatonic chimes, a little "night air", and a swoosh that
   follows how fast you spin the globe.)

   Public API (window.NightAudio):
     start()                 create/resume the AudioContext (call from a user gesture)
     setMusic(bool)          night music on/off (fades)
     setFx(bool)             sound effects on/off (swoosh, chimes for panels)
     setVolume(0..1)         overall volume
     spin(degPerSecond)      tell it how fast the globe is turning (swoosh)
     sfx(name)               'open' | 'close' | 'hover' | 'nope' | 'whoosh'
     suspend()/resume()      for hidden tabs
   ============================================================ */
(function () {
  'use strict';
  var AC = window.AudioContext || window.webkitAudioContext;
  var ctx = null, master, comp, musicGain, fxGain, reverb, reverbIn;
  var musicOn = false, fxOn = false, volume = 0.5;
  var padTimer = null, chimeTimer = null, padVoices = [], chordIdx = 0, musicBuilt = false;
  var swooshGain, swooshBP, swooshHP, swooshSmooth = 0, lastSpinT = 0;
  var analyser = null;

  function mtof(m) { return 440 * Math.pow(2, (m - 69) / 12); }
  function rand(a, b) { return a + Math.random() * (b - a); }
  function masterLevel() { return Math.pow(volume, 1.5); }

  // Slow, warm progression in D major (all notes are in the scale): Dmaj9 → Bm9 → Gmaj7 → Asus2
  var CHORDS = [
    [50, 57, 61, 64, 69],
    [47, 54, 57, 61, 64],
    [43, 50, 54, 59, 62],
    [45, 52, 57, 62, 64]
  ];
  var PENTA = [74, 76, 78, 81, 83, 86];   // D5 E5 F#5 A5 B5 D6 — D major pentatonic
  var CHORD_SECONDS = 15;

  function makeNoise(seconds, color) {
    var len = Math.floor(ctx.sampleRate * seconds), buf = ctx.createBuffer(1, len, ctx.sampleRate), d = buf.getChannelData(0), last = 0;
    for (var i = 0; i < len; i++) {
      var w = Math.random() * 2 - 1;
      if (color === 'brown') { last = (last + 0.02 * w) / 1.02; d[i] = last * 3.5; } else d[i] = w;
    }
    return buf;
  }
  function makeImpulse(seconds, decay) {
    var rate = ctx.sampleRate, len = Math.floor(rate * seconds), buf = ctx.createBuffer(2, len, rate);
    for (var ch = 0; ch < 2; ch++) {
      var d = buf.getChannelData(ch), lp = 0;
      for (var i = 0; i < len; i++) {
        var t = i / len, w = Math.random() * 2 - 1;
        var a = 0.55 - 0.5 * t;                 // darker tail as it decays
        lp = lp + a * (w - lp);
        d[i] = lp * Math.pow(1 - t, decay) * (i < 400 ? i / 400 : 1);
      }
    }
    return buf;
  }

  function build() {
    ctx = new AC();
    comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -20; comp.knee.value = 24; comp.ratio.value = 4; comp.attack.value = 0.02; comp.release.value = 0.4;
    master = ctx.createGain(); master.gain.value = masterLevel();
    master.connect(comp); comp.connect(ctx.destination);
    analyser = ctx.createAnalyser(); analyser.fftSize = 2048; comp.connect(analyser);

    reverb = ctx.createConvolver(); reverb.buffer = makeImpulse(5.5, 3.2);
    var wet = ctx.createGain(); wet.gain.value = 0.9;
    reverbIn = ctx.createGain(); reverbIn.gain.value = 1;
    reverbIn.connect(reverb); reverb.connect(wet); wet.connect(master);

    musicGain = ctx.createGain(); musicGain.gain.value = 0; musicGain.connect(master);
    fxGain = ctx.createGain(); fxGain.gain.value = fxOn ? 1 : 0; fxGain.connect(master);

    // swoosh chain (always running, silent until you spin): noise → band-pass → high-pass → gain
    var src = ctx.createBufferSource(); src.buffer = makeNoise(3, 'white'); src.loop = true;
    swooshBP = ctx.createBiquadFilter(); swooshBP.type = 'bandpass'; swooshBP.frequency.value = 400; swooshBP.Q.value = 0.7;
    swooshHP = ctx.createBiquadFilter(); swooshHP.type = 'highpass'; swooshHP.frequency.value = 120;
    swooshGain = ctx.createGain(); swooshGain.gain.value = 0;
    src.connect(swooshBP); swooshBP.connect(swooshHP); swooshHP.connect(swooshGain); swooshGain.connect(fxGain);
    var swooshWet = ctx.createGain(); swooshWet.gain.value = 0.25; swooshGain.connect(swooshWet); swooshWet.connect(reverbIn);
    src.start();
  }

  /* ---------- music ---------- */
  function buildMusicBed() {
    if (musicBuilt) return; musicBuilt = true;
    // shared pad bus with a warm low-pass that drifts slowly
    var padBus = ctx.createGain(); padBus.gain.value = 0.55;
    var padLP = ctx.createBiquadFilter(); padLP.type = 'lowpass'; padLP.frequency.value = 850; padLP.Q.value = 0.3;
    padBus.connect(padLP);
    var dry = ctx.createGain(); dry.gain.value = 0.55; padLP.connect(dry); dry.connect(musicGain);
    var send = ctx.createGain(); send.gain.value = 0.85; padLP.connect(send); send.connect(reverbIn);
    var lfo = ctx.createOscillator(), lfoG = ctx.createGain(); lfo.frequency.value = 0.045; lfoG.gain.value = 220; lfo.connect(lfoG); lfoG.connect(padLP.frequency); lfo.start();
    var trem = ctx.createOscillator(), tremG = ctx.createGain(); trem.frequency.value = 0.07; tremG.gain.value = 0.08; trem.connect(tremG); tremG.connect(padBus.gain); trem.start();
    buildMusicBed.padBus = padBus;

    // "night air": very soft filtered noise that breathes
    var air = ctx.createBufferSource(); air.buffer = makeNoise(6, 'brown'); air.loop = true;
    var airBP = ctx.createBiquadFilter(); airBP.type = 'bandpass'; airBP.frequency.value = 520; airBP.Q.value = 0.35;
    var airLP = ctx.createBiquadFilter(); airLP.type = 'lowpass'; airLP.frequency.value = 1400;
    var airG = ctx.createGain(); airG.gain.value = 0.05;
    var airLfo = ctx.createOscillator(), airLfoG = ctx.createGain(); airLfo.frequency.value = 0.06; airLfoG.gain.value = 0.03;
    airLfo.connect(airLfoG); airLfoG.connect(airG.gain); airLfo.start();
    air.connect(airBP); airBP.connect(airLP); airLP.connect(airG); airG.connect(musicGain);
    var airSend = ctx.createGain(); airSend.gain.value = 0.4; airG.connect(airSend); airSend.connect(reverbIn);
    air.start();
  }

  function playChord(notes) {
    var now = ctx.currentTime, bus = buildMusicBed.padBus, voices = [];
    notes.forEach(function (m, i) {
      var f = mtof(m), g = ctx.createGain(); g.gain.value = 0;
      var o1 = ctx.createOscillator(), o2 = ctx.createOscillator(), o3 = ctx.createOscillator();
      o1.type = 'sine'; o1.frequency.value = f; o1.detune.value = rand(-6, -2);
      o2.type = 'triangle'; o2.frequency.value = f; o2.detune.value = rand(2, 7);
      o3.type = 'sine'; o3.frequency.value = f * 2; o3.detune.value = rand(-4, 4);     // soft octave shimmer
      var g1 = ctx.createGain(), g2 = ctx.createGain(), g3 = ctx.createGain();
      g1.gain.value = 0.6; g2.gain.value = 0.35; g3.gain.value = 0.08;
      o1.connect(g1); o2.connect(g2); o3.connect(g3); g1.connect(g); g2.connect(g); g3.connect(g);
      // pan voices gently across the field
      var pan = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
      if (pan) { pan.pan.value = (i / (notes.length - 1)) * 1.2 - 0.6; g.connect(pan); pan.connect(bus); } else g.connect(bus);
      var peak = (m < 52 ? 0.075 : 0.05) * rand(0.85, 1.1);
      g.gain.setValueAtTime(0.0001, now);
      g.gain.setTargetAtTime(peak, now + i * 0.35, 3.2);                              // slow bloom
      o1.start(now); o2.start(now); o3.start(now);
      voices.push({ g: g, oscs: [o1, o2, o3] });
    });
    // fade the previous chord out under the new one
    var old = padVoices; padVoices = voices;
    old.forEach(function (v) {
      v.g.gain.cancelScheduledValues(now);
      v.g.gain.setTargetAtTime(0.0001, now + 3, 3.5);
      v.oscs.forEach(function (o) { try { o.stop(now + 3 + 3.5 * 6); } catch (e) { /* */ } });
    });
  }

  function chime(delay) {
    var now = ctx.currentTime + (delay || 0), m = PENTA[Math.floor(Math.random() * PENTA.length)], f = mtof(m);
    var partials = [[1, 1, 4.2], [2.76, 0.22, 2.2], [5.4, 0.07, 1.2]];
    var out = ctx.createGain(); out.gain.value = 0.045 * rand(0.7, 1.1);
    var pan = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
    if (pan) { pan.pan.value = rand(-0.7, 0.7); out.connect(pan); pan.connect(musicGain); var s = ctx.createGain(); s.gain.value = 1.2; pan.connect(s); s.connect(reverbIn); }
    else { out.connect(musicGain); out.connect(reverbIn); }
    partials.forEach(function (p) {
      var o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'sine'; o.frequency.value = f * p[0];
      g.gain.setValueAtTime(0.0001, now); g.gain.exponentialRampToValueAtTime(p[1], now + 0.015); g.gain.exponentialRampToValueAtTime(0.0001, now + p[2]);
      o.connect(g); g.connect(out); o.start(now); o.stop(now + p[2] + 0.1);
    });
  }
  function chimeLoop() {
    if (!musicOn || !ctx) return;
    chime(0); if (Math.random() < 0.3) chime(rand(0.35, 0.8));
    chimeTimer = setTimeout(chimeLoop, rand(6000, 13000));
  }
  function padLoop() {
    if (!musicOn || !ctx) return;
    playChord(CHORDS[chordIdx % CHORDS.length]); chordIdx++;
    padTimer = setTimeout(padLoop, CHORD_SECONDS * 1000);
  }

  function startMusic() {
    if (!ctx) return;
    buildMusicBed();
    musicGain.gain.cancelScheduledValues(ctx.currentTime);
    musicGain.gain.setTargetAtTime(1, ctx.currentTime, 1.6);
    clearTimeout(padTimer); clearTimeout(chimeTimer);
    padLoop(); chimeTimer = setTimeout(chimeLoop, 4500);
  }
  function stopMusic() {
    clearTimeout(padTimer); clearTimeout(chimeTimer);
    if (!ctx) return;
    musicGain.gain.cancelScheduledValues(ctx.currentTime);
    musicGain.gain.setTargetAtTime(0, ctx.currentTime, 0.9);
    var now = ctx.currentTime, old = padVoices; padVoices = [];
    old.forEach(function (v) { v.g.gain.cancelScheduledValues(now); v.g.gain.setTargetAtTime(0.0001, now, 0.6); v.oscs.forEach(function (o) { try { o.stop(now + 5); } catch (e) { /* */ } }); });
  }

  /* ---------- effects ---------- */
  function bell(freq, t0, dur, vol) {
    var now = ctx.currentTime + t0, o = ctx.createOscillator(), g = ctx.createGain(), o2 = ctx.createOscillator(), g2 = ctx.createGain();
    o.type = 'sine'; o.frequency.value = freq; o2.type = 'sine'; o2.frequency.value = freq * 2.76;
    g.gain.setValueAtTime(0.0001, now); g.gain.exponentialRampToValueAtTime(vol, now + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, now + dur);
    g2.gain.setValueAtTime(0.0001, now); g2.gain.exponentialRampToValueAtTime(vol * 0.18, now + 0.01); g2.gain.exponentialRampToValueAtTime(0.0001, now + dur * 0.5);
    o.connect(g); o2.connect(g2); g.connect(fxGain); g2.connect(fxGain);
    var s = ctx.createGain(); s.gain.value = 0.7; g.connect(s); s.connect(reverbIn);
    o.start(now); o2.start(now); o.stop(now + dur + 0.1); o2.stop(now + dur + 0.1);
  }
  var SFX = {
    hover: function () { bell(mtof(88), 0, 0.35, 0.012); },
    open: function () { bell(mtof(74), 0, 1.4, 0.05); bell(mtof(81), 0.09, 1.6, 0.045); bell(mtof(86), 0.19, 2.0, 0.035); },
    close: function () { bell(mtof(81), 0, 0.9, 0.04); bell(mtof(74), 0.09, 1.3, 0.04); },
    nope: function () { bell(mtof(62), 0, 0.7, 0.04); },
    whoosh: function () {
      var now = ctx.currentTime, src = ctx.createBufferSource(); src.buffer = makeNoise(1.2, 'white');
      var bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = 0.9;
      bp.frequency.setValueAtTime(300, now); bp.frequency.exponentialRampToValueAtTime(1600, now + 0.35); bp.frequency.exponentialRampToValueAtTime(500, now + 1.0);
      var g = ctx.createGain(); g.gain.setValueAtTime(0.0001, now); g.gain.exponentialRampToValueAtTime(0.05, now + 0.3); g.gain.exponentialRampToValueAtTime(0.0001, now + 1.1);
      src.connect(bp); bp.connect(g); g.connect(fxGain); src.start(now); src.stop(now + 1.25);
    }
  };

  // The swoosh follows the globe's angular speed (degrees/second): louder and brighter when you
  // spin faster, fading out with the inertia. Smoothed and capped so it never gets harsh.
  var SPIN_MIN = 7, SPIN_MAX = 150;
  function spin(deg) {
    if (!ctx || !fxOn) return;
    var t = ctx.currentTime, dt = Math.min(0.25, Math.max(0.01, t - (lastSpinT || t - 0.05))); lastSpinT = t;
    var target = Math.max(0, Math.min(1, (deg - SPIN_MIN) / (SPIN_MAX - SPIN_MIN)));
    var k = target > swooshSmooth ? 1 - Math.exp(-dt / 0.12) : 1 - Math.exp(-dt / 0.45);   // quick rise, slow tail
    swooshSmooth += (target - swooshSmooth) * k;
    var s = swooshSmooth;
    swooshGain.gain.setTargetAtTime(Math.pow(s, 1.4) * 0.11, t, 0.05);
    swooshBP.frequency.setTargetAtTime(260 + s * 2100, t, 0.06);
    swooshBP.Q.setTargetAtTime(0.6 + s * 0.5, t, 0.1);
    swooshHP.frequency.setTargetAtTime(90 + s * 380, t, 0.1);
  }

  window.NightAudio = {
    supported: !!AC,
    start: function () {
      if (!AC) return false;
      if (!ctx) build();
      if (ctx.state === 'suspended') ctx.resume();
      return true;
    },
    setMusic: function (on) {
      on = !!on; if (on === musicOn) return; musicOn = on;
      if (!ctx) return; if (on) startMusic(); else stopMusic();
    },
    setFx: function (on) {
      fxOn = !!on; if (!ctx) return;
      fxGain.gain.setTargetAtTime(fxOn ? 1 : 0, ctx.currentTime, 0.15);
      if (!fxOn) { swooshSmooth = 0; swooshGain.gain.setTargetAtTime(0, ctx.currentTime, 0.1); }
    },
    setVolume: function (v) {
      volume = Math.max(0, Math.min(1, +v || 0));
      if (ctx) master.gain.setTargetAtTime(masterLevel(), ctx.currentTime, 0.1);
    },
    spin: spin,
    sfx: function (name) { if (ctx && fxOn && SFX[name] && ctx.state === 'running') { try { SFX[name](); } catch (e) { /* ignore */ } } },
    suspend: function () { if (ctx && ctx.state === 'running') ctx.suspend(); },
    resume: function () { if (ctx && ctx.state === 'suspended') ctx.resume(); },
    // for tests only: current output peak (0..1)
    _peak: function () {
      if (!analyser) return 0; var d = new Float32Array(analyser.fftSize); analyser.getFloatTimeDomainData(d);
      var p = 0; for (var i = 0; i < d.length; i++) p = Math.max(p, Math.abs(d[i])); return p;
    },
    _level: function () { return swooshSmooth; },
    _state: function () { return ctx ? ctx.state : 'none'; }
  };
})();
