/* ==========================================================================
   GANTI DI SINI — hal-hal gampang diedit untuk halaman monster.
   ========================================================================== */

// Kunci penyimpanan jawaban (dibaca oleh pesan.html). Tidak perlu diubah,
// kecuali kamu ingin memisahkan beberapa "sesi" jawaban berbeda.
const MC_STORAGE_KEY = 'mc_jawaban_masuk';

// Kecepatan animasi mengetik (ms per huruf) — makin kecil makin cepat.
const MC_TYPE_SPEED = 32;

// Jeda antar obrolan otomatis (tanpa tombol), dalam ms.
const MC_AUTO_PAUSE = 950;

/* ==========================================================================
   Susunan percakapan. Urutan & teks ini yang menyusun seluruh obrolan.
   Tidak perlu diubah kecuali ingin mengedit isi obrolan/pertanyaan.
   ========================================================================== */
const MC_TURNS = [
  { text: 'Hai!, selamat datang..', buttons: [{ label: 'Hi!' }] },

  { text: 'Siapa nama mu?', question: true, key: 'nama', noBack: true },

  { text: 'bos kami kebetulan sedang sibuk beberapa hari ini,' },
  { text: 'Dia sangatttt! ingin bertanya tentang dirimu, tetapi dia malu :p' },
  { text: 'apa aku boleh bertanya? nanti aku akan sampaikan ke bos ku XD', buttons: [{ label: 'Boleh!' }] },

  { text: 'Apa kesukaanmu (seperti: makanan, minuman, warna)?', question: true, key: 'suka', noBack: true },
  { text: 'Apa favoritmu (seperti: musik, film)?', question: true, key: 'favorit' },
  { text: 'Apa impian terbesarmu?', question: true, key: 'impian' },
  { text: 'Apa tempat yang ingin kamu kunjungi?', question: true, key: 'tempat' },
  { text: 'Apa bentuk perhatian yang paling kamu suka?', question: true, key: 'perhatian1' },
  { text: 'Apa hal kecil yang bikin kamu bahagia?', question: true, key: 'bahagia' },
  { text: 'Apa bentuk perhatian yang paling kamu suka?', question: true, key: 'perhatian2' },
  { text: 'Apa hal yang ingin kamu lakukan bersama orang yang kamu sayang?', question: true, key: 'bareng' },
  { text: 'Kalau bisa punya satu kekuatan super, kamu pilih apa?', question: true, key: 'kekuatan' },

  { textFn: (a) => `Wah keren kamu ingin punya kekuatan ${a.kekuatan}, ternyata bos tidak salah pilih orang!`, buttons: [{ label: 'Iya dongggg!' }] },
  { textFn: (a) => `Oke, baiklah ${a.nama} yang cantik.. aku kan memberi tahu semua jawaban mu ke bos ku, terima kasih yaa!`, buttons: [{ label: 'baiklah masama, btw bosnya ganteng!', action: 'submit' }] },

  { text: 'Oh, tentu! ada yang bilang dia mirip iqbal ramadhan xd' },
  { text: 'Hahaha, bos ku terlalu banyak menghayal... Oh iyaa!', buttons: [{ label: 'kenapa?' }] },
  { text: 'Bos ku memberikanku buku ini untukmu.. coba kamu baca saja yaa!', buttons: [{ label: 'Baik!', action: 'finish' }] }
];

// Label pertanyaan yang ditampilkan lagi di pesan.html (biar rapi & jelas).
const MC_QUESTION_LABELS = {
  nama: 'Siapa nama mu?',
  suka: 'Apa kesukaanmu (seperti: makanan, minuman, warna)?',
  favorit: 'Apa favoritmu (seperti: musik, film)?',
  impian: 'Apa impian terbesarmu?',
  tempat: 'Apa tempat yang ingin kamu kunjungi?',
  perhatian1: 'Apa bentuk perhatian yang paling kamu suka?',
  bahagia: 'Apa hal kecil yang bikin kamu bahagia?',
  perhatian2: 'Apa bentuk perhatian yang paling kamu suka?',
  bareng: 'Apa hal yang ingin kamu lakukan bersama orang yang kamu sayang?',
  kekuatan: 'Kalau bisa punya satu kekuatan super, kamu pilih apa?'
};

/* ==========================================================================
   Logika. Tidak perlu diubah kecuali ingin menyesuaikan perilaku.
   ========================================================================== */
(function initMonsterChat() {
  const screen = document.getElementById('screen-monster');
  if (!screen) return;

  const monsterEl = document.getElementById('mc-monster');
  const textEl = document.getElementById('mc-text');
  const typingDots = document.getElementById('mc-typing-dots');
  const answerWrap = document.getElementById('mc-answer-wrap');
  const answerInput = document.getElementById('mc-answer-input');
  const buttonsWrap = document.getElementById('mc-buttons');
  const toast = document.getElementById('mc-toast');
  const mcLoading = document.getElementById('mc-loading');
  const mcLoadingBar = document.getElementById('mc-loading-bar-fill');

  let idx = 0;
  let answers = {};
  let typing = false;
  let typeTimer = null;
  let autoTimer = null;
  let skipRequested = false;

  // ---- suara ketikan lembut (pakai AudioContext yang sama dari script.js) ----
  function playTypeTick() {
    try {
      if (typeof ensureSfxCtx !== 'function') return;
      const ctx = ensureSfxCtx();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200 + Math.random() * 200, now);
      g.gain.setValueAtTime(0.0001, now);
      g.gain.exponentialRampToValueAtTime(0.05, now + 0.008);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);
      osc.connect(g).connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.06);
    } catch (e) { /* abaikan kalau audio tidak didukung */ }
  }

  // ---- partikel kecil saat tombol diketuk ----
  const MC_PARTICLE_EMOJI = ['✨', '💫', '⭐', '🎉', '💗'];
  function spawnParticles(btn) {
    const rect = btn.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const count = 7;
    for (let i = 0; i < count; i++) {
      const p = document.createElement('span');
      p.className = 'mc-particle';
      p.textContent = MC_PARTICLE_EMOJI[Math.floor(Math.random() * MC_PARTICLE_EMOJI.length)];
      p.style.left = cx + 'px';
      p.style.top = cy + 'px';
      const angle = Math.random() * Math.PI * 2;
      const dist = 34 + Math.random() * 30;
      p.style.setProperty('--px', Math.cos(angle) * dist + 'px');
      p.style.setProperty('--py', Math.sin(angle) * dist + 'px');
      document.body.appendChild(p);
      setTimeout(() => p.remove(), 750);
    }
  }

  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2600);
  }

  function clearButtons() { buttonsWrap.innerHTML = ''; }

  function makeButton(label, extraClass) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'mc-btn' + (extraClass ? ' ' + extraClass : '');
    b.textContent = label;
    return b;
  }

  // ---- efek mengetik ----
  function typeText(str, onDone) {
    typing = true;
    skipRequested = false;
    textEl.textContent = '';
    monsterEl.classList.add('mc-talking');
    typingDots.hidden = true;

    const cursor = document.createElement('span');
    cursor.className = 'mc-cursor';
    let i = 0;

    function step() {
      if (skipRequested) {
        textEl.textContent = str;
        finish();
        return;
      }
      i++;
      textEl.textContent = str.slice(0, i);
      if (i % 2 === 0) playTypeTick();
      if (i < str.length) {
        typeTimer = setTimeout(step, MC_TYPE_SPEED);
      } else {
        finish();
      }
    }
    function finish() {
      typing = false;
      monsterEl.classList.remove('mc-talking');
      if (onDone) onDone();
    }
    step();
  }

  // klik pada kotak dialog -> percepat/selesaikan ketikan yang sedang berjalan
  document.getElementById('mc-dialogue-box').addEventListener('click', () => {
    if (typing) skipRequested = true;
  });

  function render(newIdx) {
    clearTimeout(autoTimer);
    idx = newIdx;
    const turn = MC_TURNS[idx];
    const text = turn.textFn ? turn.textFn(answers) : turn.text;

    clearButtons();
    answerWrap.hidden = true;

    // indikator "sedang mengetik" sebentar sebelum teks muncul
    typingDots.hidden = false;
    setTimeout(() => {
      typingDots.hidden = true;
      typeText(text, () => onTypedDone(turn));
    }, 380);
  }

  function onTypedDone(turn) {
    if (turn.question) {
      answerWrap.hidden = false;
      answerInput.value = answers[turn.key] || '';
      requestAnimationFrame(() => answerInput.focus());

      if (!turn.noBack) {
        const backBtn = makeButton('Kembali', 'mc-btn-ghost');
        backBtn.addEventListener('click', () => render(idx - 1));
        buttonsWrap.appendChild(backBtn);
      }
      const nextBtn = makeButton('Lanjut');
      nextBtn.disabled = !answerInput.value.trim();
      nextBtn.addEventListener('click', (e) => {
        answers[turn.key] = answerInput.value.trim();
        spawnParticles(e.currentTarget);
        render(idx + 1);
      });
      buttonsWrap.appendChild(nextBtn);

      const syncDisabled = () => { nextBtn.disabled = !answerInput.value.trim(); };
      answerInput.addEventListener('input', syncDisabled);
      answerInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !nextBtn.disabled) nextBtn.click();
      });
    } else if (turn.buttons && turn.buttons.length) {
      turn.buttons.forEach((btnDef) => {
        const btn = makeButton(btnDef.label);
        btn.addEventListener('click', (e) => {
          spawnParticles(e.currentTarget);
          handleAction(btnDef.action);
        });
        buttonsWrap.appendChild(btn);
      });
    } else {
      // tidak ada tombol/pertanyaan -> lanjut otomatis setelah jeda singkat
      autoTimer = setTimeout(() => render(idx + 1), MC_AUTO_PAUSE);
    }
  }

  function handleAction(action) {
    if (action === 'submit') {
      submitAnswers();
      render(idx + 1);
    } else if (action === 'finish') {
      startFinishLoading();
    } else {
      render(idx + 1);
    }
  }

  function submitAnswers() {
    try {
      const entry = {
        id: Date.now(),
        date: new Date().toISOString(),
        answers: Object.assign({}, answers)
      };
      const list = JSON.parse(localStorage.getItem(MC_STORAGE_KEY) || '[]');
      list.push(entry);
      localStorage.setItem(MC_STORAGE_KEY, JSON.stringify(list));
      showToast('✅ Jawabanmu berhasil dikirim!');
    } catch (e) {
      showToast('Jawaban tersimpan di perangkat ini.');
    }
  }

  function startFinishLoading() {
    mcLoading.classList.add('show');
    mcLoadingBar.style.width = '0%';
    requestAnimationFrame(() => {
      requestAnimationFrame(() => { mcLoadingBar.style.width = '100%'; });
    });
    setTimeout(() => {
      mcLoading.classList.remove('show');
      mcLoadingBar.style.width = '0%';
      if (typeof showScreen === 'function') showScreen('screen-cover');
    }, 5000);
  }

  // mulai obrolan
  render(0);
})();
