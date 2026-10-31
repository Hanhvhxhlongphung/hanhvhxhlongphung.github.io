const docs = document.getElementById('docs');
const forms = document.getElementById('forms');
const cat = document.getElementById('cat');
const typeFilter = document.getElementById('typeFilter');
const find = document.getElementById('find');
const globalSearch = document.getElementById('global');

function normalize(text) {
  return String(text || '').toLowerCase().normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd')
    .replace(/\s+/g, ' ').trim();
}
function escapeHTML(value) {
  return String(value ?? '').replace(/[&<>"']/g, ch => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[ch]));
}
function safeFileUrl(value) {
  const raw = String(value || '').trim();
  if (!raw || /^(javascript|data|vbscript):/i.test(raw)) return '#';
  return raw.replace(/"/g, '%22');
}
function fileLabel(file) {
  const ext = String(file || '').split('.').pop().toUpperCase();
  return ['DOC','DOCX','XLS','XLSX','PDF'].includes(ext) ? ext : (ext || 'TỆP');
}
function card(x) {
  const url = safeFileUrl(x.file);
  return `<article class="document-card">
    <div class="doc-meta"><span class="tag">${escapeHTML(x.category)}</span><span class="filetype">${escapeHTML(x.type)} · ${escapeHTML(fileLabel(x.file))}</span></div>
    <h3>${escapeHTML(x.name)}</h3>
    <p class="doc-description">${escapeHTML(x.description || 'Chưa có mô tả tài liệu.')}</p>
    <a class="download-link" href="${url}" download>↓ Tải tài liệu</a>
  </article>`;
}
function render(q = '') {
  if (!docs) return;
  const keyword = normalize(q);
  const source = Array.isArray(window.libraryDocuments) ? window.libraryDocuments : (Array.isArray(window.libraryDocuments) ? window.libraryDocuments : (Array.isArray(documents) ? documents : []));
  const result = source.filter(x => {
    const categoryOK = !cat?.value || x.category === cat.value;
    const typeOK = !typeFilter?.value || x.type === typeFilter.value;
    const text = normalize([x.name, x.description, x.category, x.type].join(' '));
    return categoryOK && typeOK && (!keyword || text.includes(keyword));
  });
  docs.innerHTML = result.length ? result.map(card).join('') :
    '<div class="empty-state">Không tìm thấy tài liệu phù hợp. Hãy thử từ khóa hoặc bộ lọc khác.</div>';
  const count = document.getElementById('resultCount');
  if (count) count.textContent = 'Tìm thấy ' + result.length + ' tài liệu';
}
function renderForms() {
  if (!forms) return;
  const result = (Array.isArray(window.libraryDocuments) ? window.libraryDocuments : (Array.isArray(documents) ? documents : [])).filter(x => x.type === 'Biểu mẫu');
  forms.innerHTML = result.length ? result.map((x, i) => `
    <div class="form-row">
      <span class="form-number">${String(i + 1).padStart(2, '0')}</span>
      <span class="form-info"><strong>${escapeHTML(x.name)}</strong><small>${escapeHTML(x.category)} · ${escapeHTML(x.description || '')}</small></span>
      <a class="form-download" href="${safeFileUrl(x.file)}" download>↓ Tải ${escapeHTML(fileLabel(x.file))}</a>
    </div>`).join('') : '<div class="empty-state">Chưa có biểu mẫu trong thư viện.</div>';
}
function renderRecent() {
  const host = document.getElementById('recentDocs');
  if (!host) return;
  const source = (Array.isArray(window.libraryDocuments) ? window.libraryDocuments : (Array.isArray(documents) ? documents : [])).slice(0, 3);
  host.innerHTML = source.length ? source.map(x => `
    <article class="recent-card"><div class="doc-meta"><span class="tag">${escapeHTML(x.category)}</span><span class="filetype">${escapeHTML(x.type)}</span></div>
    <h3>${escapeHTML(x.name)}</h3><p>${escapeHTML(x.description || '')}</p>
    <a class="download-link" href="${safeFileUrl(x.file)}" download>↓ Tải tài liệu</a></article>`).join('') :
    '<div class="empty-state">Chưa có tài liệu. Hãy bổ sung dữ liệu vào data.js.</div>';
}
function updateStats() {
  const source = Array.isArray(window.libraryDocuments) ? window.libraryDocuments : (Array.isArray(window.libraryDocuments) ? window.libraryDocuments : (Array.isArray(documents) ? documents : []));
  const total = source.length;
  const formTotal = source.filter(x => x.type === 'Biểu mẫu').length;
  const docTotal = source.filter(x => x.type === 'Văn bản').length;
  const categories = new Set(source.map(x => x.category).filter(Boolean)).size;
  const set = (id, value) => { const el = document.getElementById(id); if (el) el.textContent = String(value).padStart(2, '0'); };
  ['totalCount','navDocCount','reportTotal'].forEach(id => set(id, total));
  set('formCount', formTotal); set('categoryCount', categories);
  set('reportDocs', docTotal); set('reportForms', formTotal); set('reportCats', categories);
}
function searchNow(keyword) {
  if (globalSearch) globalSearch.value = keyword;
  if (find) find.value = keyword;
  if (cat) cat.value = '';
  if (typeFilter) typeFilter.value = '';
  render(keyword);
  document.getElementById('van-ban')?.scrollIntoView({behavior:'smooth'});
}
function quick(keyword) { searchNow(keyword); }
function goSearch() { searchNow(globalSearch?.value || ''); }
window.quick = quick;
window.goSearch = goSearch;
cat?.addEventListener('change', () => render(find?.value || ''));
typeFilter?.addEventListener('change', () => render(find?.value || ''));
find?.addEventListener('input', () => render(find.value));
globalSearch?.addEventListener('keydown', e => { if (e.key === 'Enter') goSearch(); });

function calculate() {
  const input = document.getElementById('calc');
  const out = document.getElementById('calcout');
  const s = (input?.value || '').replace(/,/g, '').replace(/\s/g, '');
  if (!s || !/^[0-9+\-*/().]+$/.test(s)) { out.textContent = 'Biểu thức không hợp lệ'; return; }
  try {
    // Chỉ nhận biểu thức số học gồm chữ số và toán tử cơ bản.
    const tokens = s.match(/\d+(?:\.\d+)?|[()+\-*/]/g) || [];
    if (tokens.join('') !== s) throw new Error('invalid');
    let pos = 0;
    function expression() {
      let value = term();
      while (tokens[pos] === '+' || tokens[pos] === '-') {
        const op = tokens[pos++], rhs = term();
        value = op === '+' ? value + rhs : value - rhs;
      }
      return value;
    }
    function term() {
      let value = factor();
      while (tokens[pos] === '*' || tokens[pos] === '/') {
        const op = tokens[pos++], rhs = factor();
        if (op === '/' && rhs === 0) throw new Error('zero');
        value = op === '*' ? value * rhs : value / rhs;
      }
      return value;
    }
    function factor() {
      if (tokens[pos] === '+') { pos++; return factor(); }
      if (tokens[pos] === '-') { pos++; return -factor(); }
      if (tokens[pos] === '(') {
        pos++; const value = expression();
        if (tokens[pos++] !== ')') throw new Error('paren');
        return value;
      }
      const token = tokens[pos++];
      if (!token || !/^\d+(?:\.\d+)?$/.test(token)) throw new Error('number');
      return Number(token);
    }
    const value = expression();
    if (pos !== tokens.length || !Number.isFinite(value)) throw new Error('invalid');
    out.textContent = new Intl.NumberFormat('vi-VN', {maximumFractionDigits: 6}).format(value) + ' đồng';
  } catch { out.textContent = 'Biểu thức không hợp lệ hoặc phép chia cho 0'; }
}
window.calculate = calculate;

const one = ['', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];
function read3(n) {
  const h = Math.floor(n / 100), t = Math.floor(n / 10) % 10, u = n % 10;
  let s = h ? one[h] + ' trăm' : '';
  if (t) {
    s += (s ? ' ' : '') + (t === 1 ? 'mười' : one[t] + ' mươi');
    if (u === 1 && t > 1) s += ' mốt';
    else if (u === 5) s += ' lăm';
    else if (u) s += ' ' + one[u];
  } else if (u) s += h ? ' linh ' + one[u] : one[u];
  return s.trim();
}
function money() {
  const raw = (document.getElementById('money')?.value || '').replace(/\D/g, '');
  const out = document.getElementById('moneyout');
  if (!raw || !Number.isSafeInteger(Number(raw))) { out.textContent = 'Hãy nhập số tiền hợp lệ'; return; }
  let n = Number(raw);
  if (n === 0) { out.textContent = 'Không đồng'; return; }
  const units = ['', 'nghìn', 'triệu', 'tỷ', 'nghìn tỷ', 'triệu tỷ'];
  const parts = []; let i = 0;
  while (n > 0 && i < units.length) {
    const group = n % 1000;
    if (group) parts.unshift(read3(group) + (units[i] ? ' ' + units[i] : ''));
    n = Math.floor(n / 1000); i++;
  }
  if (n > 0) { out.textContent = 'Số tiền vượt phạm vi hỗ trợ'; return; }
  out.textContent = parts.join(' ') + ' đồng';
}
window.money = money;

function updateDate() {
  const now = new Date();
  const opts = {weekday:'long', day:'2-digit', month:'2-digit', year:'numeric', timeZone:'Asia/Ho_Chi_Minh'};
  const long = now.toLocaleDateString('vi-VN', opts);
  ['today','todayLong','todayTool'].forEach(id => { const el = document.getElementById(id); if (el) el.textContent = long; });
  const year = document.getElementById('year'); if (year) year.textContent = now.getFullYear();
}
function setupNavigation() {
  const sidebar = document.getElementById('sidebar');
  const menu = document.getElementById('menu');
  const overlay = document.getElementById('mobileOverlay');
  const close = () => { sidebar?.classList.remove('open'); overlay?.classList.remove('show'); menu?.setAttribute('aria-expanded','false'); };
  menu?.addEventListener('click', () => {
    const open = sidebar?.classList.toggle('open');
    overlay?.classList.toggle('show', !!open);
    menu.setAttribute('aria-expanded', String(!!open));
  });
  overlay?.addEventListener('click', close);
  document.querySelectorAll('.nav-link[href^="#"]').forEach(link => link.addEventListener('click', () => {
    const target = link.dataset.section;
    document.querySelectorAll('.nav-link').forEach(x => x.classList.toggle('active', x === link));
    const title = link.querySelector('span:nth-child(2)')?.textContent || 'Tổng quan';
    const current = document.getElementById('currentPage'); if (current) current.textContent = title;
    close();
  }));
  document.querySelectorAll('.nav-link[href^="#"]').forEach(link => {
    link.addEventListener('click', () => {
      const target = document.querySelector(link.getAttribute('href'));
      if (target) target.scrollIntoView({behavior:'smooth'});
    });
  });
}
updateStats();
render();
renderForms();
renderRecent();
updateDate();
setupNavigation();

// Firebase integration: when Firestore returns published records, refresh the legacy UI.
window.addEventListener('library-data-updated', event => {
  if (!Array.isArray(event.detail?.documents)) return;
  window.libraryDocuments = event.detail.documents;
  updateStats();
  render(find?.value || globalSearch?.value || '');
  renderForms();
  renderRecent();
});
