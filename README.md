# 🎀 A Little World Called Iniya
*A birthday gift website made with love by Rokith*

---

## 🌐 Deploy to GitHub Pages (step by step)

> **No coding experience needed!** Just follow these steps.

### Step 1 — Create a GitHub account
If you don't have one, sign up at [github.com](https://github.com).

### Step 2 — Create a new repository
1. Click the **+** icon (top right) → **New repository**
2. Name it something like `iniya-birthday`
3. Set it to **Public**
4. Click **Create repository**

### Step 3 — Upload the files
**Option A — Via GitHub website (easiest):**
1. Inside the new repo page, click **uploading an existing file**
2. Drag and drop **all the files and folders** from this project
3. Click **Commit changes**

**Option B — Via Git (if you have Git installed):**
```bash
git init
git add .
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/iniya-birthday.git
git push -u origin main
```

### Step 4 — Enable GitHub Pages
1. Go to your repo → **Settings** (top bar)
2. Scroll to **Pages** (left sidebar)
3. Under **Build and deployment**, set:
   - Source: **Deploy from a branch**
   - Branch: **main** / **(root)**
4. Click **Save**

### Step 5 — Wait ~1 minute, then visit
```
https://YOUR_USERNAME.github.io/iniya-birthday/
```

> Changes you push will appear after about 1 minute.

---

## 🖼️ Photos in Photo Book

All 9 photos are added and formatted with cute polaroid borders, captions, and lightbox:
- `photo1.jpg` … `photo9.jpg` (located in `assets/photos/`)
- When tapped, each polaroid lifts with sparkle sounds and opens in full-screen lightbox with mobile swipe support!

---

## 🎵 Music & Sound Effects (SFX)

- **Works 100% on localhost & mobile out of the box!**
- Built-in cute **Lo-Fi Music Box Synthesizer** plays a sweet romantic melody ("Our Little Song") with gentle bells, chords, and bass via the Web Audio API.
- **Cute SFX Sound Effects**:
  - Keypad tap & button clicks (bubbly tap)
  - Card flips & balloon pop (satisfying pop)
  - Code unlock, candle blow, pair match & Mochi tap (sparkling chimes)
  - Game wins & gift reveals (celebratory fanfare)
  - Wrong code (gentle soft boop)
  - Page & letter flips (paper swoosh)
- **Custom Song**: If you place your own `song.mp3` in `assets/audio/song.mp3`, the player will automatically play your MP3! If not, it seamlessly plays the soothing music box melody.

---

## 📱 Testing on Localhost & Mobile Phone

1. On your computer, open a terminal in this folder and start the server:
   ```bash
   python -m http.server 8000
   ```
2. On your computer: open `http://localhost:8000`
3. On your mobile phone (connected to the same Wi-Fi): open:
   ```
   http://192.168.29.27:8000
   ```
4. Enter passcode **`5129`** — the music will start, SFX will play, and all games are touch-optimized!

---

## 🔐 Note on the Password

The password (`5129`) lives in `js/config.js` and is visible in the page source.
This is **cute-level protection** — perfect for a birthday surprise link.
Anyone who opens the page source could find it. That's totally fine for a gift! 💗

---

*Made with 💗 by Rokith for Iniya's birthday*
