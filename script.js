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

// 4) Info lagu untuk music player (bisa diganti manual, atau otomatis
//    terisi nama file begitu kamu menambahkan lagu lewat tombol +)
const SONG_TITLE = "Belum ada lagu";
const SONG_ARTIST = "ketuk + untuk menambahkan lagu";

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
SLIDES.forEach((text, i) => {
  const page = document.createElement('div');
  page.className = 'page' + (i === 0 ? ' is-current' : ' hidden-page');
  page.innerHTML =
    `<div class="flip-shade"></div>` +
    `<div class="page-counter">${i + 1}/${SLIDES.length}</div>` +
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
  const mpEl = document.getElementById('music-player');
  if (mpEl){
    const showPlayer = (id === 'screen-cover' || id === 'screen-book');
    mpEl.classList.toggle('mp-hidden', !showPlayer);
  }
}

// ---- 1. Cover buka buku ----
const book = document.getElementById('book');
book.addEventListener('click', () => {
  book.classList.add('opening');
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
    startMusic();
  });
});

// ---- 4. Bunga berjatuhan ----
const flowers = ['🌸','🌺','🌷','💮','🌼'];
let petalInterval = null;
function startPetals(){
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

// ---- 4b. Musik romantis sederhana (dibuat sendiri lewat Web Audio, bukan file luar) ----
let audioCtx = null;
let musicTimer = null;
let musicPlaying = false;

function startMusic(){
  if (musicPlaying) return;
  musicPlaying = true;
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();

  const masterGain = audioCtx.createGain();
  masterGain.gain.value = 0.06;
  masterGain.connect(audioCtx.destination);

  // pad lembut di latar
  const pad = audioCtx.createOscillator();
  pad.type = 'sine';
  pad.frequency.value = 220;
  const padGain = audioCtx.createGain();
  padGain.gain.value = 0.025;
  pad.connect(padGain).connect(audioCtx.destination);
  pad.start();

  const notes = [523.25, 587.33, 659.25, 783.99, 880.0, 783.99, 659.25, 587.33]; // pentatonik lembut
  let step = 0;

  function playNote(freq){
    const osc = audioCtx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = freq;
    const g = audioCtx.createGain();
    g.gain.setValueAtTime(0, audioCtx.currentTime);
    g.gain.linearRampToValueAtTime(0.07, audioCtx.currentTime + 0.08);
    g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.9);
    osc.connect(g).connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.95);
  }

  musicTimer = setInterval(() => {
    playNote(notes[step % notes.length]);
    step++;
  }, 520);

  window.__loveMusicPad = pad;
  window.__loveMusicPadGain = padGain;
}

const soundToggle = document.getElementById('sound-toggle');
const soundIcon = document.getElementById('sound-icon');
let muted = false;
soundToggle.addEventListener('click', () => {
  if (!audioCtx) return;
  muted = !muted;
  if (muted){
    audioCtx.suspend();
    soundIcon.innerHTML = '<path d="M4 9v6h4l5 5V4L8 9H4z"/><line x1="17" y1="9" x2="23" y2="15"/><line x1="23" y1="9" x2="17" y2="15"/>';
  } else {
    audioCtx.resume();
    soundIcon.innerHTML = '<path d="M4 9v6h4l5 5V4L8 9H4z"/>';
  }
});

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

// ---- Music player (gaya Spotify) ----
(function initMusicPlayer(){
  document.getElementById('mp-title').textContent = SONG_TITLE;
  document.getElementById('mp-artist').textContent = SONG_ARTIST;

  const mpAudio = new Audio();
  let mpPlaying = false;

  const mpFile = document.getElementById('mp-file');
  const mpAdd = document.getElementById('mp-add');
  const mpPlay = document.getElementById('mp-play');
  const mpArt = document.getElementById('mp-art');
  const mpFill = document.getElementById('mp-progress-fill');
  const mpCur = document.getElementById('mp-cur');
  const mpDur = document.getElementById('mp-dur');
  const mpProgress = document.getElementById('mp-progress');
  const mpTitleEl = document.getElementById('mp-title');
  const mpArtistEl = document.getElementById('mp-artist');

  function fmtTime(s){
    if (!isFinite(s) || s < 0) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  }
  function updatePlayIcon(){
    mpPlay.innerHTML = mpPlaying
      ? '<svg viewBox="0 0 24 24"><path d="M6 5h4v14H6zM14 5h4v14h-4z"/></svg>'
      : '<svg viewBox="0 0 24 24"><path d="M7 5l12 7-12 7z"/></svg>';
  }

  mpAdd.addEventListener('click', () => mpFile.click());
  mpFile.addEventListener('change', (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    mpAudio.src = url;
    const rawName = file.name.replace(/\.[^/.]+$/, '');
    mpTitleEl.textContent = rawName;
    mpArtistEl.textContent = 'Lagu pilihanmu';
    mpAudio.play().then(() => {
      mpPlaying = true;
      updatePlayIcon();
      mpArt.classList.add('mp-spin');
    }).catch(() => {});
  });

  mpAudio.addEventListener('timeupdate', () => {
    const pct = mpAudio.duration ? (mpAudio.currentTime / mpAudio.duration) * 100 : 0;
    mpFill.style.width = pct + '%';
    mpCur.textContent = fmtTime(mpAudio.currentTime);
    mpDur.textContent = fmtTime(mpAudio.duration);
  });
  mpAudio.addEventListener('ended', () => {
    mpPlaying = false;
    updatePlayIcon();
    mpArt.classList.remove('mp-spin');
  });

  mpProgress.addEventListener('click', (e) => {
    if (!mpAudio.duration) return;
    const rect = mpProgress.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    mpAudio.currentTime = pct * mpAudio.duration;
  });

  mpPlay.addEventListener('click', () => {
    if (!mpAudio.src) { mpFile.click(); return; }
    if (mpPlaying) {
      mpAudio.pause();
      mpPlaying = false;
      mpArt.classList.remove('mp-spin');
    } else {
      mpAudio.play().catch(() => {});
      mpPlaying = true;
      mpArt.classList.add('mp-spin');
    }
    updatePlayIcon();
  });

  updatePlayIcon();
})();

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
    warm: 'saturate(1.35) brightness(1.08) contrast(.96) hue-rotate(-6deg)'
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

  function captureFrame(){
    const c = document.createElement('canvas');
    c.width = psVideo.videoWidth || 480;
    c.height = psVideo.videoHeight || 640;
    const ctx = c.getContext('2d');
    try{ ctx.filter = FILTER_MAP[selectedFilter]; }catch(e){}
    ctx.drawImage(psVideo, 0, 0, c.width, c.height);
    return c;
  }

  function composeStrip(){
    const pad = 16;
    const gap = 10;
    const frameW = 480;
    const frameH = Math.round(frameW * (shots[0].height / shots[0].width));
    const cols = selectedCount <= 2 ? 1 : 2;
    const rows = Math.ceil(selectedCount / cols);
    const canvas = psStripCanvas;
    canvas.width = cols * frameW + (cols + 1) * gap + pad * 2;
    canvas.height = rows * frameH + (rows + 1) * gap + pad * 2 + 60;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#FFFCF7';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    shots.forEach((shot, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = pad + gap + col * (frameW + gap);
      const y = pad + gap + row * (frameH + gap);
      ctx.drawImage(shot, x, y, frameW, frameH);
      ctx.strokeStyle = 'rgba(74,46,53,0.12)';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, frameW, frameH);
    });
    ctx.fillStyle = '#4A2E35';
    ctx.font = "italic 600 30px 'Cormorant Garamond', Georgia, serif";
    ctx.textAlign = 'center';
    ctx.fillText('sini cantik ✨', canvas.width / 2, canvas.height - 22);
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
