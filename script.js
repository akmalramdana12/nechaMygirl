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

// 4) Playlist musik. Taruh 5 file musikmu di folder "music/" dengan nama
//    persis: lagu1.mp3, lagu2.mp3, lagu3.mp3, lagu4.mp3, lagu5.mp3
//    lalu ganti judul & nama artis di bawah ini sesuai lagu aslinya.
const SONGS = [
  { src: 'music/lagu1.mp3', title: 'Lagu Kita #1', artist: 'Ganti nama artis' },
  { src: 'music/lagu2.mp3', title: 'Lagu Kita #2', artist: 'Ganti nama artis' },
  { src: 'music/lagu3.mp3', title: 'Lagu Kita #3', artist: 'Ganti nama artis' },
  { src: 'music/lagu4.mp3', title: 'Lagu Kita #4', artist: 'Ganti nama artis' },
  { src: 'music/lagu5.mp3', title: 'Lagu Kita #5', artist: 'Ganti nama artis' }
];

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

// ---- Stiker lucu pemanis (pengganti "icon Pinterest": emoji dekoratif
//      acak, supaya tanpa perlu menarik gambar berhak cipta dari luar) ----
const CUTE_STICKERS = ['🌸','✨','🎀','🧸','⭐','💫','🍓','🦋','🌷','💌','🩷','☁️','🍡'];
function randomCuteSticker(){
  return CUTE_STICKERS[Math.floor(Math.random() * CUTE_STICKERS.length)];
}
// posisi-posisi pojok yang aman (tidak menutupi teks di tengah)
const STICKER_SPOTS = [
  { top:'6%',  left:'5%'  }, { top:'6%',  right:'6%' },
  { bottom:'8%', left:'6%' }, { bottom:'8%', right:'5%' },
  { top:'42%', left:'2%'  }, { top:'42%', right:'2%' }
];
function addPageStickers(container, count){
  const spots = STICKER_SPOTS.slice().sort(() => Math.random() - 0.5).slice(0, count);
  spots.forEach((pos) => {
    const s = document.createElement('span');
    s.className = 'page-sticker';
    s.textContent = randomCuteSticker();
    Object.assign(s.style, pos);
    s.style.setProperty('--srot', (Math.random() * 24 - 12) + 'deg');
    s.style.setProperty('--sdelay', (Math.random() * 2) + 's');
    s.setAttribute('aria-hidden', 'true');
    container.appendChild(s);
  });
}

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
  addPageStickers(page, 2 + Math.floor(Math.random() * 2)); // 2-3 stiker acak per halaman

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
window.__bookOpened = false;
book.addEventListener('click', () => {
  book.classList.add('opening');
  window.__bookOpened = true;
  if (window.__mpAutoplay) window.__mpAutoplay(); // musik otomatis diputar saat buku dibuka
  if (window.__mpOpenSheet) window.__mpOpenSheet(); // popup Now Playing otomatis muncul saat buku dibuka
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
    playProfileIntro();
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

// ---- 4. Bunga berjatuhan (pakai foto bunga asli dari folder image/) ----
const FLOWER_IMAGES = [
  'image/bunga-1.png','image/bunga-2.png','image/bunga-3.png','image/bunga-4.png',
  'image/bunga-5.png','image/bunga-6.png','image/bunga-7.png','image/bunga-8.png',
  'image/bunga-9.png','image/bunga-10.png','image/bunga-11.png'
];
function randomFlowerImage(){
  return FLOWER_IMAGES[Math.floor(Math.random() * FLOWER_IMAGES.length)];
}
let petalInterval = null;
function startPetals(){
  if (petalInterval) return;
  const spawn = () => {
    const p = document.createElement('img');
    p.className = 'petal';
    p.src = randomFlowerImage();
    p.alt = '';
    const left = Math.random() * 100;
    const duration = 7 + Math.random() * 6;
    const drift = (Math.random() * 120 - 60) + 'px';
    const spin = (Math.random() * 360 - 180) + 'deg';
    p.style.left = left + 'vw';
    p.style.width = (26 + Math.random() * 26) + 'px';
    p.style.setProperty('--drift', drift);
    p.style.setProperty('--spin', spin);
    p.style.animationDuration = duration + 's';
    document.body.appendChild(p);
    setTimeout(() => p.remove(), duration * 1000 + 200);
  };
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const rate = reduceMotion ? 900 : 350;
  for (let i = 0; i < 8; i++) setTimeout(spawn, i * 150);
  petalInterval = setInterval(spawn, rate);
}
// Menghentikan bunga berjatuhan sepenuhnya (dipakai di halaman photoshoot,
// supaya photoshoot bebas dari animasi bunga)
function stopPetals(){
  if (petalInterval){ clearInterval(petalInterval); petalInterval = null; }
  document.querySelectorAll('.petal').forEach((p) => p.remove());
}

// ---- 4b. Musik latar sekarang sepenuhnya memakai file lagu milikmu sendiri
//      lewat Music Player bergaya Spotify di bawah (lihat initMusicPlayer).
//      Tombol speaker di halaman akhir mengatur mute/unmute lagu itu. ----
const soundToggle = document.getElementById('sound-toggle');
const soundIcon = document.getElementById('sound-icon');
let muted = false;
soundToggle.addEventListener('click', () => {
  const audio = window.__mpAudio;
  if (!audio) return;
  muted = !muted;
  audio.muted = muted;
  if (muted){
    soundIcon.innerHTML = '<path d="M4 9v6h4l5 5V4L8 9H4z"/><line x1="17" y1="9" x2="23" y2="15"/><line x1="23" y1="9" x2="17" y2="15"/>';
  } else {
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

// ---- Music player (gaya Spotify) — versi playlist + popup Now Playing ----
// Daftar lagu diatur lewat konstanta SONGS di bagian "GANTI DI SINI" atas.
(function initMusicPlayer(){
  const mpAudio = new Audio();
  let mpPlaying = false;
  let songReady = false;
  let songIndex = 0;

  const mpPlay = document.getElementById('mp-play');
  const mpNext = document.getElementById('mp-next');
  const mpArt = document.getElementById('mp-art');
  const mpFill = document.getElementById('mp-progress-fill');
  const mpCur = document.getElementById('mp-cur');
  const mpDur = document.getElementById('mp-dur');
  const mpProgress = document.getElementById('mp-progress');
  const mpTitleEl = document.getElementById('mp-title');
  const mpArtistEl = document.getElementById('mp-artist');
  const mpChevron = document.getElementById('mp-chevron');

  const mpSheetOverlay = document.getElementById('mp-sheet-overlay');
  const mpSheet = document.getElementById('mp-sheet');
  const mpSheetArt = document.getElementById('mp-sheet-art');
  const mpSheetTitleEl = document.getElementById('mp-sheet-title');
  const mpSheetArtistEl = document.getElementById('mp-sheet-artist');
  const mpSheetFill = document.getElementById('mp-sheet-progress-fill');
  const mpSheetProgress = document.getElementById('mp-sheet-progress');
  const mpSheetCur = document.getElementById('mp-sheet-cur');
  const mpSheetDur = document.getElementById('mp-sheet-dur');
  const mpSheetPlay = document.getElementById('mp-sheet-play');
  const mpSheetPrev = document.getElementById('mp-sheet-prev');
  const mpSheetNext = document.getElementById('mp-sheet-next');

  function fmtTime(s){
    if (!isFinite(s) || s < 0) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  }
  function updatePlayIcon(){
    const icon = mpPlaying
      ? '<svg viewBox="0 0 24 24"><path d="M6 5h4v14H6zM14 5h4v14h-4z"/></svg>'
      : '<svg viewBox="0 0 24 24"><path d="M7 5l12 7-12 7z"/></svg>';
    mpPlay.innerHTML = icon;
    mpSheetPlay.innerHTML = icon;
    mpArt.classList.toggle('mp-spin', mpPlaying);
    mpSheetArt.classList.toggle('mp-spin', mpPlaying);
  }
  function updateSongInfo(){
    const song = SONGS[songIndex] || { title: 'Belum ada lagu', artist: 'ketuk untuk memutar' };
    mpTitleEl.textContent = song.title;
    mpArtistEl.textContent = song.artist;
    mpSheetTitleEl.textContent = song.title;
    mpSheetArtistEl.textContent = song.artist;
  }

  function loadSong(index, autoplay){
    songIndex = ((index % SONGS.length) + SONGS.length) % SONGS.length;
    const song = SONGS[songIndex];
    songReady = false;
    mpAudio.src = song.src;
    mpAudio.preload = 'metadata';
    updateSongInfo();
    mpFill.style.width = '0%';
    mpSheetFill.style.width = '0%';
    if (autoplay){
      mpAudio.play().then(() => {
        mpPlaying = true;
        updatePlayIcon();
      }).catch(() => { /* browser menahan autoplay, pengguna bisa tekan play manual */ });
    }
  }

  mpAudio.addEventListener('loadedmetadata', () => {
    songReady = true;
    const d = fmtTime(mpAudio.duration);
    mpDur.textContent = d;
    mpSheetDur.textContent = d;
  });
  mpAudio.addEventListener('error', () => { songReady = false; });

  // Lagu habis -> otomatis lanjut ke lagu berikutnya + popup muncul otomatis
  mpAudio.addEventListener('ended', () => {
    nextSong(true);
  });

  mpAudio.addEventListener('timeupdate', () => {
    const pct = mpAudio.duration ? (mpAudio.currentTime / mpAudio.duration) * 100 : 0;
    mpFill.style.width = pct + '%';
    mpSheetFill.style.width = pct + '%';
    const cur = fmtTime(mpAudio.currentTime);
    mpCur.textContent = cur;
    mpSheetCur.textContent = cur;
  });

  function seekFromEvent(e, el){
    if (!mpAudio.duration) return;
    const rect = el.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    mpAudio.currentTime = pct * mpAudio.duration;
  }
  mpProgress.addEventListener('click', (e) => seekFromEvent(e, mpProgress));
  mpSheetProgress.addEventListener('click', (e) => seekFromEvent(e, mpSheetProgress));

  function togglePlay(){
    if (!songReady && mpAudio.src) { mpAudio.load(); }
    if (mpPlaying) {
      mpAudio.pause();
      mpPlaying = false;
    } else {
      mpAudio.play().catch(() => {});
      mpPlaying = true;
    }
    updatePlayIcon();
  }
  mpPlay.addEventListener('click', togglePlay);
  mpSheetPlay.addEventListener('click', togglePlay);

  // "auto" = true berarti lagu berganti sendiri (bukan karena tombol next
  // ditekan) -> sesuai permintaan, popup Now Playing otomatis dimunculkan.
  function nextSong(auto){
    loadSong(songIndex + 1, true);
    if (auto) openSheet();
  }
  function prevSong(){
    loadSong(songIndex - 1, true);
  }
  mpNext.addEventListener('click', () => nextSong(false));
  mpSheetNext.addEventListener('click', () => nextSong(false));
  mpSheetPrev.addEventListener('click', prevSong);

  // ---- Popup "Now Playing" ala iPhone ----
  let sheetTimer = null;
  function resetSheetTimer(){
    clearTimeout(sheetTimer);
    sheetTimer = setTimeout(closeSheet, 60000); // otomatis hilang setelah 1 menit tak disentuh
  }
  function openSheet(){
    mpSheetOverlay.classList.add('show');
    resetSheetTimer();
  }
  function closeSheet(){
    mpSheetOverlay.classList.remove('show');
    clearTimeout(sheetTimer);
  }
  function toggleSheet(){
    if (mpSheetOverlay.classList.contains('show')) closeSheet();
    else openSheet();
  }
  mpChevron.addEventListener('click', (e) => { e.stopPropagation(); toggleSheet(); });
  mpSheetOverlay.addEventListener('click', (e) => { if (e.target === mpSheetOverlay) closeSheet(); });
  mpSheet.addEventListener('click', resetSheetTimer);

  updatePlayIcon();
  loadSong(0, false);

  // Dipakai oleh tombol speaker di halaman akhir & animasi buka buku.
  window.__mpAudio = mpAudio;
  window.__mpAutoplay = function(){
    if (mpPlaying) return;
    mpAudio.play().then(() => {
      mpPlaying = true;
      updatePlayIcon();
    }).catch(() => { /* browser menahan autoplay, pengguna bisa tekan play manual */ });
  };
  // Dipakai supaya popup otomatis muncul saat buku/isi buku dibuka.
  window.__mpOpenSheet = openSheet;
})();

// ---- Animasi intro halaman profil ----
// Tahap 1: halaman kosong/polos (kartu profil belum tampak).
// Tahap 2: balon (membawa foto image/cantik.png) terbang dari bawah ke tengah.
// Tahap 3: balon meletus di tengah, foto ikut menghilang.
// Tahap 4: bunga (image/bunga-1..11.png) menyebar dari sedikit sampai menutup
//          seluruh layar, bertahan 1 detik penuh.
// Tahap 5: bunga menghilang, kartu profil muncul, dan foto cantik.png muncul
//          melayang permanen di pojok kiri bawah.
const PROFILE_PHOTO_SRC = 'image/cantik.png'; // taruh foto ini di folder "image/"

function spawnFlowerFlood(onDone){
  const total = 70;
  const flowers = [];
  let spawned = 0;

  function spawnOne(){
    const f = document.createElement('img');
    f.className = 'prof-flower';
    f.src = randomFlowerImage();
    f.alt = '';
    f.style.left = (Math.random() * 100) + 'vw';
    f.style.top = (Math.random() * 100) + 'vh';
    f.style.width = (34 + Math.random() * 30) + 'px';
    f.style.setProperty('--frot', (Math.random() * 360 - 180) + 'deg');
    document.body.appendChild(f);
    flowers.push(f);
    requestAnimationFrame(() => f.classList.add('show'));

    spawned++;
    if (spawned < total){
      // makin lama makin cepat, biar terasa "makin menutup layar"
      const delay = Math.max(6, 26 - spawned * 0.3);
      setTimeout(spawnOne, delay);
    } else {
      // bunga sudah menutup seluruh halaman -> bertahan 1 detik penuh
      setTimeout(() => {
        flowers.forEach((fl) => fl.classList.add('fade'));
        setTimeout(() => {
          flowers.forEach((fl) => fl.remove());
          if (onDone) onDone();
        }, 650);
      }, 1000);
    }
  }
  spawnOne();
}

function playProfileIntro(){
  const card = document.querySelector('#screen-profile .profile-card');
  if (!card || card.dataset.played === '1') return;
  card.dataset.played = '1';

  // Tahap 2 — balon (dengan foto tergantung) terbang dari bawah ke tengah
  const balloon = document.createElement('div');
  balloon.className = 'prof-balloon';
  balloon.innerHTML =
    `<svg class="prof-balloon-svg" viewBox="0 0 100 130" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">` +
      `<ellipse cx="50" cy="46" rx="42" ry="46" fill="url(#profBalloonGrad)"/>` +
      `<path d="M50 92 L45 101 L55 101 Z" fill="#AD6274"/>` +
      `<path d="M50 101 C 38 110, 62 118, 50 130" stroke="#6D5058" stroke-width="2" fill="none"/>` +
      `<ellipse cx="34" cy="28" rx="10" ry="15" fill="#fff" opacity=".35"/>` +
      `<defs><linearGradient id="profBalloonGrad" x1="0" y1="0" x2="1" y2="1">` +
        `<stop offset="0%" stop-color="#E7A6B4"/><stop offset="100%" stop-color="#AD6274"/>` +
      `</linearGradient></defs>` +
    `</svg>` +
    `<div class="prof-balloon-photo"><img src="${PROFILE_PHOTO_SRC}" alt=""></div>`;
  document.body.appendChild(balloon);
  requestAnimationFrame(() => balloon.classList.add('rise'));

  setTimeout(() => {
    // Tahap 3 — balon meletus di tengah, foto ikut menghilang
    balloon.classList.add('pop');

    const burst = document.createElement('div');
    burst.className = 'prof-pop-burst';
    document.body.appendChild(burst);
    requestAnimationFrame(() => burst.classList.add('show'));

    setTimeout(() => {
      balloon.remove();
      burst.classList.add('hide');
      setTimeout(() => burst.remove(), 400);

      // Tahap 4 — bunga menutup layar, tahan 1 detik, lalu hilang
      spawnFlowerFlood(() => {
        // Tahap 5 — kartu profil muncul + foto melayang permanen di pojok kiri bawah
        card.classList.add('show');

        const corner = document.createElement('div');
        corner.className = 'prof-corner-photo';
        corner.innerHTML = `<img src="${PROFILE_PHOTO_SRC}" alt="">`;
        document.body.appendChild(corner);
        requestAnimationFrame(() => corner.classList.add('show'));
      });
    }, 380);
  }, 2100);
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

  setTimeout(() => {
    for (let i = 0; i < 22; i++) {
      const p = document.createElement('img');
      p.className = 'burst-petal';
      p.src = randomFlowerImage();
      p.alt = '';
      const angle = Math.random() * Math.PI * 2;
      const dist = 42 + Math.random() * 46;
      p.style.width = (28 + Math.random() * 22) + 'px';
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
    // Nuansa kamera vintage 90-an: hangat, sedikit pudar, kontras naik.
    vintage: 'sepia(0.42) contrast(1.15) saturate(1.35) brightness(1.05) hue-rotate(-4deg)',
    bw: 'grayscale(1) contrast(1.15)',
    warm: 'saturate(1.35) brightness(1.08) contrast(.96) hue-rotate(-6deg)'
  };

  // Stiker lucu di sekitar halaman photoshoot (pengganti "icon Pinterest")
  if (typeof addPageStickers === 'function'){
    const psWrap = document.querySelector('.ps-wrap');
    if (psWrap){
      const spots = [
        { top:'3%', left:'3%' }, { top:'3%', right:'3%' },
        { bottom:'4%', left:'3%' }, { bottom:'4%', right:'3%' }
      ].sort(() => Math.random() - 0.5).slice(0, 3);
      spots.forEach((pos) => {
        const s = document.createElement('span');
        s.className = 'ps-sticker';
        s.textContent = randomCuteSticker();
        Object.assign(s.style, pos);
        s.style.setProperty('--sdelay', (Math.random() * 2) + 's');
        s.setAttribute('aria-hidden', 'true');
        psWrap.appendChild(s);
      });
    }
  }

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

  const SHOT_W = 2048;
  const SHOT_H = 1536;

  async function startCamera(){
    try{
      mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: SHOT_W },
          height: { ideal: SHOT_H }
        },
        audio: false
      });
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

  function applyVintageLook(ctx, w, h){
    // Vignette lembut ala kamera saku 90-an
    const vg = ctx.createRadialGradient(w/2, h/2, h*0.28, w/2, h/2, h*0.78);
    vg.addColorStop(0, 'rgba(0,0,0,0)');
    vg.addColorStop(1, 'rgba(20,10,8,0.38)');
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, w, h);

    // Butiran film (grain) tipis
    const grainCount = Math.round((w * h) / 2200);
    ctx.fillStyle = 'rgba(255,255,255,0.05)';
    for (let i = 0; i < grainCount; i++){
      const gx = Math.random() * w;
      const gy = Math.random() * h;
      ctx.fillRect(gx, gy, 1, 1);
    }

    // Cap tanggal oranye khas kamera analog 90-an, pojok kanan bawah
    const d = new Date();
    const stamp = `'${String(d.getFullYear()).slice(2)} ${String(d.getMonth()+1).padStart(2,'0')} ${String(d.getDate()).padStart(2,'0')}`;
    ctx.font = `${Math.round(h * 0.032)}px 'Courier New', monospace`;
    ctx.textAlign = 'right';
    ctx.fillStyle = 'rgba(255,140,40,0.85)';
    ctx.shadowColor = 'rgba(0,0,0,0.35)';
    ctx.shadowBlur = 2;
    ctx.fillText(stamp, w - w * 0.035, h - h * 0.035);
    ctx.shadowBlur = 0;
  }

  function captureFrame(){
    const c = document.createElement('canvas');
    // Komposisi hasil foto tetap 2048x1536 (crop "cover" dari video kamera).
    c.width = SHOT_W;
    c.height = SHOT_H;
    const ctx = c.getContext('2d');
    try{ ctx.filter = FILTER_MAP[selectedFilter]; }catch(e){}

    const vw = psVideo.videoWidth || SHOT_W;
    const vh = psVideo.videoHeight || SHOT_H;
    const targetRatio = SHOT_W / SHOT_H;
    const srcRatio = vw / vh;
    let sx, sy, sw, sh;
    if (srcRatio > targetRatio){
      sh = vh; sw = vh * targetRatio; sx = (vw - sw) / 2; sy = 0;
    } else {
      sw = vw; sh = vw / targetRatio; sx = 0; sy = (vh - sh) / 2;
    }
    ctx.drawImage(psVideo, sx, sy, sw, sh, 0, 0, c.width, c.height);
    ctx.filter = 'none';

    if (selectedFilter === 'vintage') applyVintageLook(ctx, c.width, c.height);
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
    if (typeof startPetals === 'function') startPetals(); // bunga kembali di halaman final
  });

  psCamRetry.addEventListener('click', startCamera);

  btnPhoto.addEventListener('click', () => {
    if (typeof stopPetals === 'function') stopPetals(); // halaman photoshoot bebas dari animasi bunga
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
