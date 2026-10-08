const menuButton = document.querySelector('.menu-toggle');
const mobileMenu = document.querySelector('.mobile-menu');
if (menuButton && mobileMenu) {
  menuButton.addEventListener('click', () => {
    const open = menuButton.getAttribute('aria-expanded') === 'true';
    menuButton.setAttribute('aria-expanded', String(!open));
    mobileMenu.classList.toggle('open', !open);
  });
  mobileMenu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
    menuButton.setAttribute('aria-expanded', 'false'); mobileMenu.classList.remove('open');
  }));
}

const observer = 'IntersectionObserver' in window ? new IntersectionObserver((entries) => {
  entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); } });
}, { threshold: .12 }) : null;
document.querySelectorAll('.reveal').forEach(el => observer ? observer.observe(el) : el.classList.add('visible'));

// Premium motion layer: restrained numerical reveals and optical parallax.
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = window.matchMedia('(pointer: fine)');

document.querySelectorAll('.service-list .reveal').forEach((item, index) => {
  item.style.setProperty('--reveal-delay', `${Math.min(index * 45, 180)}ms`);
});

const numberTargets = document.querySelectorAll('.service-index, .visit-steps li > span');
if (!reduceMotion.matches && 'IntersectionObserver' in window) {
  const numberObserver = new IntersectionObserver((entries, currentObserver) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const element = entry.target;
      const target = Number.parseInt(element.dataset.motionNumber || element.textContent, 10);
      if (!Number.isFinite(target)) return;
      element.textContent = '00';
      const start = performance.now();
      const duration = 560;
      const tick = now => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        element.textContent = String(Math.max(0, Math.round(target * eased))).padStart(2, '0');
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      currentObserver.unobserve(element);
    });
  }, { threshold: .65 });
  numberTargets.forEach(element => {
    element.dataset.motionNumber = element.textContent.trim();
    numberObserver.observe(element);
  });
}

if (!reduceMotion.matches && finePointer.matches) {
  document.querySelectorAll('.hero-visual, .why-feature').forEach(surface => {
    let frame = 0;
    const reset = () => {
      surface.style.setProperty('--parallax-x', '0px');
      surface.style.setProperty('--parallax-y', '0px');
    };
    surface.addEventListener('pointermove', event => {
      if (frame) cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const rect = surface.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width - .5) * -10;
        const y = ((event.clientY - rect.top) / rect.height - .5) * -8;
        surface.style.setProperty('--parallax-x', `${x.toFixed(2)}px`);
        surface.style.setProperty('--parallax-y', `${y.toFixed(2)}px`);
      });
    }, { passive: true });
    surface.addEventListener('pointerleave', reset, { passive: true });
  });
}

const search = document.querySelector('#price-search');
const filterButtons = document.querySelectorAll('[data-filter]');
const priceGroups = document.querySelectorAll('.price-group');
const emptyState = document.querySelector('.empty-state');
let activeFilter = 'all';

function filterPrices() {
  if (!priceGroups.length) return;
  const query = (search?.value || '').toLocaleLowerCase('ru').trim();
  let totalVisible = 0;
  priceGroups.forEach(group => {
    const categoryMatch = activeFilter === 'all' || group.dataset.category === activeFilter;
    let groupVisible = 0;
    group.querySelectorAll('.price-item').forEach(item => {
      const match = categoryMatch && item.textContent.toLocaleLowerCase('ru').includes(query);
      item.hidden = !match;
      if (match) groupVisible++;
    });
    group.hidden = groupVisible === 0;
    totalVisible += groupVisible;
  });
  if (emptyState) emptyState.hidden = totalVisible !== 0;
}
search?.addEventListener('input', filterPrices);
filterButtons.forEach(button => button.addEventListener('click', () => {
  activeFilter = button.dataset.filter;
  filterButtons.forEach(item => item.classList.toggle('active', item === button));
  filterPrices();
}));

// Required public-site utilities: accessible view, search, sitemap and quality survey.
const utility = document.createElement('div');
utility.className = 'utility-bar';
utility.innerHTML = `<div class="container utility-inner">
  <span>Официальный сайт медицинской организации</span>
  <nav aria-label="Служебная навигация">
    <button type="button" data-accessibility>Версия для слабовидящих</button>
    <button type="button" data-site-search>Поиск</button>
    <a href="legal.html#sitemap">Карта сайта</a>
    <a href="https://anketanok.minzdrav.gov.ru/" target="_blank" rel="noopener">Оценить качество ↗</a>
  </nav>
</div>`;
const siteHeader = document.querySelector('.site-header');
siteHeader?.before(utility);

const searchDialog = document.createElement('dialog');
searchDialog.className = 'search-dialog';
searchDialog.setAttribute('aria-labelledby', 'search-title');
searchDialog.innerHTML = `<div class="dialog-head"><div><p class="eyebrow">Поиск по сайту</p><h2 id="search-title">Что вы хотите найти?</h2></div><button type="button" class="dialog-close" aria-label="Закрыть поиск">×</button></div>
  <label class="dialog-search"><span>Поисковый запрос</span><input type="search" placeholder="Например, лицензия…" autocomplete="off"></label>
  <div class="search-results" aria-live="polite"></div>`;
document.body.append(searchDialog);

const siteIndex = [
  ['Услуги и направления', 'Диагностика, миопия, ночные и контактные линзы, очки', 'index.html#services'],
  ['Комплексная диагностика', 'Полное обследование зрения, контроль миопии и подбор коррекции', 'index.html#diagnostics'],
  ['Первый визит', 'Как проходит приём и как подготовиться к обследованию', 'index.html#first-visit'],
  ['Почему Академоптика', 'Подход центра, оборудование и преимущества для пациентов', 'index.html#why-us'],
  ['Специалисты', 'Врачи, квалификация, команда', 'index.html#doctors'],
  ['Вопросы и ответы', 'Подготовка к диагностике, длительность приёма и стоимость', 'index.html#faq'],
  ['Цены', 'Стоимость приёма, диагностики и коррекции', 'price.html'],
  ['Об организации', 'Реквизиты, ОГРН, ИНН, адрес, режим работы', 'legal.html#organization'],
  ['Лицензия', 'Медицинская лицензия и реестр', 'legal.html#license'],
  ['Платные медицинские услуги', 'Правила, договор и порядок оплаты', 'legal.html#paid'],
  ['Права пациентов', 'Права и обязанности граждан в сфере охраны здоровья', 'legal.html#patients'],
  ['Контролирующие органы', 'Росздравнадзор, Роспотребнадзор, Департамент здравоохранения', 'legal.html#supervisors'],
  ['СОУТ', 'Специальная оценка условий труда', 'legal.html#sout'],
  ['Персональные данные', 'Политика обработки, согласие и cookie', 'privacy.html'],
  ['Контакты', 'Телефон, почта, адрес и схема проезда', 'index.html#contacts']
];
const dialogInput = searchDialog.querySelector('input');
const dialogResults = searchDialog.querySelector('.search-results');
function renderSearch(query = '') {
  const normalized = query.toLocaleLowerCase('ru').trim();
  const results = normalized ? siteIndex.filter(item => item.join(' ').toLocaleLowerCase('ru').includes(normalized)) : siteIndex.slice(0, 6);
  dialogResults.innerHTML = results.length ? results.map(item => `<a href="${item[2]}"><strong>${item[0]}</strong><span>${item[1]}</span><b aria-hidden="true">→</b></a>`).join('') : '<p>Ничего не найдено. Попробуйте другой запрос.</p>';
}
document.querySelector('[data-site-search]')?.addEventListener('click', () => { renderSearch(); searchDialog.showModal(); dialogInput.focus(); });
searchDialog.querySelector('.dialog-close')?.addEventListener('click', () => searchDialog.close());
searchDialog.addEventListener('click', event => { if (event.target === searchDialog) searchDialog.close(); });
dialogInput.addEventListener('input', () => renderSearch(dialogInput.value));

const accessibilityButton = document.querySelector('[data-accessibility]');
const savedAccessible = localStorage.getItem('akademoptika-accessible') === 'true';
document.documentElement.classList.toggle('accessible-view', savedAccessible);
accessibilityButton?.setAttribute('aria-pressed', String(savedAccessible));
accessibilityButton?.addEventListener('click', () => {
  const enabled = !document.documentElement.classList.contains('accessible-view');
  document.documentElement.classList.toggle('accessible-view', enabled);
  accessibilityButton.setAttribute('aria-pressed', String(enabled));
  accessibilityButton.textContent = enabled ? 'Обычная версия' : 'Версия для слабовидящих';
  localStorage.setItem('akademoptika-accessible', String(enabled));
});
if (savedAccessible && accessibilityButton) accessibilityButton.textContent = 'Обычная версия';

const footer = document.querySelector('.footer');
if (footer) {
  const warning = document.createElement('div');
  warning.className = 'medical-warning';
  warning.innerHTML = '<div class="container"><strong>Имеются противопоказания.</strong> Необходима консультация специалиста.</div>';
  footer.before(warning);
  if (!document.body.classList.contains('legal-page')) {
    const inlineWarning = warning.cloneNode(true);
    inlineWarning.classList.add('medical-warning-inline');
    document.querySelector('main > section:first-child')?.after(inlineWarning);
  }
  const footerBottom = footer.querySelector('.footer-bottom');
  const legalLinks = document.createElement('span');
  legalLinks.className = 'footer-legal-links';
  legalLinks.innerHTML = '<a href="legal.html">Сведения и документы</a><a href="privacy.html">Персональные данные</a>';
  footerBottom?.append(legalLinks);
}
