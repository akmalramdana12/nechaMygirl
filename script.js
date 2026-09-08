/* ==========================================================================
   GANTI DI SINI — semua teks, nama, dan angka yang mudah diedit ada di bawah.
   ========================================================================== */

// 1) Teks 5 halaman buku. Ganti bebas, boleh pakai enter (\n) untuk baris baru.
const SLIDES = [
  "Ada seseorang yang belakangan ini\nselalu berhasil membuat harimu\nterasa lebih ringan tanpa ia sadari.",
  "Setiap kali chat darinya masuk,\nada rasa senang kecil yang datang\nlebih dulu daripada isi pesannya.",
  "Aku sudah coba menyimpannya\nhanya sebagai perasaan biasa,\ntapi rupanya semakin sulit disembunyikan.",
  "Jadi izinkan aku menuliskannya\ndi sini saja, pelan-pelan,\nsupaya kamu sempat membacanya baik-baik.",
  "Kalau kamu sudah membaca sampai sini,\ntolong tunggu sebentar.\nAda satu hal lagi yang ingin kutunjukkan."
];

// 2) Info halaman profil
const PROFILE = {
  name: "Kamu",
  username: "@untuk.kamu",
  bio: "satu-satunya notifikasi yang selalu kutunggu.",
  following: 12,
  followers: 1,
  likes: "99+",
  initial: "K" // huruf yang muncul di foto profil bila tidak pakai foto asli
};

// 3) Teks halaman terakhir setelah menekan "Terima"
const FINAL_TEXT = "Yeyy, diterima<br>makasih sayangku cantik 🤍";

// 4) Stiker lucu yang muncul acak di tiap halaman buku & di strip foto.
//    Ganti/tambah emoji di sini kalau mau stiker lain.
const CUTE_STICKERS = ['✨','🎀','🩷','🧸','🌟','💫','🍡','🍬','🩵','⭐'];

/* ==========================================================================
   Mulai dari sini adalah logika. Tidak perlu diubah kecuali ingin
   menyesuaikan perilaku.
   ========================================================================== */

// ---- render slide texts ----
document.getElementById('profile-name').textContent = PROFILE.name;
document.getElementById('profile-username').textContent = PROFILE.username;
document.getElementById('profile-bio').textContent = PROFILE.bio;
document.getElementById('stat-following').textContent = PROFILE.following;
document.getElementById('stat-followers').textContent = PROFILE.followers;
document.getElementById('stat-likes').textContent = PROFILE.likes;
document.getElementById('profile-initial').textContent = PROFILE.initial;
document.getElementById('final-text').innerHTML = FINAL_TEXT;

const pagesWrap = document.getElementById('pages-wrap');
const dotsWrap = document.getElementById('dots');
const STICKER_CORNERS = [
  'top: clamp(14px, 3vh, 22px); left: clamp(16px, 4vw, 26px);',
  'top: clamp(14px, 3vh, 22px); right: clamp(16px, 4vw, 26px);',
  'bottom: clamp(14px, 3vh, 22px); left: clamp(16px, 4vw, 26px);',
  'bottom: clamp(14px, 3vh, 22px); right: clamp(16px, 4vw, 26px);'
];
SLIDES.forEach((text, i) => {
  const page = document.createElement('div');
  page.className = 'page' + (i === 0 ? ' is-current' : ' hidden-page');
  const sticker = CUTE_STICKERS[Math.floor(Math.random() * CUTE_STICKERS.length)];
  const corner = STICKER_CORNERS[Math.floor(Math.random() * STICKER_CORNERS.length)];
  page.innerHTML =
    `<div class="flip-shade"></div>` +
    `<div class="page-counter">${i + 1}/${SLIDES.length}</div>` +
    `<span class="page-sticker" style="${corner}" aria-hidden="true">${sticker}</span>` +
    `<div class="page-text">${text}</div>` +
    (i === SLIDES.length - 1 ? `<button id="btn-tekan">tekan aku</button>` : '');
  pagesWrap.appendChild(page);

  const dot = document.createElement('div');
  dot.className = 'dot' + (i === 0 ? ' active' : '');
  dotsWrap.appendChild(dot);
});

function showScreen(id){
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');

  // Bunga-bunga dimatikan sementara selagi di halaman Photoshoot,
  // lalu dilanjutkan lagi begitu kembali ke halaman lain (kalau memang sudah aktif).
  if (id === 'screen-photoshoot') {
    stopPetalsSpawning();
  } else if (typeof petalsEnabled !== 'undefined' && petalsEnabled) {
    startPetals();
  }

  // Partikel halus hanya muncul selagi membaca buku (5 slide).
  if (id === 'screen-book') {
    startSparkles();
  } else {
    stopSparkles();
  }
}

// ---- 1. Cover buka buku ----
const book = document.getElementById('book');
book.addEventListener('click', () => {
  book.classList.add('opening');
  startBgMusic();
  setTimeout(() => showScreen('screen-book'), 650);
});

// ---- 2. Navigasi slide dengan animasi membalik halaman ----
let current = 0;
let isFlipping = false;
const pages = () => Array.from(document.querySelectorAll('.page'));
const dots = () => Array.from(document.querySelectorAll('.dot'));
const btnPrev = document.getElementById('btn-prev');
const btnNext = document.getElementById('btn-next');

function goTo(newIndex, direction){
  if (isFlipping) return;
  isFlipping = true;

  const all = pages();
  const from = all[current];
  const to = all[newIndex];

  // halaman tujuan langsung terlihat, diam, tepat di bawah halaman yang membalik
  to.classList.remove('hidden-page');
  to.style.transform = 'rotateY(0deg)';
  to.classList.add('is-current');

  from.classList.remove('is-current');
  from.classList.add(direction === 'next' ? 'flip-out-next' : 'flip-out-prev');

  dots().forEach((d, i) => d.classList.toggle('active', i === newIndex));
  current = newIndex;
  updateNavButtons();
  if (current === SLIDES.length - 1) revealPressButton();

  const finish = () => {
    from.classList.remove('flip-out-next', 'flip-out-prev', 'is-current');
    from.classList.add('hidden-page');
    from.style.transform = ''; from.style.zIndex = '';
    isFlipping = false;
  };
  from.addEventListener('animationend', finish, { once: true });
  // jaring pengaman kalau animationend tidak terpicu (mis. reduced-motion)
  setTimeout(() => { if (isFlipping) finish(); }, 900);
}

function updateNavButtons(){
  btnPrev.disabled = current === 0;
  btnNext.disabled = current === SLIDES.length - 1;
}
updateNavButtons();

btnNext.addEventListener('click', () => { if (current < SLIDES.length - 1) goTo(current + 1, 'next'); });
btnPrev.addEventListener('click', () => { if (current > 0) goTo(current - 1, 'prev'); });

// ---- Tombol "tekan aku" muncul begitu sampai di slide terakhir ----
function revealPressButton(){
  const btn = document.getElementById('btn-tekan');
  if (btn) btn.classList.add('show');
}

// delegate click on the dynamically created "tekan aku" button
pagesWrap.addEventListener('click', (e) => {
  if (e.target && e.target.id === 'btn-tekan') {
    showScreen('screen-profile');
    playPhotoDockIntro();
  }
});

// ---- 3. Tombol "Tolak" menghindar ----
const askActions = document.getElementById('ask-actions');
const btnReject = document.getElementById('btn-reject');
const btnAccept = document.getElementById('btn-accept');
let dodgeCount = 0;
const MAX_DODGES = 6;

function dodgeReject(){
  dodgeCount++;
  if (dodgeCount >= MAX_DODGES){
    btnReject.classList.add('gone');
    return;
  }
  const wrapRect = askActions.getBoundingClientRect();
  const btnRect = btnReject.getBoundingClientRect();
  const maxX = Math.max(wrapRect.width - btnRect.width - 4, 0);
  const maxY = Math.max(wrapRect.height - btnRect.height - 4, 0);
  const x = Math.random() * maxX;
  const y = Math.random() * maxY;
  btnReject.style.left = (x + btnRect.width/2) + 'px';
  btnReject.style.top = y + 'px';
  btnReject.style.transform = 'translateX(0)';
}

['mouseenter', 'touchstart', 'click'].forEach(evt => {
  btnReject.addEventListener(evt, (e) => {
    e.preventDefault();
    dodgeReject();
  }, { passive: false });
});

btnAccept.addEventListener('click', () => {
  playAcceptBurst(() => {
    showScreen('screen-final');
    startPetals();
  });
});

// ---- 4. Bunga berjatuhan (dimatikan otomatis selagi di halaman Photoshoot) ----
const flowers = ['🌸','🌺','🌷','💮','🌼'];
let petalInterval = null;
let petalsEnabled = false;
function startPetals(){
  petalsEnabled = true;
  if (petalInterval) return;
  const spawn = () => {
    const p = document.createElement('div');
    p.className = 'petal';
    p.textContent = flowers[Math.floor(Math.random() * flowers.length)];
    const left = Math.random() * 100;
    const duration = 7 + Math.random() * 6;
    const drift = (Math.random() * 120 - 60) + 'px';
    const spin = (Math.random() * 360 - 180) + 'deg';
    p.style.left = left + 'vw';
    p.style.fontSize = (16 + Math.random() * 14) + 'px';
    p.style.setProperty('--drift', drift);
    p.style.setProperty('--spin', spin);
    p.style.animationDuration = duration + 's';
    document.body.appendChild(p);
    setTimeout(() => p.remove(), duration * 1000 + 200);
  };
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const rate = reduceMotion ? 900 : 350;
  const count = reduceMotion ? 6 : 26;
  for (let i = 0; i < 8; i++) setTimeout(spawn, i * 150);
  petalInterval = setInterval(spawn, rate);
}
function stopPetalsSpawning(){
  if (petalInterval) { clearInterval(petalInterval); petalInterval = null; }
  document.querySelectorAll('.petal').forEach(p => p.remove());
}

// ---- 4b. Partikel pemanis halus, khusus di halaman buku (5 slide) ----
let sparkleInterval = null;
function startSparkles(){
  if (sparkleInterval) return;
  const glyphs = ['✦', '✧', '·', '⋆'];
  const spawn = () => {
    const s = document.createElement('div');
    s.className = 'sparkle';
    s.textContent = glyphs[Math.floor(Math.random() * glyphs.length)];
    const left = Math.random() * 100;
    const top = 20 + Math.random() * 60;
    const duration = 3.5 + Math.random() * 2.5;
    const drift = (Math.random() * 40 - 20) + 'px';
    const rise = -(30 + Math.random() * 40) + 'px';
    const spin = (Math.random() * 180 - 90) + 'deg';
    s.style.left = left + 'vw';
    s.style.top = top + 'vh';
    s.style.setProperty('--sdrift', drift);
    s.style.setProperty('--srise', rise);
    s.style.setProperty('--sspin', spin);
    s.style.animationDuration = duration + 's';
    document.body.appendChild(s);
    setTimeout(() => s.remove(), duration * 1000 + 200);
  };
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) return;
  for (let i = 0; i < 4; i++) setTimeout(spawn, i * 300);
  sparkleInterval = setInterval(spawn, 650);
}
function stopSparkles(){
  if (sparkleInterval) { clearInterval(sparkleInterval); sparkleInterval = null; }
  document.querySelectorAll('.sparkle').forEach(s => s.remove());
}

// ---- 4b. Musik latar dari file sendiri (folder /music), diputar otomatis saat buku dibuka ----
const bgMusic = document.getElementById('bg-music');
const soundToggle = document.getElementById('sound-toggle');
const soundIcon = document.getElementById('sound-icon');
let musicStarted = false;
let muted = false;

function startBgMusic(){
  if (musicStarted) return;
  musicStarted = true;
  if (!bgMusic) return;
  bgMusic.volume = 0.55;
  const showToggle = () => soundToggle && soundToggle.classList.add('st-visible');
  bgMusic.play().then(showToggle).catch(() => {
    // Kalau browser memblokir autoplay, tombol suara tetap tampil
    // supaya bisa diputar manual dengan sekali ketuk.
    showToggle();
  });
}

if (soundToggle) {
  soundToggle.addEventListener('click', () => {
    if (!bgMusic) return;
    muted = !muted;
    if (muted) {
      bgMusic.pause();
      soundIcon.innerHTML = '<path d="M4 9v6h4l5 5V4L8 9H4z"/><line x1="17" y1="9" x2="23" y2="15"/><line x1="23" y1="9" x2="17" y2="15"/>';
    } else {
      bgMusic.play().catch(() => {});
      soundIcon.innerHTML = '<path d="M4 9v6h4l5 5V4L8 9H4z"/>';
    }
  });
}

/* ==========================================================================
   TAMBAHAN BARU — SFX ketuk tombol, music player, animasi foto profil,
   animasi bunga saat "Terima", dan fitur menu Photoshoot.
   ========================================================================== */

// ---- SFX lucu setiap tombol diketuk ----
let sfxCtx = null;
function ensureSfxCtx(){
  if (!sfxCtx) sfxCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (sfxCtx.state === 'suspended') sfxCtx.resume();
  return sfxCtx;
}
function playTapSfx(){
  try{
    const ctx = ensureSfxCtx();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(920, now);
    osc.frequency.exponentialRampToValueAtTime(540, now + 0.09);
    g.gain.setValueAtTime(0.0001, now);
    g.gain.exponentialRampToValueAtTime(0.11, now + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.13);
    osc.connect(g).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.15);
  }catch(e){ /* abaikan kalau audio tidak didukung */ }
}
document.addEventListener('click', (e) => {
  const btn = e.target.closest('button');
  if (btn) playTapSfx();
}, true);

// ---- Animasi foto profil: dari tengah menutup layar -> pojok kiri bawah -> melayang ----
function playPhotoDockIntro(){
  const dock = document.getElementById('photo-dock');
  if (!dock || dock.dataset.played === '1') return;
  dock.dataset.played = '1';
  dock.classList.add('pd-cover');
  setTimeout(() => {
    dock.classList.remove('pd-cover');
    dock.classList.add('pd-docked');
    setTimeout(() => dock.classList.add('pd-float'), 780);
  }, 680);
}

// ---- Animasi pertama saat tombol "Terima" ditekan: bunga menutup layar lalu menyebar ----
function playAcceptBurst(callback){
  const burst = document.createElement('div');
  burst.className = 'accept-burst';
  const cover = document.createElement('div');
  cover.className = 'burst-cover';
  burst.appendChild(cover);
  document.body.appendChild(burst);

  requestAnimationFrame(() => burst.classList.add('ab-cover'));

  const flowers = ['🌸', '🌺', '🌷', '💮', '🌼', '🌹'];
  setTimeout(() => {
    for (let i = 0; i < 22; i++) {
      const p = document.createElement('span');
      p.className = 'burst-petal';
      p.textContent = flowers[Math.floor(Math.random() * flowers.length)];
      const angle = Math.random() * Math.PI * 2;
      const dist = 42 + Math.random() * 46;
      p.style.setProperty('--tx', Math.cos(angle) * dist + 'vmax');
      p.style.setProperty('--ty', Math.sin(angle) * dist + 'vmax');
      p.style.setProperty('--rot', (Math.random() * 300 - 150) + 'deg');
      burst.appendChild(p);
    }
    burst.classList.add('ab-scatter');
    if (callback) callback();
    setTimeout(() => burst.remove(), 900);
  }, 480);
}

// ---- Menu Photoshoot ----
(function initPhotoshoot(){
  const btnPhoto = document.getElementById('btn-photo');
  const photoLoading = document.getElementById('photo-loading');
  const loadingBarFill = document.getElementById('loading-bar-fill');

  const psVideo = document.getElementById('ps-video');
  const psStage = document.getElementById('ps-stage');
  const psCountdown = document.getElementById('ps-countdown');
  const psError = document.getElementById('ps-cam-error');
  const psDots = document.getElementById('ps-shots-dots');
  const psResult = document.getElementById('ps-result');
  const psControls = document.getElementById('ps-controls');
  const psShutter = document.getElementById('ps-shutter');
  const psBack = document.getElementById('ps-back');
  const psDownload = document.getElementById('ps-download');
  const psRetake = document.getElementById('ps-retake');
  const psStripCanvas = document.getElementById('ps-strip-canvas');
  const psCamRetry = document.getElementById('ps-cam-retry');

  const FILTER_MAP = {
    natural: 'none',
    vintage: 'sepia(0.5) contrast(1.1) saturate(1.3) brightness(1.05)',
    bw: 'grayscale(1) contrast(1.15)',
    warm: 'saturate(1.35) brightness(1.08) contrast(.96) hue-rotate(-6deg)',
    vintage90: 'sepia(0.35) contrast(1.18) saturate(1.4) brightness(1.04) hue-rotate(-8deg)'
  };

  let mediaStream = null;
  let capturing = false;
  let shots = [];
  let selectedCount = 4;
  let selectedFilter = 'natural';

  function buildDots(){
    psDots.innerHTML = '';
    for (let i = 0; i < selectedCount; i++) {
      const d = document.createElement('div');
      d.className = 'dot';
      psDots.appendChild(d);
    }
  }
  buildDots();

  document.querySelectorAll('.ps-pill').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.ps-pill').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      selectedCount = parseInt(btn.dataset.count, 10);
      buildDots();
    });
  });

  document.querySelectorAll('.ps-filter').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.ps-filter').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      selectedFilter = btn.dataset.filter;
      psVideo.style.filter = FILTER_MAP[selectedFilter];
    });
  });

  async function startCamera(){
    try{
      mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
      psVideo.srcObject = mediaStream;
      psError.classList.remove('show');
    }catch(err){
      psError.classList.add('show');
    }
  }
  function stopCamera(){
    if (mediaStream) {
      mediaStream.getTracks().forEach((t) => t.stop());
      mediaStream = null;
    }
  }
  function sleep(ms){ return new Promise((res) => setTimeout(res, ms)); }

  async function runCountdown(n){
    for (let i = n; i > 0; i--) {
      psCountdown.textContent = i;
      psCountdown.classList.add('show');
      await sleep(700);
    }
    psCountdown.classList.remove('show');
  }

  // Menambahkan bintik grain halus + vignette gelap di pinggir,
  // supaya kesan kamera vintage 90-an lebih terasa.
  function applyVintage90Look(ctx, w, h){
    const imgData = ctx.getImageData(0, 0, w, h);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      const grain = (Math.random() - 0.5) * 22;
      data[i] = Math.min(255, Math.max(0, data[i] + grain));
      data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + grain));
      data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + grain));
    }
    ctx.putImageData(imgData, 0, 0);

    const vignette = ctx.createRadialGradient(
      w / 2, h / 2, Math.min(w, h) * 0.28,
      w / 2, h / 2, Math.max(w, h) * 0.72
    );
    vignette.addColorStop(0, 'rgba(0,0,0,0)');
    vignette.addColorStop(1, 'rgba(30,18,10,0.38)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, w, h);
  }

  function captureFrame(){
    const c = document.createElement('canvas');
    c.width = psVideo.videoWidth || 480;
    c.height = psVideo.videoHeight || 640;
    const ctx = c.getContext('2d');
    try{ ctx.filter = FILTER_MAP[selectedFilter]; }catch(e){}
    ctx.drawImage(psVideo, 0, 0, c.width, c.height);
    if (selectedFilter === 'vintage90') {
      ctx.filter = 'none';
      applyVintage90Look(ctx, c.width, c.height);
    }
    return c;
  }

  // Ukuran hasil komposisi foto tetap 2048x1536 berapa pun jumlah fotonya,
  // dengan crop "cover" supaya tiap foto pas mengisi kotaknya tanpa gepeng.
  function composeStrip(){
    const CANVAS_W = 2048;
    const CANVAS_H = 1536;
    const pad = 40;
    const gap = 22;
    const footerH = 90;
    const cols = selectedCount <= 2 ? 1 : 2;
    const rows = Math.ceil(selectedCount / cols);
    const canvas = psStripCanvas;
    canvas.width = CANVAS_W;
    canvas.height = CANVAS_H;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#FFFCF7';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const cellW = (CANVAS_W - pad * 2 - gap * (cols - 1)) / cols;
    const cellH = (CANVAS_H - pad * 2 - gap * (rows - 1) - footerH) / rows;

    shots.forEach((shot, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = pad + col * (cellW + gap);
      const y = pad + row * (cellH + gap);

      // crop tengah ala "object-fit: cover" supaya proporsi foto tetap rapi
      const srcRatio = shot.width / shot.height;
      const dstRatio = cellW / cellH;
      let sx, sy, sw, sh;
      if (srcRatio > dstRatio) {
        sh = shot.height; sw = sh * dstRatio; sx = (shot.width - sw) / 2; sy = 0;
      } else {
        sw = shot.width; sh = sw / dstRatio; sx = 0; sy = (shot.height - sh) / 2;
      }
      ctx.drawImage(shot, sx, sy, sw, sh, x, y, cellW, cellH);
      ctx.strokeStyle = 'rgba(74,46,53,0.12)';
      ctx.lineWidth = 4;
      ctx.strokeRect(x, y, cellW, cellH);

      // stiker lucu kecil di pojok tiap foto sebagai pemanis
      const sticker = CUTE_STICKERS[Math.floor(Math.random() * CUTE_STICKERS.length)];
      ctx.font = '44px "Jost", sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(sticker, x + 10, y + 8);
    });
    ctx.fillStyle = '#4A2E35';
    ctx.font = "italic 600 46px 'Cormorant Garamond', Georgia, serif";
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText('sini cantik ✨', canvas.width / 2, canvas.height - 30);
  }

  function showResult(){
    psStage.classList.add('hide');
    psControls.style.display = 'none';
    psResult.classList.add('show');
  }

  psShutter.addEventListener('click', async () => {
    if (capturing) return;
    if (!mediaStream) { startCamera(); return; }
    capturing = true;
    shots = [];
    for (let i = 0; i < selectedCount; i++) {
      await runCountdown(3);
      const frame = captureFrame();
      shots.push(frame);
      const dots = Array.from(psDots.children);
      if (dots[i]) dots[i].classList.add('done');
      await sleep(250);
    }
    capturing = false;
    composeStrip();
    showResult();
  });

  psRetake.addEventListener('click', () => {
    shots = [];
    buildDots();
    psStage.classList.remove('hide');
    psControls.style.display = '';
    psResult.classList.remove('show');
  });

  psDownload.addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = 'photoshoot-kita.png';
    link.href = psStripCanvas.toDataURL('image/png');
    link.click();
  });

  psBack.addEventListener('click', () => {
    stopCamera();
    showScreen('screen-final');
  });

  psCamRetry.addEventListener('click', startCamera);

  btnPhoto.addEventListener('click', () => {
    photoLoading.classList.add('show');
    loadingBarFill.style.width = '0%';
    requestAnimationFrame(() => {
      requestAnimationFrame(() => { loadingBarFill.style.width = '100%'; });
    });
    setTimeout(() => {
      photoLoading.classList.remove('show');
      loadingBarFill.style.width = '0%';
      showScreen('screen-photoshoot');
      startCamera();
    }, 5000);
  });
})();
