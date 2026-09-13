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
    row.innerHTML = `
      <span class="pj-row-main">
        <span class="pj-row-name">${escapeHtml(name)}</span>
        <span class="pj-row-date">${fmtDate(entry.date)}</span>
      </span>
      <button class="pj-row-delete" type="button" aria-label="Hapus jawaban dari ${escapeHtml(name)}">
        <svg viewBox="0 0 24 24"><path d="M4 7h16M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2m-7 0h10l-1 13a1 1 0 01-1 1H8a1 1 0 01-1-1L6 7z"/></svg>
      </button>`;
    row.querySelector('.pj-row-main').addEventListener('click', () => openDetail(entry));
    row.querySelector('.pj-row-delete').addEventListener('click', (e) => {
      e.stopPropagation();
      askDelete(entry.id, name);
    });
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

  const deleteBtn = document.getElementById('pj-delete-entry');
  deleteBtn.onclick = () => askDelete(entry.id, name, true);
}

document.getElementById('pj-close').addEventListener('click', () => {
  document.getElementById('pj-detail-overlay').classList.remove('show');
});
document.getElementById('pj-detail-overlay').addEventListener('click', (e) => {
  if (e.target.id === 'pj-detail-overlay') e.currentTarget.classList.remove('show');
});

// ---- Hapus jawaban ----
let pendingDeleteId = null;
let pendingCloseDetail = false;

function askDelete(id, name, fromDetail) {
  pendingDeleteId = id;
  pendingCloseDetail = !!fromDetail;
  document.getElementById('pj-confirm-text').textContent =
    `Yakin ingin menghapus jawaban dari "${name}"? Tindakan ini tidak bisa dibatalkan.`;
  document.getElementById('pj-confirm-overlay').classList.add('show');
}

function closeConfirm() {
  document.getElementById('pj-confirm-overlay').classList.remove('show');
  pendingDeleteId = null;
}

function deleteEntry(id) {
  try {
    const list = JSON.parse(localStorage.getItem(MC_STORAGE_KEY) || '[]');
    const filtered = list.filter((e) => e.id !== id);
    localStorage.setItem(MC_STORAGE_KEY, JSON.stringify(filtered));
  } catch (e) { /* abaikan */ }
}

document.getElementById('pj-confirm-cancel').addEventListener('click', closeConfirm);
document.getElementById('pj-confirm-overlay').addEventListener('click', (e) => {
  if (e.target.id === 'pj-confirm-overlay') closeConfirm();
});
document.getElementById('pj-confirm-ok').addEventListener('click', () => {
  if (pendingDeleteId !== null) {
    deleteEntry(pendingDeleteId);
    if (pendingCloseDetail) document.getElementById('pj-detail-overlay').classList.remove('show');
    renderList();
  }
  closeConfirm();
});

renderList();
