// ============================================================
// games.js — Photo Book, Memories, Letter, Arcade (3 Games)
// ============================================================

/* ── Flags ───────────────────────────────────────────────── */
let photosInitialized   = false;
let memoriesInitialized = false;
let letterInitialized   = false;
let arcadeInitialized   = false;

/* ═══════════════════════════════════════════════════════════
   TAB 2 — PHOTO BOOK
═══════════════════════════════════════════════════════════ */
function initPhotos() {
  photosInitialized = true;
  const collage = document.getElementById('photo-collage');
  if (!collage) return;
  collage.innerHTML = '';

  CONFIG.photos.forEach((photo, i) => {
    const polaroid = document.createElement('div');
    polaroid.className = 'polaroid';
    polaroid.style.setProperty('--i', i);
    const rots = [-4, -2, 3, -3, 5, -1, 2, -4, 3];
    polaroid.style.setProperty('--rot', (rots[i % rots.length]) + 'deg');
    polaroid.tabIndex = 0;
    polaroid.setAttribute('role', 'button');
    polaroid.setAttribute('aria-label', `Open photo: ${photo.caption}`);

    const tapeClass = i % 2 === 0 ? 'gingham' : 'solid';
    const tape = document.createElement('div');
    tape.className = `polaroid-tape ${tapeClass}`;
    polaroid.appendChild(tape);

    // Image with placeholder fallback
    const img = document.createElement('img');
    img.className = 'polaroid-img';
    img.alt = photo.caption;
    img.loading = 'lazy';
    img.src = photo.src;
    img.onerror = () => {
      img.replaceWith(makePlaceholder());
    };
    polaroid.appendChild(img);

    const caption = document.createElement('div');
    caption.className = 'polaroid-caption';
    caption.textContent = photo.caption;
    polaroid.appendChild(caption);

    polaroid.addEventListener('click', e => {
      if (window.sfx) { window.sfx.pop(); window.sfx.sparkle(); }
      openLightbox(i);
      spawnHeartBurst(e.clientX, e.clientY);
    });
    polaroid.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        if (window.sfx) window.sfx.pop();
        openLightbox(i);
      }
    });

    collage.appendChild(polaroid);
  });

  // Lightbox navigation
  document.getElementById('lb-prev')?.addEventListener('click', () => {
    if (window.sfx) window.sfx.tap();
    shiftLightbox(-1);
  });
  document.getElementById('lb-next')?.addEventListener('click', () => {
    if (window.sfx) window.sfx.tap();
    shiftLightbox(1);
  });
  document.getElementById('lb-close')?.addEventListener('click', () => {
    if (window.sfx) window.sfx.tap();
    closeLightbox();
  });
  document.getElementById('lightbox')?.addEventListener('click', e => {
    if (e.target === document.getElementById('lightbox')) closeLightbox();
  });

  // Swipe gesture on mobile lightbox
  let lbTouchX = 0;
  document.getElementById('lightbox')?.addEventListener('touchstart', e => {
    lbTouchX = e.touches[0].clientX;
  }, { passive: true });
  document.getElementById('lightbox')?.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - lbTouchX;
    if (Math.abs(dx) > 40) {
      if (window.sfx) window.sfx.tap();
      shiftLightbox(dx < 0 ? 1 : -1);
    }
  }, { passive: true });
}

function makePlaceholder() {
  const ph = document.createElement('div');
  ph.className = 'polaroid-placeholder';
  ph.innerHTML = '<span style="font-size:2rem">💗</span><span>add photo here</span>';
  return ph;
}

let currentLightboxIndex = 0;
function openLightbox(index) {
  currentLightboxIndex = index;
  const lb = document.getElementById('lightbox');
  lb.classList.add('open');
  updateLightbox();
}
function closeLightbox() {
  document.getElementById('lightbox')?.classList.remove('open');
}
function shiftLightbox(dir) {
  currentLightboxIndex = (currentLightboxIndex + dir + CONFIG.photos.length) % CONFIG.photos.length;
  updateLightbox();
}
function updateLightbox() {
  const photo = CONFIG.photos[currentLightboxIndex];
  const img = document.getElementById('lb-img');
  const cap = document.getElementById('lb-caption');
  if (img) {
    img.src = photo.src;
    img.alt = photo.caption;
    img.onerror = () => { img.src = ''; img.alt = photo.caption; };
  }
  if (cap) cap.textContent = photo.caption;
}

/* ═══════════════════════════════════════════════════════════
   TAB 3 — MEMORIES
═══════════════════════════════════════════════════════════ */
function initMemories() {
  memoriesInitialized = true;
  buildMemoryCards();
  buildQualityStickers();
  buildClosingNote();
  setupMemoryScrollReveal();
}

function buildMemoryCards() {
  const container = document.getElementById('memory-cards');
  if (!container) return;

  CONFIG.memories.forEach((mem, i) => {
    const card = document.createElement('div');
    card.className = 'memory-card';
    card.style.setProperty('--i', i);

    let innerHtml = `<div class="mem-inner ${mem.style}">
      <div class="mem-title">${getMemSticker(mem.sticker)} ${mem.title}</div>
      <div class="mem-text">${mem.text}</div>`;

    if (mem.style === 'chat-bubble') {
      innerHtml += `<div class="typing-dots" aria-hidden="true">
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
      </div>`;
    }
    if (mem.style === 'calendar') {
      innerHtml += buildCalendar(mem.date);
    }

    innerHtml += `</div>`;

    // Tape decoration
    innerHtml += `<div style="position:absolute;top:-8px;left:${i % 2 === 0 ? '20px' : 'auto'};right:${i % 2 === 1 ? '20px' : 'auto'};
      width:40px;height:12px;border-radius:3px;
      background:repeating-linear-gradient(90deg,var(--rose) 0,var(--rose) 6px,var(--blush) 6px,var(--blush) 12px);
      opacity:.8;transform:rotate(${i % 2 === 0 ? '-3deg' : '3deg'});"></div>`;

    card.innerHTML = innerHtml;
    container.appendChild(card);
  });
}

function getMemSticker(type) {
  const stickers = {
    camera:   '📷',
    bow:      '🎀',
    envelope: '💌',
    heart:    '💗',
    star:     '⭐'
  };
  return stickers[type] || '✨';
}

function buildCalendar(highlightDay) {
  const days = ['Su','Mo','Tu','We','Th','Fr','Sa'];
  const startDay = 4; // May 1, 2025 is Thursday
  const totalDays = 31;
  let html = `<div class="calendar-grid" aria-label="May 2025">`;
  days.forEach(d => { html += `<div class="cal-day header">${d}</div>`; });
  for (let i = 0; i < startDay; i++) html += `<div class="cal-day"></div>`;
  for (let d = 1; d <= totalDays; d++) {
    if (d == highlightDay) {
      html += `<div class="cal-day special" aria-label="May 6, 2025 — our beginning">
        <svg class="heart-circle" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12,21 C12,21 3,15 3,9 A5,5 0 0,1 12,6 A5,5 0 0,1 21,9 C21,15 12,21 12,21Z"
            stroke="#C8323C" stroke-width="2" fill="none"
            stroke-dasharray="60" stroke-dashoffset="60"
            style="animation:heart-draw 1.5s .5s ease forwards;"/>
        </svg>
        ${d}
      </div>`;
    } else {
      html += `<div class="cal-day">${d}</div>`;
    }
  }
  html += `</div><p style="text-align:center;margin-top:8px;font-size:.75rem;">
    <strong>06.05.2025 ♡</strong></p>`;
  return html;
}

function buildQualityStickers() {
  const row = document.getElementById('qualities-row');
  if (!row) return;
  CONFIG.qualities.forEach((q, i) => {
    const btn = document.createElement('div');
    btn.className = 'quality-sticker';
    btn.setAttribute('role', 'button');
    btn.setAttribute('tabindex', '0');
    btn.setAttribute('aria-label', `Flip to reveal: ${q}`);
    btn.innerHTML = `<span class="quality-front">✨ tap me!</span>
                     <span class="quality-back">${q}</span>`;
    btn.addEventListener('click', () => {
      if (window.sfx) window.sfx.pop();
      btn.classList.toggle('flipped');
      spawnHeartBurst(btn.getBoundingClientRect().left + 20, btn.getBoundingClientRect().top + 20);
    });
    btn.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        btn.click();
      }
    });
    row.appendChild(btn);
  });
}

function buildClosingNote() {
  const note = document.getElementById('closing-note');
  if (!note) return;
  note.innerHTML = CONFIG.closingNote.map(l => `<p>${l}</p>`).join('');
}

function setupMemoryScrollReveal() {
  const cards = document.querySelectorAll('.memory-card');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  cards.forEach(c => observer.observe(c));
}

/* ═══════════════════════════════════════════════════════════
   TAB 4 — LETTER
═══════════════════════════════════════════════════════════ */
function initLetter() {
  letterInitialized = true;
  const envBtn = document.getElementById('envelope-btn');
  envBtn?.addEventListener('click', openLetter);
  document.getElementById('letter-fold-btn')?.addEventListener('click', foldLetter);
  document.getElementById('letter-reread-btn')?.addEventListener('click', () => {
    foldLetter();
    setTimeout(openLetter, 500);
  });
}

function openLetter() {
  if (window.sfx) { window.sfx.pop(); window.sfx.paper(); }

  // Animate envelope flap
  const flap = document.getElementById('env-flap');
  if (flap) {
    flap.style.animation = 'envelope-flap .6s ease forwards';
    flap.style.transformOrigin = 'bottom';
  }

  // Wax seal pop
  const seal = document.getElementById('env-seal');
  if (seal) seal.style.animation = 'wax-seal-pop .5s .2s ease forwards';

  puppy.setState('love');
  puppy.say(randItem(CONFIG.puppyLines.letter));

  setTimeout(() => {
    // Show letter
    const scroll = document.getElementById('letter-scroll');
    if (scroll) scroll.classList.add('open');
    renderLetterLines();
    // Hide envelope
    document.getElementById('envelope-wrap')?.style.setProperty('display', 'none');
    // Show actions
    document.getElementById('letter-actions')?.style.setProperty('display', 'flex');
    // Float hearts off letter
    spawnLetterHearts();
  }, 800);
}

function foldLetter() {
  if (window.sfx) window.sfx.paper();
  const scroll = document.getElementById('letter-scroll');
  if (scroll) scroll.classList.remove('open');
  document.getElementById('envelope-wrap')?.style.setProperty('display', '');
  document.getElementById('letter-actions')?.style.setProperty('display', 'none');
  const flap = document.getElementById('env-flap');
  if (flap) { flap.style.animation = ''; }
  const seal = document.getElementById('env-seal');
  if (seal) { seal.style.animation = ''; seal.style.opacity = '1'; seal.style.transform = ''; }
}

function renderLetterLines() {
  const container = document.getElementById('letter-lines');
  if (!container) return;
  container.innerHTML = '';
  const paragraphs = CONFIG.LETTER.split('\n');
  paragraphs.forEach((para, i) => {
    const el = document.createElement('span');
    el.className = 'letter-line';
    if (para.startsWith('Rokith')) {
      el.innerHTML = `<span class="letter-sig">Rokith</span>
        <svg width="30" height="20" viewBox="0 0 30 20" aria-hidden="true" style="display:inline-block;vertical-align:middle;margin-left:4px;">
          <path d="M2 10 Q10 2 15 10 Q20 2 28 8" stroke="#C8323C" stroke-width="2" fill="none"
            stroke-linecap="round"
            stroke-dasharray="60" stroke-dashoffset="60"
            style="animation:draw-stroke .8s ease forwards; --dash-len:60;"/>
        </svg>`;
    } else {
      el.innerHTML = para.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') || '&nbsp;';
    }
    el.style.animationDelay = i * 0.12 + 's';
    container.appendChild(el);
    setTimeout(() => el.classList.add('visible'), 80 + i * 110);
  });
}

function spawnLetterHearts() {
  const paper = document.getElementById('letter-scroll');
  if (!paper) return;
  const rect = paper.getBoundingClientRect();
  for (let i = 0; i < 8; i++) {
    setTimeout(() => {
      const el = document.createElement('span');
      el.style.cssText = `position:fixed;left:${rect.left + rand(20, rect.width - 20)}px;
        top:${rect.top + rand(20, rect.height - 40)}px;font-size:${rand(14, 22)}px;
        pointer-events:none;z-index:9999;animation:heart-fly-out 1.2s ease forwards;`;
      el.textContent = randItem(['💗','💕','💖','❤️']);
      el.style.setProperty('--fx', rand(-40, 40) + 'px');
      el.style.setProperty('--fy', rand(-80, -40) + 'px');
      el.style.setProperty('--fr', rand(-20, 20) + 'deg');
      document.body.appendChild(el);
      el.addEventListener('animationend', () => el.remove());
    }, i * 250);
  }
}

/* ═══════════════════════════════════════════════════════════
   TAB 5 — ARCADE CORNER (3 Games)
═══════════════════════════════════════════════════════════ */
let arcadeGiftsEarned = new Set(JSON.parse(localStorage.getItem('giftsEarned') || '[]'));
let grandGiftUnlocked = localStorage.getItem('grandGift') === '1';
let currentGame = null;

// Active game loop & timer references for clean termination
let activeGameTimer = null;
let activeGameRAF = null;
let activeGameStopCallback = null;

function initArcade() {
  arcadeInitialized = true;
  buildGiftShelf();

  // Game card buttons
  document.getElementById('btn-catch')?.addEventListener('click', () => {
    if (window.sfx) window.sfx.tap();
    startGame('catch');
  });
  document.getElementById('btn-memory')?.addEventListener('click', () => {
    if (window.sfx) window.sfx.tap();
    startGame('memory');
  });
  document.getElementById('btn-balloon')?.addEventListener('click', () => {
    if (window.sfx) window.sfx.tap();
    startGame('balloon');
  });

  // Back buttons
  document.querySelectorAll('.back-link').forEach(btn => {
    btn.addEventListener('click', () => {
      if (window.sfx) window.sfx.tap();
      backToHub();
    });
  });
}

function stopCurrentGame() {
  if (activeGameTimer) {
    clearInterval(activeGameTimer);
    clearTimeout(activeGameTimer);
    activeGameTimer = null;
  }
  if (activeGameRAF) {
    cancelAnimationFrame(activeGameRAF);
    activeGameRAF = null;
  }
  if (typeof activeGameStopCallback === 'function') {
    activeGameStopCallback();
    activeGameStopCallback = null;
  }
}

function backToHub() {
  stopCurrentGame();
  document.querySelectorAll('.game-screen').forEach(s => s.classList.remove('active'));
  document.getElementById('arcade-hub').style.display = 'flex';
  currentGame = null;
  buildGiftShelf();
}

function startGame(gameId) {
  stopCurrentGame();
  document.getElementById('arcade-hub').style.display = 'none';
  document.querySelectorAll('.game-screen').forEach(s => s.classList.remove('active'));

  const screen = document.getElementById(`game-${gameId}`);
  if (screen) screen.classList.add('active');
  currentGame = gameId;

  puppy.say(randItem(CONFIG.puppyLines.gameStart));

  // Small delay to ensure container layout dimensions are computed
  setTimeout(() => {
    if (gameId === 'catch') initCatchGame();
    if (gameId === 'memory') initMemoryMatch();
    if (gameId === 'balloon') initBalloonGame();
  }, 50);
}

/* ── GIFT SHELF ─────────────────────────────────────────── */
function buildGiftShelf() {
  const shelf = document.getElementById('shelf-items');
  if (!shelf) return;
  shelf.innerHTML = '';

  if (arcadeGiftsEarned.size === 0 && !grandGiftUnlocked) {
    shelf.innerHTML = '<span style="color:var(--rose);font-size:.82rem;font-family:var(--font-hand);">play games to win cute gifts! 🎁</span>';
    return;
  }

  arcadeGiftsEarned.forEach(idx => {
    const g = CONFIG.GIFTS[idx];
    if (!g) return;
    const item = document.createElement('div');
    item.className = 'shelf-item anim-pop-in';
    item.textContent = `${g.icon} ${g.name}`;
    shelf.appendChild(item);
  });

  if (grandGiftUnlocked) {
    const grand = document.createElement('div');
    grand.className = 'shelf-item anim-pop-in';
    grand.style.background = 'var(--gold)';
    grand.style.color = 'var(--wine-deep)';
    grand.style.fontWeight = 'bold';
    grand.textContent = `${CONFIG.GRAND_GIFT.icon} ${CONFIG.GRAND_GIFT.name}`;
    shelf.appendChild(grand);
  }
}

function saveGift(roundIndex) {
  if (typeof roundIndex === 'number') {
    arcadeGiftsEarned.add(roundIndex);
    localStorage.setItem('giftsEarned', JSON.stringify([...arcadeGiftsEarned]));
    if (arcadeGiftsEarned.size >= 3 && !grandGiftUnlocked) {
      grandGiftUnlocked = true;
      localStorage.setItem('grandGift', '1');
    }
  }
}

function showGiftReveal(giftIndex) {
  const isGrand = giftIndex === 'grand';
  let gift = null;

  if (isGrand) {
    gift = CONFIG.GRAND_GIFT;
  } else if (typeof giftIndex === 'number' && CONFIG.GIFTS[giftIndex]) {
    gift = CONFIG.GIFTS[giftIndex];
  } else {
    // Replay bonus gift
    const bonusName = randItem(CONFIG.BONUS_STICKERS || ['✨ sparkle badge', '🌸 love sticker']);
    gift = {
      icon: '⭐',
      name: bonusName,
      note: 'You played again! Here is an extra star sticker for Iniya! 💗'
    };
  }

  const reveal = document.getElementById('gift-reveal');
  if (!reveal) return;
  reveal.classList.add('open');

  const icon = document.getElementById('gift-icon');
  const name = document.getElementById('gift-name');
  const note = document.getElementById('gift-note');
  if (icon) icon.textContent = gift.icon;
  if (name) name.textContent = gift.name;
  if (note) note.textContent = gift.note;

  if (window.sfx) {
    window.sfx.sparkle();
    setTimeout(() => window.sfx.cheer(), 200);
  }
  spawnConfetti(45);

  puppy.setState('cheer');
  puppy.say(randItem(CONFIG.puppyLines.gameEnd));

  const closeBtn = document.getElementById('gift-close-btn');
  if (closeBtn) {
    closeBtn.onclick = () => {
      if (window.sfx) window.sfx.tap();
      reveal.classList.remove('open');
      backToHub();
      // If grand gift just unlocked, trigger it!
      if (grandGiftUnlocked && isGrand === false && arcadeGiftsEarned.size >= 3) {
        setTimeout(() => showGiftReveal('grand'), 600);
      }
    };
  }
}

/* ═══════════════════════════════════════════════════════════
   GAME 1: CATCH THE HEARTS
═══════════════════════════════════════════════════════════ */
function initCatchGame() {
  const canvas = document.getElementById('canvas-catch');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const wrap = canvas.parentElement;
  const W = wrap.clientWidth || 340;
  const H = 340;
  canvas.width = W;
  canvas.height = H;
  canvas.style.height = H + 'px';

  let score = 0;
  let timeLeft = 25;
  let basketX = W / 2;
  const basketW = Math.max(68, Math.min(84, W * 0.22));
  const basketH = 26;
  let hearts = [];
  let running = true;
  let spawnTimer = null;

  function moveBasket(x) {
    basketX = Math.max(basketW / 2, Math.min(W - basketW / 2, x));
  }

  function handleTouchPointer(clientX) {
    const rect = canvas.getBoundingClientRect();
    const scale = W / rect.width;
    moveBasket((clientX - rect.left) * scale);
  }

  // Pointer / Touch Listeners (Mobile & Desktop)
  canvas.onpointermove = e => { handleTouchPointer(e.clientX); };
  canvas.onpointerdown = e => { handleTouchPointer(e.clientX); };

  canvas.ontouchstart = e => {
    e.preventDefault();
    if (e.touches[0]) handleTouchPointer(e.touches[0].clientX);
  };
  canvas.ontouchmove = e => {
    e.preventDefault();
    if (e.touches[0]) handleTouchPointer(e.touches[0].clientX);
  };

  function onKeyDown(e) {
    if (!running) return;
    if (e.key === 'ArrowLeft') moveBasket(basketX - 28);
    if (e.key === 'ArrowRight') moveBasket(basketX + 28);
  }
  window.addEventListener('keydown', onKeyDown);

  // Spawner
  function scheduleNextHeart() {
    if (!running) return;
    const isGold = Math.random() < 0.15;
    hearts.push({
      x: rand(24, W - 24),
      y: -20,
      speed: rand(2.2, 4.2),
      size: rand(20, 28),
      emoji: isGold ? '⭐' : randItem(['💗','💕','💖','❤️','🌸']),
      points: isGold ? 3 : 1
    });
    spawnTimer = setTimeout(scheduleNextHeart, rand(450, 900));
  }
  scheduleNextHeart();

  // Timer
  const timerEl = document.getElementById('catch-timer');
  const scoreEl = document.getElementById('catch-score');
  if (timerEl) timerEl.textContent = `⏱ ${timeLeft}s`;
  if (scoreEl) scoreEl.textContent = `💗 0`;

  activeGameTimer = setInterval(() => {
    timeLeft--;
    if (timerEl) timerEl.textContent = `⏱ ${timeLeft}s`;
    if (timeLeft <= 0) {
      stop();
      endCatch(score);
    }
  }, 1000);

  function stop() {
    running = false;
    clearTimeout(spawnTimer);
    clearInterval(activeGameTimer);
    cancelAnimationFrame(activeGameRAF);
    window.removeEventListener('keydown', onKeyDown);
    canvas.onpointermove = null;
    canvas.onpointerdown = null;
    canvas.ontouchstart = null;
    canvas.ontouchmove = null;
  }
  activeGameStopCallback = stop;

  // Animation Loop
  function draw() {
    if (!running) return;
    ctx.clearRect(0, 0, W, H);

    // Draw basket with cute bow
    ctx.fillStyle = '#FFF6EA';
    ctx.strokeStyle = '#C8323C';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(basketX - basketW / 2, H - basketH - 8, basketW, basketH, 8);
    ctx.fill();
    ctx.stroke();

    ctx.font = '20px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🎀', basketX, H - basketH / 2 - 8);

    // Draw hearts
    ctx.font = '24px serif';
    for (let i = hearts.length - 1; i >= 0; i--) {
      const h = hearts[i];
      h.y += h.speed;
      ctx.fillText(h.emoji, h.x, h.y);

      // Collision with basket
      if (h.y >= H - basketH - 16 && h.y <= H && Math.abs(h.x - basketX) < basketW / 2 + 10) {
        score += h.points;
        if (scoreEl) scoreEl.textContent = `💗 ${score}`;
        if (h.points > 1) {
          if (window.sfx) window.sfx.sparkle();
        } else {
          if (window.sfx) window.sfx.pop();
        }
        spawnHeartBurst(
          canvas.getBoundingClientRect().left + (h.x * (canvas.clientWidth / W)),
          canvas.getBoundingClientRect().top + (h.y * (canvas.clientHeight / H))
        );
        hearts.splice(i, 1);
        continue;
      }

      if (h.y > H + 30) {
        hearts.splice(i, 1);
      }
    }

    activeGameRAF = requestAnimationFrame(draw);
  }
  draw();
}

function endCatch(score) {
  const already = arcadeGiftsEarned.has(0);
  saveGift(0);
  setTimeout(() => showGiftReveal(already ? 'replay' : 0), 400);
}

/* ═══════════════════════════════════════════════════════════
   GAME 2: MEMORY MATCH
═══════════════════════════════════════════════════════════ */
function initMemoryMatch() {
  const grid = document.getElementById('memory-match-grid');
  if (!grid) return;
  grid.innerHTML = '';

  const pairsEl = document.getElementById('memory-pairs');
  if (pairsEl) pairsEl.textContent = 'pairs: 0 / 6';

  const emojis = ['🎂','🎀','🧸','💗','⭐','📷'];
  const cards = [...emojis, ...emojis].sort(() => Math.random() - 0.5);
  let flipped = [], matched = 0, busy = false;

  cards.forEach((emoji, i) => {
    const card = document.createElement('div');
    card.className = 'mem-card';
    card.dataset.emoji = emoji;
    card.dataset.index = i;
    card.innerHTML = `<div class="mem-card-front" aria-hidden="true">💝</div>
                      <div class="mem-card-back" aria-hidden="true">${emoji}</div>`;
    card.setAttribute('aria-label', 'memory card');
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');

    function handleCardTap() {
      if (busy || card.classList.contains('flipped') || card.classList.contains('matched')) return;
      if (window.sfx) window.sfx.pop();

      card.classList.add('flipped');
      flipped.push(card);

      if (flipped.length === 2) {
        busy = true;
        setTimeout(() => {
          if (flipped[0].dataset.emoji === flipped[1].dataset.emoji) {
            flipped.forEach(c => {
              c.classList.add('matched');
              c.classList.remove('flipped');
            });
            matched++;
            if (pairsEl) pairsEl.textContent = `pairs: ${matched} / 6`;

            if (window.sfx) window.sfx.sparkle();
            spawnHeartBurst(
              flipped[0].getBoundingClientRect().left + 25,
              flipped[0].getBoundingClientRect().top + 25
            );

            if (matched === 6) {
              const already = arcadeGiftsEarned.has(1);
              saveGift(1);
              setTimeout(() => showGiftReveal(already ? 'replay' : 1), 600);
            }
          } else {
            flipped.forEach(c => c.classList.remove('flipped'));
          }
          flipped = [];
          busy = false;
        }, 800);
      }
    }

    card.addEventListener('click', handleCardTap);
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleCardTap();
      }
    });

    grid.appendChild(card);
  });
}

/* ═══════════════════════════════════════════════════════════
   GAME 3: POP THE BALLOONS
═══════════════════════════════════════════════════════════ */
function initBalloonGame() {
  const canvas = document.getElementById('canvas-balloon');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const wrap = canvas.parentElement;
  const W = wrap.clientWidth || 340;
  const H = 340;
  canvas.width = W;
  canvas.height = H;
  canvas.style.height = H + 'px';

  let score = 0;
  let timeLeft = 20;
  let balloons = [];
  let running = true;
  let spawnTimer = null;
  const targetLetters = ['C','U','I','T','E','P','I','E'];
  let letterIndex = 0;

  const timerEl = document.getElementById('balloon-timer');
  const scoreEl = document.getElementById('balloon-score');
  if (timerEl) timerEl.textContent = `⏱ ${timeLeft}s`;
  if (scoreEl) scoreEl.textContent = `💗 0`;

  function spawnBalloon() {
    if (!running) return;
    const hasLetter = Math.random() < 0.35 && letterIndex < targetLetters.length;
    const letter = hasLetter ? targetLetters[letterIndex++] : null;

    balloons.push({
      x: rand(36, W - 36),
      y: H + 40,
      speed: rand(1.6, 3.4),
      r: rand(24, 38),
      color: randItem(['#F7C9D0','#C8323C','#E7B94A','#E88A98']),
      letter: letter,
      popped: false
    });

    spawnTimer = setTimeout(spawnBalloon, rand(350, 750));
  }
  spawnBalloon();

  function popBalloonAt(clientX, clientY) {
    if (!running) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = W / rect.width;
    const scaleY = H / rect.height;
    const mx = (clientX - rect.left) * scaleX;
    const my = (clientY - rect.top) * scaleY;

    // Generous touch hit radius for mobile comfort
    for (let i = balloons.length - 1; i >= 0; i--) {
      const b = balloons[i];
      if (!b.popped && Math.hypot(mx - b.x, my - b.y) <= b.r + 20) {
        b.popped = true;
        score += b.letter ? 2 : 1;
        if (scoreEl) scoreEl.textContent = `💗 ${score}`;

        if (window.sfx) {
          window.sfx.pop();
          if (b.letter) window.sfx.sparkle();
        }
        spawnHeartBurst(clientX, clientY);
        break; // pop one balloon per tap
      }
    }
  }

  canvas.onpointerdown = e => { popBalloonAt(e.clientX, e.clientY); };
  canvas.ontouchstart = e => {
    e.preventDefault();
    if (e.touches[0]) popBalloonAt(e.touches[0].clientX, e.touches[0].clientY);
  };

  activeGameTimer = setInterval(() => {
    timeLeft--;
    if (timerEl) timerEl.textContent = `⏱ ${timeLeft}s`;
    if (timeLeft <= 0) {
      stop();
      endBalloon(score);
    }
  }, 1000);

  function stop() {
    running = false;
    clearTimeout(spawnTimer);
    clearInterval(activeGameTimer);
    cancelAnimationFrame(activeGameRAF);
    canvas.onpointerdown = null;
    canvas.ontouchstart = null;
  }
  activeGameStopCallback = stop;

  // Animation Loop
  function draw() {
    if (!running) return;
    ctx.clearRect(0, 0, W, H);

    balloons = balloons.filter(b => {
      if (b.popped) return false;
      b.y -= b.speed;
      if (b.y < -50) return false;

      // Draw balloon body
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.fillStyle = b.color;
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,.5)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Shiny highlight
      ctx.beginPath();
      ctx.arc(b.x - b.r * 0.3, b.y - b.r * 0.3, b.r * 0.2, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,.6)';
      ctx.fill();

      // String
      ctx.beginPath();
      ctx.moveTo(b.x, b.y + b.r);
      ctx.lineTo(b.x, b.y + b.r + 22);
      ctx.strokeStyle = '#E88A98';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Letter inside
      if (b.letter) {
        ctx.fillStyle = '#7A2428';
        ctx.font = `bold ${Math.round(b.r * 0.85)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(b.letter, b.x, b.y);
      }
      return true;
    });

    activeGameRAF = requestAnimationFrame(draw);
  }
  draw();
}

function endBalloon(score) {
  const already = arcadeGiftsEarned.has(2);
  saveGift(2);
  setTimeout(() => showGiftReveal(already ? 'replay' : 2), 400);
}

// ── Global Exports ──────────────────────────────────────────
window.initPhotos   = initPhotos;
window.initMemories = initMemories;
window.initLetter   = initLetter;
window.initArcade   = initArcade;

Object.defineProperty(window, 'photosInitialized',   { get: () => photosInitialized });
Object.defineProperty(window, 'memoriesInitialized',  { get: () => memoriesInitialized });
Object.defineProperty(window, 'letterInitialized',    { get: () => letterInitialized });
Object.defineProperty(window, 'arcadeInitialized',    { get: () => arcadeInitialized });
