const docs = document.getElementById('docs');
const forms = document.getElementById('forms');
const cat = document.getElementById('cat');
const typeFilter = document.getElementById('typeFilter');
const find = document.getElementById('find');
const globalSearch = document.getElementById('global');

function normalize(text) {
  return String(text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/\s+/g, ' ')
    .trim();
}

function card(x) {
  return `
    <article class="card">
      <div class="meta">
        <span class="tag">${x.category}</span>
        <span class="filetype">${x.type}</span>
      </div>

      <h3>${x.name}</h3>

      <p>${x.description || ''}</p>

      <a class="link" href="${x.file}" download>
        📥 Tải xuống
      </a>
    </article>
  `;
}

function render(q = '') {
  const keyword = normalize(q);

  const result = documents.filter(x => {

    const categoryOK =
      !cat.value || x.category === cat.value;

    const typeOK =
      !typeFilter.value || x.type === typeFilter.value;

    const text = normalize(
      `${x.name} ${x.description || ''} ${x.category} ${x.type}`
    );

    const keywordOK =
      !keyword || text.includes(keyword);

    return categoryOK && typeOK && keywordOK;
  });

  docs.innerHTML = result.length
    ? result.map(card).join('')
    : `
      <article class="card">
        <h3>Không tìm thấy</h3>
        <p>Hãy thử từ khóa khác hoặc chọn lại bộ lọc.</p>
      </article>
    `;
}

function renderForms() {
  if (!forms) return;

  const result = documents.filter(
    x => x.type === 'Biểu mẫu'
  );

  forms.innerHTML = result.map((x, i) => `
    <div>
      <b>${String(i + 1).padStart(2, '0')}</b>

      <span>
        <strong>${x.name}</strong>
        <small>
          ${x.category} • ${x.description || ''}
        </small>
      </span>

      <a href="${x.file}" download>
        📥 Tải Word
      </a>
    </div>
  `).join('');
}

function searchNow(keyword) {
  globalSearch.value = keyword;
  find.value = keyword;

  render(keyword);

  document
    .getElementById('van-ban')
    .scrollIntoView({
      behavior: 'smooth'
    });
}

function quick(keyword) {
  cat.value = '';
  typeFilter.value = '';

  searchNow(keyword);
}

function goSearch() {
  cat.value = '';
  typeFilter.value = '';

  searchNow(globalSearch.value);
}

if (cat) {
  cat.addEventListener('change', () => {
    render(find.value);
  });
}

if (typeFilter) {
  typeFilter.addEventListener('change', () => {
    render(find.value);
  });
}

if (find) {
  find.addEventListener('input', () => {
    render(find.value);
  });
}

function calculate() {
  const input = document.getElementById('calc');

  const out = document.getElementById('calcout');

  const s = input.value
    .replace(/,/g, '')
    .replace(/\s/g, '');

  if (!s || !/^[0-9+\-*/().]+$/.test(s)) {
    out.textContent = 'Biểu thức không hợp lệ';
    return;
  }

  try {
    const value =
      Function('"use strict"; return (' + s + ')')();

    out.textContent =
      new Intl.NumberFormat('vi-VN')
        .format(value) + ' đồng';

  } catch {
    out.textContent = 'Biểu thức không hợp lệ';
  }
}

const one = [
  '',
  'một',
  'hai',
  'ba',
  'bốn',
  'năm',
  'sáu',
  'bảy',
  'tám',
  'chín'
];

function read3(n) {

  const h = Math.floor(n / 100);

  const t =
    Math.floor(n / 10) % 10;

  const u = n % 10;

  let s = h
    ? one[h] + ' trăm'
    : '';

  if (t) {

    s +=
      (s ? ' ' : '') +
      (t === 1
        ? 'mười'
        : one[t] + ' mươi');

    if (u === 1 && t > 1) {
      s += ' mốt';
    }

    else if (u === 5 && t) {
      s += ' lăm';
    }

    else if (u) {
      s += ' ' + one[u];
    }

  }

  else if (u) {

    s += h
      ? ' linh ' + one[u]
      : one[u];

  }

  return s.trim();
}

function money() {

  const raw =
    document
      .getElementById('money')
      .value
      .replace(/\D/g, '');

  const out =
    document.getElementById('moneyout');

  let n = Number(raw);

  if (!raw || !Number.isSafeInteger(n)) {

    out.textContent =
      'Hãy nhập số tiền hợp lệ';

    return;
  }

  if (n === 0) {

    out.textContent =
      'Không đồng';

    return;
  }

  const units = [
    '',
    'nghìn',
    'triệu',
    'tỷ'
  ];

  const parts = [];

  let i = 0;

  while (n > 0) {

    const group = n % 1000;

    if (group) {

      parts.unshift(
        read3(group) +
        (units[i]
          ? ' ' + units[i]
          : '')
      );
    }

    n = Math.floor(n / 1000);

    i++;
  }

  out.textContent =
    parts.join(' ') + ' đồng';
}

const today =
  document.getElementById('today');

if (today) {

  today.textContent =
    new Date().toLocaleDateString(
      'vi-VN',
      {
        weekday: 'long',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }
    );
}

const year =
  document.getElementById('year');

if (year) {
  year.textContent =
    new Date().getFullYear();
}

const menu =
  document.getElementById('menu');

if (menu) {

  menu.onclick = () => {

    document
      .getElementById('nav')
      .classList.toggle('open');

  };
}

render();
renderForms();
