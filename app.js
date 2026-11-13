/* ===================================================================
   DORAEMON BLOG — SITE ENGINE
   You should not need to edit this file. All content lives in data.js.
   This is a read-only public site: there is no login and no way for
   visitors to add, edit or delete anything. The only way to change
   content is to edit data.js and push to GitHub.
   =================================================================== */

const $ = s => document.querySelector(s);
const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const slug = s => String(s).replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase() || "file";
document.getElementById('yr').textContent = new Date().getFullYear();

let toastTimer;
function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.style.display = 'block';
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.style.display = 'none', 3000);
}

function inline(t) {
  return t
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1">')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>');
}

// Minimal Markdown renderer: headings, lists, code fences, bold, inline code, images.
function md(s) {
  return esc(s || "").split("```").map((part, i) => {
    if (i % 2) return '<pre><code>' + part.replace(/^[^\n]*\n/, '') + '</code></pre>';
    return part.split(/\n\s*\n/).map(block => {
      block = block.trim();
      if (!block) return '';
      if (/^#{1,3} /.test(block)) return '<h3>' + inline(block.replace(/^#+ /, '')) + '</h3>';
      if (/^[-*] /.test(block)) return '<ul>' + block.split('\n').map(l => '<li>' + inline(l.replace(/^[-*] /, '')) + '</li>').join('') + '</ul>';
      return '<p>' + inline(block).replace(/\n/g, '<br>') + '</p>';
    }).join('');
  }).join('');
}

const sorted = a => a.slice().sort((x, y) => (y.date || "").localeCompare(x.date || ""));
const isImg = c => c && c.startsWith("image/");
let filter = "All";

const card = w => `<a class="card" href="#${w.id}">
  <div class="tags"><span class="tag">${esc(w.cat)}</span><span class="tag">${esc(w.diff)}</span>${w.pts ? `<span class="tag pt mono">${+w.pts} pts</span>` : ''}</div>
  <h3>${esc(w.title)}</h3><p>${esc(w.summary)}</p>
  <div class="meta mono">${esc(w.ctf)} · ${esc(w.date)}</div></a>`;

function certBadgeIcon() {
  return '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="9" r="6"/><path d="M8.5 14.2 7 21l5-2.6 5 2.6-1.5-6.8"/></svg>';
}

const certCard = c => `<div class="card cert">
  <div class="cert-head"><div class="cert-icon" style="color:var(--blue)">${certBadgeIcon()}</div><span class="cert-pill mono">${esc(c.name)}</span></div>
  <p>${esc(c.note)}</p>
  <div class="meta mono">${esc(c.issuer)} · ${esc(c.date)}${c.credId ? ' · ID ' + esc(c.credId) : ''}</div>
  ${c.fileUrl && isImg(c.fileType) ? `<img src="${esc(c.fileUrl)}" alt="${esc(c.name)} certificate">` : ''}
  <div class="bar">
    ${c.fileUrl ? `<a class="btn g s" href="${esc(c.fileUrl)}" target="_blank" rel="noopener">View</a><a class="btn g s" href="${esc(c.fileUrl)}" download>Download</a>` : ''}
    ${c.link ? `<a class="btn g s" href="${esc(c.link)}" target="_blank" rel="noopener">Verify ↗</a>` : ''}
  </div></div>`;

const empty = msg => `<div class="empty"><p>${msg}</p></div>`;

const V = {
  home() {
    const pts = WRITEUPS.reduce((a, w) => a + (+w.pts || 0), 0);
    const ctfs = new Set(WRITEUPS.map(w => w.ctf).filter(Boolean)).size;
    const learnerProfile = (ABOUT.links || []).find(
  l => l[0] === "Hack Smarter"
);
    return `<section class="hero"><div>
      <span class="pill mono">capture the flag · writeups</span>
      <h2 class="hero-title" aria-label="Every flag has a story. Here's how I got mine.">
         <span class="hero-line" data-type-line>Every flag has a <em>story</em>.</span>
         <span class="hero-line" data-type-line>Here's how I got mine.</span>
      </h2>
      <p class="lead">Writeups covering Active Directory, Web, Windows, Linux and Cloud — the bugs, the dead ends, and the flags.</p>
      <a class="btn" href="#writeups">Browse writeups</a></div>
      <div class="orb"><img src="assets/hero.jpg" alt="Hooded Doraemon hacking on a Kali laptop"></div></section>
    <h2>Latest writeups</h2>${WRITEUPS.length ? `<div class="grid writeup-list">${sorted(WRITEUPS).slice(0, 3).map(card).join('')}</div>` : empty('No writeups yet.')}
    <h2>Certifications</h2>${CERTS.length ? `<div class="grid">${sorted(CERTS).map(certCard).join('')}</div>` : empty('No certifications yet.')}`;
  },
  writeups() {
    const list = sorted(WRITEUPS).filter(w => filter === "All" || w.cat === filter);
    return `<h2>Writeups</h2>
      <div class="chips" style="margin:0 0 20px">${["All", ...CATS].map(c => `<button class="btn s ${c === filter ? '' : 'g'}" data-f="${c}">${c}</button>`).join('')}</div>
      ${list.length ? `<div class="grid writeup-list">${list.map(card).join('')}</div>` : empty(WRITEUPS.length ? 'Nothing in this category yet.' : 'No writeups yet.')}`;
  },
  certs() {
    return `<h2>Certification</h2>${CERTS.length ? `<div class="grid">${sorted(CERTS).map(certCard).join('')}</div>` : empty('No certifications yet.')}`;
  },
  whoami() {
    return `<div class="art"><img class="pfp big" src="assets/pfp.jpg" alt="Profile picture"><span class="pill mono">whoami</span>
      <h1>${esc(ABOUT.name)}</h1><p>${esc(ABOUT.bio)}</p>
      <div class="chips">${(ABOUT.links || []).map(l => `<a class="btn s" href="${esc(l[1])}" target="_blank" rel="noopener">${esc(l[0])}</a>`).join('')}</div></div>`;
  },
  post(w) {
    return `<article class="art"><a class="back mono" href="#writeups">← cd ../writeups</a>
      <div class="tags" style="margin-top:24px"><span class="tag">${esc(w.cat)}</span><span class="tag">${esc(w.diff)}</span>${w.pts ? `<span class="tag pt mono">${+w.pts} pts</span>` : ''}</div>
      <h1>${esc(w.title)}</h1><div class="meta mono">${esc(w.ctf)} · ${esc(w.date)}</div>${md(w.body)}
      ${(w.files || []).length ? `<h3>Attachments</h3><div class="bar">${w.files.map(f => `<a class="btn g s" href="${esc(f.url)}" download>${esc(f.name)}</a>`).join('')}</div>` : ''}
      <div class="bar"><button class="btn g s" data-dlw="${w.id}">Download .md</button></div></article>`;
  }
};

function route() {
  const h = location.hash.slice(1) || 'home';
  const w = WRITEUPS.find(x => x.id === h);
  $('#app').innerHTML = w ? V.post(w) : (V[h] ? V[h]() : V.home());
  document.querySelectorAll('nav a').forEach(a =>
    a.classList.toggle('on', a.dataset.r === h || (w && a.dataset.r === 'writeups')));
  window.scrollTo(0, 0);
}

document.addEventListener('click', e => {
  const t = e.target.closest('button');
  if (!t) return;
  if (t.dataset.f) { filter = t.dataset.f; route(); return; }
  if (t.dataset.dlw) {
    const w = WRITEUPS.find(x => x.id === t.dataset.dlw);
    const text = `# ${w.title}\n\n_${w.ctf} · ${w.cat} · ${w.diff} · ${w.date}_\n\n${w.body}\n`;
    const blob = new Blob([text], { type: 'text/markdown' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = slug(w.title) + '.md';
    a.click();
    URL.revokeObjectURL(a.href);
    toast('Downloaded ' + a.download);
  }
});

addEventListener('hashchange', route);
route();
