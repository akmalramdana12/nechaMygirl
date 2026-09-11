const MC_STORAGE_KEY = 'mc_jawaban_masuk';

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
const MC_QUESTION_ORDER = ['nama', 'suka', 'favorit', 'impian', 'tempat', 'perhatian1', 'bahagia', 'perhatian2', 'bareng', 'kekuatan'];

function fmtDate(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) +
      ' · ' + d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  } catch (e) { return iso; }
}

function loadEntries() {
  try {
    return JSON.parse(localStorage.getItem(MC_STORAGE_KEY) || '[]').sort((a, b) => b.id - a.id);
  } catch (e) { return []; }
}

function renderList() {
  const listEl = document.getElementById('pj-list');
  const emptyEl = document.getElementById('pj-empty');
  const entries = loadEntries();

  listEl.innerHTML = '';
  if (!entries.length) {
    emptyEl.hidden = false;
    return;
  }
  emptyEl.hidden = true;

  entries.forEach((entry) => {
    const row = document.createElement('div');
    row.className = 'pj-row';
    const name = entry.answers && entry.answers.nama ? entry.answers.nama : '(tanpa nama)';
    row.innerHTML = `<span class="pj-row-name">${escapeHtml(name)}</span><span class="pj-row-date">${fmtDate(entry.date)}</span>`;
    row.addEventListener('click', () => openDetail(entry));
    listEl.appendChild(row);
  });
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = String(str);
  return div.innerHTML;
}

function openDetail(entry) {
  const inner = document.getElementById('pj-detail-inner');
  const name = entry.answers && entry.answers.nama ? entry.answers.nama : '(tanpa nama)';

  let html = `<div class="pj-detail-name">${escapeHtml(name)}</div>`;
  html += `<div class="pj-detail-date">${fmtDate(entry.date)}</div>`;

  MC_QUESTION_ORDER.forEach((key) => {
    const answer = entry.answers ? entry.answers[key] : '';
    if (answer === undefined) return;
    html += `<div class="pj-qa">
      <div class="pj-q">${escapeHtml(MC_QUESTION_LABELS[key] || key)}</div>
      <div class="pj-a">${escapeHtml(answer || '(tidak dijawab)')}</div>
    </div>`;
  });

  inner.innerHTML = html;
  document.getElementById('pj-detail-overlay').classList.add('show');
}

document.getElementById('pj-close').addEventListener('click', () => {
  document.getElementById('pj-detail-overlay').classList.remove('show');
});
document.getElementById('pj-detail-overlay').addEventListener('click', (e) => {
  if (e.target.id === 'pj-detail-overlay') e.currentTarget.classList.remove('show');
});

renderList();
