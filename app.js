/* DORAEMON BLOG — SITE ENGINE + WRITEUP EDITOR */
const $ = s => document.querySelector(s);
const esc = s => String(s ?? "").replace(/[&<>\"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const slug = s => String(s).replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase() || "writeup";
document.getElementById('yr').textContent = new Date().getFullYear();

let toastTimer;
function toast(msg) {
  const t = $('#toast'); t.textContent = msg; t.style.display = 'block';
  clearTimeout(toastTimer); toastTimer = setTimeout(() => t.style.display = 'none', 3200);
}
function loadWriteups() {
  try {
    const saved = localStorage.getItem('doraemon-writeups-v1');
    if (!saved) return WRITEUPS.map(w => ({...w}));
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : WRITEUPS.map(w => ({...w}));
  } catch { return WRITEUPS.map(w => ({...w})); }
}
let writeupsData = loadWriteups();
let filter = 'All';
const editorMode = new URLSearchParams(location.search).get('editor') === '1';

function inline(t) {
  return t
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" loading="lazy">')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>');
}
function md(s) {
  return esc(s || '').split('```').map((part, i) => {
    if (i % 2) return '<pre><code>' + part.replace(/^[^\n]*\n/, '') + '</code></pre>';
    return part.split(/\n\s*\n/).map(block => {
      block = block.trim(); if (!block) return '';
      if (/^#{1,3} /.test(block)) return '<h3>' + inline(block.replace(/^#+ /, '')) + '</h3>';
      if (/^[-*] /.test(block)) return '<ul>' + block.split('\n').map(l => '<li>' + inline(l.replace(/^[-*] /, '')) + '</li>').join('') + '</ul>';
      return '<p>' + inline(block).replace(/\n/g, '<br>') + '</p>';
    }).join('');
  }).join('');
}
const sorted = a => a.slice().sort((x, y) => (y.date || '').localeCompare(x.date || ''));
const isImg = c => c && c.startsWith('image/');
const card = w => `<article class="card-wrap"><a class="card" href="#${esc(w.id)}">
  <div class="tags"><span class="tag">${esc(w.cat)}</span><span class="tag">${esc(w.diff)}</span>${w.pts ? `<span class="tag pt mono">${+w.pts} pts</span>` : ''}</div>
  <h3>${esc(w.title)}</h3><p>${esc(w.summary)}</p><div class="meta mono">${esc(w.ctf)} · ${esc(w.date)}</div></a>
  ${editorMode ? `<div class="card-actions"><button class="btn g s" data-edit="${esc(w.id)}">Edit</button><button class="btn g s danger" data-delete="${esc(w.id)}">Delete</button></div>` : ''}</article>`;

function certIcon() {
  return '<svg viewBox="0 0 64 64" width="30" height="30" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="13" y="5" width="32" height="40" rx="5" fill="#2a0b0d"/><rect x="20" y="15" width="18" height="3.4" rx="1.7" fill="#fff"/><rect x="20" y="23" width="18" height="3.4" rx="1.7" fill="#fff"/><rect x="20" y="31" width="12" height="3.4" rx="1.7" fill="#fff"/><path d="M22 44 L22 58 L29 53 L36 58 L36 44 Z" fill="#2a0b0d"/><circle cx="29" cy="44" r="11" fill="#2a0b0d"/><circle cx="29" cy="44" r="7.5" fill="none" stroke="#fff" stroke-width="1.6"/></svg>';
}
const certCard = c => `<div class="card cert"><div class="cert-head"><div class="badge">${c.badgeUrl ? `<img src="${esc(c.badgeUrl)}" alt="${esc(c.name)} badge" style="width:100%;height:100%;object-fit:cover;border-radius:50%">` : certIcon()}</div><h3>${esc(c.name)}</h3></div><p>${esc(c.note)}</p><div class="meta mono">${esc(c.issuer)} · ${esc(c.date)}${c.credId ? ' · ID ' + esc(c.credId) : ''}</div>${c.fileUrl && isImg(c.fileType) ? `<img src="${esc(c.fileUrl)}" alt="${esc(c.name)} certificate">` : ''}<div class="bar">${c.fileUrl ? `<a class="btn g s" href="${esc(c.fileUrl)}" target="_blank" rel="noopener">View</a><a class="btn g s" href="${esc(c.fileUrl)}" download>Download</a>` : ''}${c.link ? `<a class="btn g s" href="${esc(c.link)}" target="_blank" rel="noopener">Verify ↗</a>` : ''}</div></div>`;
const empty = msg => `<div class="empty"><p>${msg}</p></div>`;

const V = {
  home() {
    const pts = writeupsData.reduce((a, w) => a + (+w.pts || 0), 0);
    return `<section class="hero"><div><span class="pill mono">capture the flag · writeups</span><h1>Every flag has a <em>story</em>.<br>Here's how I got mine.</h1><p class="lead">Writeups covering Active Directory, Web, Windows, Linux and Cloud — the bugs, the dead ends, and the flags.</p><a class="btn" href="#writeups">Browse writeups</a></div><div class="orb"><img src="assets/hero.jpg" alt="Hooded Doraemon hacking on a Kali laptop"></div></section>
    <h2>Latest writeups</h2>${writeupsData.length ? `<div class="grid">${sorted(writeupsData).slice(0,3).map(card).join('')}</div>` : empty('No writeups yet.')}<h2>Certifications</h2>${CERTS.length ? `<div class="grid">${sorted(CERTS).map(certCard).join('')}</div>` : empty('No certifications yet.')}`;
  },
  writeups() {
    const list = sorted(writeupsData).filter(w => filter === 'All' || w.cat === filter);
    return `<div class="page-heading"><h2>Writeups</h2>${editorMode ? `<div class="editor-actions"><button class="btn s" data-new>+ New writeup</button><button class="btn g s" data-export>Export data.js</button></div>` : ''}</div>
      <div class="chips filters">${['All', ...CATS].map(c => `<button class="btn s ${c === filter ? '' : 'g'}" data-f="${esc(c)}">${esc(c)}</button>`).join('')}</div>
      ${list.length ? `<div class="grid">${list.map(card).join('')}</div>` : empty(writeupsData.length ? 'Nothing in this category yet.' : 'No writeups yet. Click “New writeup” to add your first one.')}`;
  },
  certs() { return `<h2>Certification</h2>${CERTS.length ? `<div class="grid">${sorted(CERTS).map(certCard).join('')}</div>` : empty('No certifications yet.')}`; },
  whoami() { return `<div class="art"><img class="pfp big" src="assets/pfp.jpg" alt="Profile picture"><span class="pill mono">whoami</span><h1>${esc(ABOUT.name)}</h1><p>${esc(ABOUT.bio)}</p><div class="chips">${(ABOUT.links || []).map(l => `<a class="btn s" href="${esc(l[1])}" target="_blank" rel="noopener">${esc(l[0])}</a>`).join('')}</div></div>`; },
  post(w) { return `<article class="art"><a class="back mono" href="#writeups">← cd ../writeups</a>${editorMode ? `<div class="post-tools"><button class="btn g s" data-edit="${esc(w.id)}">Edit writeup</button></div>` : ''}<div class="tags" style="margin-top:24px"><span class="tag">${esc(w.cat)}</span><span class="tag">${esc(w.diff)}</span>${w.pts ? `<span class="tag pt mono">${+w.pts} pts</span>` : ''}</div><h1>${esc(w.title)}</h1><div class="meta mono">${esc(w.ctf)} · ${esc(w.date)}</div>${md(w.body)}${(w.files || []).length ? `<h3>Attachments</h3><div class="bar">${w.files.map(f => `<a class="btn g s" href="${esc(f.url)}" download>${esc(f.name)}</a>`).join('')}</div>` : ''}<div class="bar"><button class="btn g s" data-dlw="${esc(w.id)}">Download .md</button></div></article>`; },
  editor(id) { return editorMarkup(id); }
};

function editorMarkup(id) {
  const w = id ? writeupsData.find(x => x.id === id) : null;
  let draft = null;
  if (!w) { try { draft = JSON.parse(localStorage.getItem('doraemon-writeup-draft-v1') || 'null'); } catch {} }
  const val = (key, fallback='') => esc(w?.[key] ?? draft?.[key] ?? fallback);
  const options = (items, selected) => items.map(x => `<option value="${esc(x)}" ${x === selected ? 'selected' : ''}>${esc(x)}</option>`).join('');
  return `<section class="editor-page"><a class="back mono" href="#writeups">← cd ../writeups</a><h2>${w ? 'Edit writeup' : 'New writeup'}</h2>
    <form id="writeup-form" data-id="${esc(id || '')}">
      <div class="field"><label for="w-title">Title *</label><input id="w-title" name="title" required maxlength="120" placeholder="e.g. Kerberoasting on Forest" value="${val('title')}"></div>
      <div class="form-grid"><div class="field"><label for="w-ctf">CTF / Platform</label><input id="w-ctf" name="ctf" placeholder="HTB, THM, Hack Smarter..." value="${val('ctf')}"></div>
      <div class="field"><label for="w-cat">Category</label><select id="w-cat" name="cat">${options(CATS, w?.cat || CATS[0])}</select></div>
      <div class="field"><label for="w-diff">Difficulty</label><select id="w-diff" name="diff">${options(DIFFS, w?.diff || 'Easy')}</select></div>
      <div class="field"><label for="w-pts">Points</label><input id="w-pts" name="pts" type="number" min="0" placeholder="e.g. 20" value="${val('pts','0')}"></div>
      <div class="field"><label for="w-date">Date</label><input id="w-date" name="date" type="date" value="${val('date', new Date().toISOString().slice(0,10))}"></div></div>
      <div class="field"><label for="w-summary">Summary</label><textarea id="w-summary" name="summary" rows="2" maxlength="260" placeholder="Briefly describe the lab and your approach...">${val('summary')}</textarea></div>
      <div class="field"><div class="label-row"><label for="w-body">Writeup (Markdown) *</label><button type="button" class="text-btn" data-preview-toggle>Show preview</button></div><textarea id="w-body" name="body" rows="18" required placeholder="## Reconnaissance&#10;&#10;Describe your enumeration...&#10;&#10;Add code blocks using Markdown fences.">${val('body')}</textarea><div class="editor-hint">Supports headings, lists, bold, inline code, fenced code blocks and images.</div></div>
      <div class="upload-panel"><div><b>Images and attachments</b><p>Upload an image to insert it directly into your writeup. Images are stored in the browser's saved writeup data and included in the export.</p></div><div class="bar"><button type="button" class="btn g s" data-image-trigger>Upload image</button><button type="button" class="btn g s" data-markdown-import>Import .md / .txt</button></div><input id="w-image" type="file" accept="image/*" hidden><input id="w-import" type="file" accept=".md,.markdown,.txt,text/plain,text/markdown" hidden></div>
      <div id="writeup-preview" class="preview" hidden><div class="preview-title">Live preview</div><article class="art" id="preview-content"></article></div>
      <div class="form-footer"><button type="button" class="btn g s" data-cancel>Cancel</button><button type="submit" class="btn s">${w ? 'Save changes' : 'Save writeup'}</button></div>
    </form></section>`;
}

function persistWriteups() {
  try { localStorage.setItem('doraemon-writeups-v1', JSON.stringify(writeupsData)); return true; }
  catch (e) { toast('Could not save locally. Your browser storage may be full; export your data or use smaller images.'); return false; }
}
function downloadFile(name, content, type) {
  const blob = new Blob([content], {type}); const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = name; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function exportData() {
  if (typeof window.buildDoraemonDataJs !== 'function') { toast('Export helper missing from data.js.'); return; }
  downloadFile('data.js', window.buildDoraemonDataJs(writeupsData), 'text/javascript');
  toast('Exported data.js. Replace the repository file and push to GitHub to publish.');
}
function route() {
  const h = location.hash.slice(1) || 'home';
  const w = writeupsData.find(x => x.id === h);
  $('#app').innerHTML = w ? V.post(w) : (V[h] ? V[h]() : V.home());
  document.querySelectorAll('nav a').forEach(a => a.classList.toggle('on', a.dataset.r === h || (w && a.dataset.r === 'writeups')));
  window.scrollTo(0, 0);
}
function openEditor(id='') { location.hash = id ? `edit-${id}` : 'new-writeup'; }
function saveEditor(form) {
  const fd = new FormData(form); const title = String(fd.get('title') || '').trim();
  const id = form.dataset.id || slug(title);
  if (!title) { toast('Please enter a title.'); return; }
  const existing = writeupsData.find(x => x.id === id);
  const record = { id, title, ctf: String(fd.get('ctf') || '').trim(), cat: String(fd.get('cat') || CATS[0]), diff: String(fd.get('diff') || 'Easy'), pts: Number(fd.get('pts') || 0), date: String(fd.get('date') || new Date().toISOString().slice(0,10)), summary: String(fd.get('summary') || '').trim(), files: existing?.files || [], body: String(fd.get('body') || '') };
  const duplicate = writeupsData.find(x => x.id === id && x !== existing);
  if (duplicate) { record.id = `${id}-${Date.now().toString(36)}`; }
  if (existing) writeupsData = writeupsData.map(x => x === existing ? record : x); else writeupsData.push(record);
  persistWriteups(); localStorage.removeItem('doraemon-writeup-draft-v1'); location.hash = record.id; toast(existing ? 'Writeup updated locally.' : 'Writeup saved locally.');
}

// Click handling is delegated because page content is rendered dynamically.
document.addEventListener('click', e => {
  const t = e.target.closest('button'); if (!t) return;
  if (t.dataset.f) { filter = t.dataset.f; route(); return; }
  if (t.hasAttribute('data-new')) { openEditor(); return; }
  if (t.dataset.edit) { openEditor(t.dataset.edit); return; }
  if (t.dataset.delete) {
    const w = writeupsData.find(x => x.id === t.dataset.delete);
    if (w && confirm(`Delete “${w.title}” from this browser's saved writeups? Export and publish separately if needed.`)) {
      writeupsData = writeupsData.filter(x => x.id !== w.id); persistWriteups(); location.hash = 'writeups'; toast('Writeup deleted locally.');
    } return;
  }
  if (t.hasAttribute('data-export')) { exportData(); return; }
  if (t.hasAttribute('data-cancel')) { localStorage.removeItem('doraemon-writeup-draft-v1'); location.hash = 'writeups'; return; }
  if (t.hasAttribute('data-image-trigger')) { $('#w-image').click(); return; }
  if (t.hasAttribute('data-import-trigger') || t.hasAttribute('data-markdown-import')) { $('#w-import').click(); return; }
  if (t.hasAttribute('data-preview-toggle')) {
    const box = $('#writeup-preview'); const opening = box.hidden; box.hidden = !opening; t.textContent = opening ? 'Hide preview' : 'Show preview';
    if (opening) updatePreview(); return;
  }
  if (t.dataset.dlw) {
    const w = writeupsData.find(x => x.id === t.dataset.dlw); if (!w) return;
    const text = `# ${w.title}\n\n_${w.ctf} · ${w.cat} · ${w.diff} · ${w.date}_\n\n${w.body}\n`;
    downloadFile(slug(w.title) + '.md', text, 'text/markdown'); toast('Markdown downloaded.');
  }
});

document.addEventListener('submit', e => {
  if (e.target.id === 'writeup-form') { e.preventDefault(); saveEditor(e.target); }
});
function updatePreview() {
  const body = $('#w-body'); const out = $('#preview-content'); if (body && out) out.innerHTML = md(body.value);
}
document.addEventListener('input', e => {
  if (e.target.id === 'w-body' && !$('#writeup-preview')?.hidden) updatePreview();
  const form = e.target.closest('#writeup-form');
  if (form && !form.dataset.id) {
    const fd = new FormData(form); const draft = Object.fromEntries(fd.entries());
    try { localStorage.setItem('doraemon-writeup-draft-v1', JSON.stringify(draft)); } catch {}
  }
});
document.addEventListener('change', async e => {
  if (e.target.id === 'w-image' && e.target.files[0]) {
    const file = e.target.files[0];
    if (!file.type.startsWith('image/')) { toast('Please choose an image file.'); return; }
    try {
      const dataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader(); reader.onerror = reject;
        reader.onload = () => { const image = new Image(); image.onerror = reject; image.onload = () => {
          const scale = Math.min(1, 1800 / image.width); const canvas = document.createElement('canvas');
          canvas.width = Math.round(image.width * scale); canvas.height = Math.round(image.height * scale);
          canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/webp', 0.9));
        }; image.src = reader.result; }; reader.readAsDataURL(file);
      });
      const body = $('#w-body'); const insertion = `\n\n![${file.name.replace(/\.[^.]+$/, '')}](${dataUrl})\n\n`;
      const start = body.selectionStart, end = body.selectionEnd; body.setRangeText(insertion, start, end, 'end'); body.dispatchEvent(new Event('input', {bubbles:true})); body.focus();
      if (!$('#writeup-preview').hidden) updatePreview(); toast('Image inserted into Markdown.');
    } catch { toast('Could not read that image.'); }
    e.target.value = '';
  }
  if (e.target.id === 'w-import' && e.target.files[0]) {
    const file = e.target.files[0]; const text = await file.text();
    if (file.name.toLowerCase().endsWith('.md') || file.name.toLowerCase().endsWith('.markdown') || file.name.toLowerCase().endsWith('.txt')) {
      const body = $('#w-body'); body.value = text; body.dispatchEvent(new Event('input', {bubbles:true})); if (!$('#writeup-preview').hidden) updatePreview(); toast('Markdown imported into the editor.');
    }
    e.target.value = '';
  }
});

addEventListener('hashchange', () => {
  const h = location.hash.slice(1);
  if (h === 'new-writeup') { $('#app').innerHTML = V.editor(''); document.querySelectorAll('nav a').forEach(a => a.classList.toggle('on', a.dataset.r === 'writeups')); window.scrollTo(0,0); return; }
  if (h.startsWith('edit-')) { const id = h.slice(5); if (writeupsData.some(w => w.id === id)) { $('#app').innerHTML = V.editor(id); document.querySelectorAll('nav a').forEach(a => a.classList.toggle('on', a.dataset.r === 'writeups')); window.scrollTo(0,0); return; } }
  route();
});
// Initial routing also supports direct links to the editor.
if (location.hash === '#new-writeup' || location.hash.startsWith('#edit-')) {
  const h = location.hash.slice(1); $('#app').innerHTML = h === 'new-writeup' ? V.editor('') : V.editor(h.slice(5));
} else route();
