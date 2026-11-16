// ============================================================
// music.js — audio engine: SFX synthesizer + music player
// (Plays local song.mp3 if present, or beautiful music-box synth
//  fallback that works 100% offline, on localhost & mobile!)
// ============================================================

// ── Shared AudioContext & Mobile Unlocker ──────────────────────
let audioCtx = null;

function getAudioCtx() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

// iOS & Mobile Safari/Chrome user gesture audio unlock
function unlockAudioEngine() {
  const ctx = getAudioCtx();
  if (ctx) {
    // Play a tiny silent buffer to warm up audio pipeline
    try {
      const buf = ctx.createBuffer(1, 1, 22050);
      const src = ctx.createBufferSource();
      src.buffer = buf;
      src.connect(ctx.destination);
      src.start(0);
    } catch (e) {}
  }
}
['pointerdown', 'touchstart', 'click', 'keydown'].forEach(evt => {
  window.addEventListener(evt, unlockAudioEngine, { once: false, passive: true });
});

// ════════════════════════════════════════════════════════════
// SFX ENGINE (Cute synthesized sound effects)
// ════════════════════════════════════════════════════════════
const sfx = {
  // Soft woody / bubble tap on keypad & buttons
  tap() {
    const ctx = getAudioCtx();
    if (!ctx || musicPlayer.isMuted) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const now = ctx.currentTime;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(420, now);
      osc.frequency.exponentialRampToValueAtTime(180, now + 0.04);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.05);
    } catch (e) {}
  },

  // Pop sound for balloons, card flips, polaroids, stickers
  pop() {
    const ctx = getAudioCtx();
    if (!ctx || musicPlayer.isMuted) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const now = ctx.currentTime;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(260, now);
      osc.frequency.exponentialRampToValueAtTime(840, now + 0.05);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.08);
    } catch (e) {}
  },

  // Magical sparkle chimes (correct code, pair match, candle, mochi)
  sparkle() {
    const ctx = getAudioCtx();
    if (!ctx || musicPlayer.isMuted) return;
    try {
      const notes = [659.25, 783.99, 987.77, 1318.51, 1567.98]; // E5, G5, B5, E6, G6
      const now = ctx.currentTime;

      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const t = now + idx * 0.05;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t);

        gain.gain.setValueAtTime(0.18, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(t);
        osc.stop(t + 0.36);
      });
    } catch (e) {}
  },

  // Soft whoosh breath for candle blow
  blow() {
    const ctx = getAudioCtx();
    if (!ctx || musicPlayer.isMuted) return;
    try {
      // Filtered noise buffer
      const bufferSize = ctx.sampleRate * 0.25;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(700, ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.25);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noise.start(ctx.currentTime);
    } catch (e) {}
  },

  // Celebratory fanfare (all candles out, game win, gift opened)
  cheer() {
    const ctx = getAudioCtx();
    if (!ctx || musicPlayer.isMuted) return;
    try {
      const chords = [
        [523.25, 659.25, 783.99],          // C maj
        [587.33, 739.99, 880.00],          // D maj
        [659.25, 783.99, 987.77],          // E min
        [1046.50, 1318.51, 1567.98, 2093] // C6 grand chime
      ];
      const now = ctx.currentTime;

      chords.forEach((chord, step) => {
        const t = now + step * 0.12;
        chord.forEach(freq => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, t);

          gain.gain.setValueAtTime(0.15, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(t);
          osc.stop(t + 0.55);
        });
      });
    } catch (e) {}
  },

  // Gentle cute error sound for wrong passcode
  wrong() {
    const ctx = getAudioCtx();
    if (!ctx || musicPlayer.isMuted) return;
    try {
      const freqs = [280, 210];
      const now = ctx.currentTime;
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const t = now + idx * 0.12;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t);

        gain.gain.setValueAtTime(0.2, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(t);
        osc.stop(t + 0.15);
      });
    } catch (e) {}
  },

  // Gentle paper rustle / tab page turn
  paper() {
    const ctx = getAudioCtx();
    if (!ctx || musicPlayer.isMuted) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      const now = ctx.currentTime;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(320, now + 0.08);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(450, now);
      filter.Q.setValueAtTime(1.5, now);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.11);
    } catch (e) {}
  }
};

window.sfx = sfx;

// ════════════════════════════════════════════════════════════
// MUSIC PLAYER (Audio file + Lo-Fi Music Box Synth fallback)
// ════════════════════════════════════════════════════════════
const musicPlayer = (() => {
  let audioEl = null;
  let isPlaying = false;
  let isMuted = localStorage.getItem('muted') === '1';
  let volume = 0.6;
  let expanded = false;
  let useSynth = false;

  // Synth state
  let synthTimer = null;
  let synthStep = 0;
  let masterSynthGain = null;

  // Romantic music box melody & chords for Iniya 💗
  // Notes in Hz
  const N = {
    C3: 130.81, E3: 164.81, F3: 174.61, G3: 196.00, A3: 220.00,
    C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.00, A4: 440.00, B4: 493.88,
    C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.00, B5: 987.77,
    C6: 1046.50, D6: 1174.66, E6: 1318.51
  };

  // 16-bar sequence (melody notes + accompaniment chords)
  const MELODY_SEQUENCE = [
    // Bar 1 - C maj
    { bass: N.C3, chord: [N.E4, N.G4], mel: N.C5, dur: 0.35 },
    { chord: [N.E4, N.G4], mel: N.E5, dur: 0.35 },
    { chord: [N.G4, N.C5], mel: N.G5, dur: 0.35 },
    { chord: [N.E4, N.G4], mel: N.E5, dur: 0.35 },

    // Bar 2 - A min
    { bass: N.A3, chord: [N.C4, N.E4], mel: N.A4, dur: 0.35 },
    { chord: [N.C4, N.E4], mel: N.C5, dur: 0.35 },
    { chord: [N.E4, N.A4], mel: N.E5, dur: 0.35 },
    { chord: [N.C4, N.E4], mel: N.D5, dur: 0.35 },

    // Bar 3 - F maj
    { bass: N.F3, chord: [N.A3, N.C4], mel: N.F4, dur: 0.35 },
    { chord: [N.A3, N.C4], mel: N.A4, dur: 0.35 },
    { chord: [N.C4, N.F4], mel: N.C5, dur: 0.35 },
    { chord: [N.A3, N.C4], mel: N.A4, dur: 0.35 },

    // Bar 4 - G maj
    { bass: N.G3, chord: [N.B3, N.D4], mel: N.G4, dur: 0.35 },
    { chord: [N.B3, N.D4], mel: N.B4, dur: 0.35 },
    { chord: [N.D4, N.G4], mel: N.D5, dur: 0.35 },
    { chord: [N.B3, N.D4], mel: N.B4, dur: 0.35 },

    // Bar 5 - E min
    { bass: N.E3, chord: [N.G3, N.B3], mel: N.G4, dur: 0.35 },
    { chord: [N.G3, N.B3], mel: N.B4, dur: 0.35 },
    { chord: [N.B3, N.E4], mel: N.E5, dur: 0.35 },
    { chord: [N.G3, N.B3], mel: N.G5, dur: 0.35 },

    // Bar 6 - F maj
    { bass: N.F3, chord: [N.A3, N.C4], mel: N.F5, dur: 0.35 },
    { chord: [N.A3, N.C4], mel: N.E5, dur: 0.35 },
    { chord: [N.C4, N.F4], mel: N.D5, dur: 0.35 },
    { chord: [N.A3, N.C4], mel: N.C5, dur: 0.35 },

    // Bar 7 - G maj (climax)
    { bass: N.G3, chord: [N.B3, N.D4], mel: N.D5, dur: 0.35 },
    { chord: [N.B3, N.D4], mel: N.E5, dur: 0.35 },
    { chord: [N.D4, N.G4], mel: N.F5, dur: 0.35 },
    { chord: [N.B3, N.D4], mel: N.D5, dur: 0.35 },

    // Bar 8 - C maj (sweet resolution)
    { bass: N.C3, chord: [N.E4, N.G4], mel: N.C5, dur: 0.35 },
    { chord: [N.E4, N.G4], mel: N.G4, dur: 0.35 },
    { chord: [N.G4, N.C5], mel: N.E5, dur: 0.35 },
    { chord: [N.E4, N.G4], mel: N.C6, dur: 0.45 }
  ];

  function playMusicBoxBell(ctx, freq, startTime, duration = 0.8, amp = 0.15) {
    if (!ctx || !masterSynthGain || !freq) return;

    // Dual oscillator: sine for warm bell body, triangle with octave harmonic for sparkle
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const noteGain = ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(freq, startTime);

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(freq * 2, startTime); // upper harmonic

    // Warm lowpass filter to emulate real music-box tines
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2600, startTime);

    // Exponential decay envelope
    noteGain.gain.setValueAtTime(0.0001, startTime);
    noteGain.gain.exponentialRampToValueAtTime(amp, startTime + 0.008);
    noteGain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(noteGain);
    noteGain.connect(masterSynthGain);

    osc1.start(startTime);
    osc2.start(startTime);
    osc1.stop(startTime + duration + 0.05);
    osc2.stop(startTime + duration + 0.05);
  }

  function startSynthSequencer() {
    const ctx = getAudioCtx();
    if (!ctx) return;

    if (!masterSynthGain) {
      masterSynthGain = ctx.createGain();
      masterSynthGain.connect(ctx.destination);
    }
    masterSynthGain.gain.setValueAtTime(isMuted ? 0 : volume * 0.45, ctx.currentTime);

    function step() {
      if (!isPlaying || !useSynth) return;
      const currentCtx = getAudioCtx();
      if (!currentCtx) return;

      const item = MELODY_SEQUENCE[synthStep % MELODY_SEQUENCE.length];
      const now = currentCtx.currentTime;

      // Play bass note
      if (item.bass) {
        playMusicBoxBell(currentCtx, item.bass, now, 1.2, 0.18);
      }
      // Play arpeggio chord note
      if (item.chord && item.chord.length > 0) {
        item.chord.forEach((chFreq, i) => {
          playMusicBoxBell(currentCtx, chFreq, now + i * 0.03, 0.7, 0.1);
        });
      }
      // Play main melody bell
      if (item.mel) {
        playMusicBoxBell(currentCtx, item.mel, now + 0.02, 0.9, 0.22);
      }

      synthStep++;
      const nextDelay = (item.dur || 0.35) * 1000;
      synthTimer = setTimeout(step, nextDelay);
    }

    clearTimeout(synthTimer);
    step();
  }

  function stopSynthSequencer() {
    clearTimeout(synthTimer);
    synthTimer = null;
  }

  function init() {
    const player = document.getElementById('music-player');
    if (!player) return;
    player.classList.add('visible');

    // Attempt to load CONFIG.SONG.src
    audioEl = new Audio();
    audioEl.src = CONFIG.SONG.src;
    audioEl.loop = true;
    audioEl.volume = isMuted ? 0 : volume;

    audioEl.addEventListener('error', () => {
      // Audio file missing or 404 (common on fresh localhost) -> seamlessly use synth!
      useSynth = true;
      updateUI();
    });

    audioEl.addEventListener('canplaythrough', () => {
      useSynth = false;
      updateUI();
    });

    // Update player text
    const title = player.querySelector('.music-title');
    if (title) title.textContent = `🎵 ${CONFIG.SONG.title} — ${CONFIG.SONG.artist}`;

    const cassette = player.querySelector('.music-cassette');
    cassette?.addEventListener('click', (e) => {
      e.stopPropagation();
      sfx.tap();
      togglePlayPause();
    });
    cassette?.addEventListener('contextmenu', e => {
      e.preventDefault();
      togglePanel();
    });

    const panelBtn = player.querySelector('.music-panel-toggle');
    panelBtn?.addEventListener('click', () => {
      sfx.tap();
      togglePanel();
    });

    const playBtn = player.querySelector('.music-play-btn');
    playBtn?.addEventListener('click', () => {
      sfx.tap();
      togglePlayPause();
    });

    const muteBtn = player.querySelector('.music-mute-btn');
    muteBtn?.addEventListener('click', () => {
      sfx.tap();
      toggleMute();
    });

    const vol = player.querySelector('.music-vol');
    vol?.addEventListener('input', e => {
      volume = parseFloat(e.target.value);
      if (audioEl) audioEl.volume = isMuted ? 0 : volume;
      if (masterSynthGain && audioCtx) {
        masterSynthGain.gain.setValueAtTime(isMuted ? 0 : volume * 0.45, audioCtx.currentTime);
      }
    });

    document.addEventListener('click', e => {
      if (!player.contains(e.target)) closePanel();
    });

    updateUI();
  }

  function play() {
    getAudioCtx();
    isPlaying = true;

    if (!useSynth && audioEl) {
      audioEl.play().catch(() => {
        // Autoplay policy or 404 error: fall back to synth
        useSynth = true;
        startSynthSequencer();
      });
    } else {
      useSynth = true;
      startSynthSequencer();
    }
    updateUI();
  }

  function pause() {
    isPlaying = false;
    if (audioEl) audioEl.pause();
    stopSynthSequencer();
    updateUI();
  }

  function togglePlayPause() {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }

  function toggleMute() {
    isMuted = !isMuted;
    localStorage.setItem('muted', isMuted ? '1' : '0');

    if (audioEl) audioEl.volume = isMuted ? 0 : volume;
    if (masterSynthGain && audioCtx) {
      masterSynthGain.gain.setValueAtTime(isMuted ? 0 : volume * 0.45, audioCtx.currentTime);
    }
    updateUI();
  }

  function togglePanel() {
    expanded = !expanded;
    const panel = document.querySelector('.music-panel');
    if (panel) panel.classList.toggle('open', expanded);
  }

  function closePanel() {
    expanded = false;
    const panel = document.querySelector('.music-panel');
    if (panel) panel.classList.remove('open');
  }

  function updateUI() {
    const reels = document.querySelectorAll('.cassette-reel');
    reels.forEach(r => r.classList.toggle('spinning', isPlaying && !isMuted));

    const playBtn = document.querySelector('.music-play-btn');
    if (playBtn) playBtn.textContent = isPlaying ? '⏸' : '▶';

    const muteBtn = document.querySelector('.music-mute-btn');
    if (muteBtn) muteBtn.textContent = isMuted ? '🔇' : '🔊';

    const noFileEl = document.querySelector('.music-no-file');
    if (noFileEl) {
      if (useSynth) {
        noFileEl.style.display = 'block';
        noFileEl.textContent = '✨ playing music-box melody 💗';
      } else {
        noFileEl.style.display = 'none';
      }
    }

    const cassette = document.querySelector('.music-cassette');
    if (cassette) {
      cassette.title = isPlaying ? 'pause music' : 'play music';
    }
  }

  return {
    init,
    play,
    pause,
    togglePlayPause,
    toggleMute,
    get isMuted() { return isMuted; },
    get isPlaying() { return isPlaying; }
  };
})();

window.musicPlayer = musicPlayer;
