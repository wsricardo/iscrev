(function () {
'use strict';

var CONFIG = Object.freeze({
  currency: Object.freeze({
    pt: Object.freeze({
      symbol: 'R$',
      locale: 'pt-BR'
    }),
    en: Object.freeze({
      symbol: 'R$',
      locale: 'en-US'
    })
  }),
  amounts: Object.freeze({
    presets: Object.freeze([5, 10, 25, 50, 100]),
    defaultValue: 10,
    min: 1,
    max: 10000
  }),
  pix: Object.freeze({
    key: 'c855694b-df4e-465a-83b7-2e368b3f0a47',
    label: 'PIX'
  })
});

var COPY = {
  pt: {
    'meta.title': 'Apoie o iScrev Notes | Projeto independente de escrita e estudo',
    'meta.description': 'Apoie o iScrev Notes via PIX e ajude a manter o projeto independente. Nesta fase, o apoio acontece em real brasileiro, com opções internacionais planejadas para o futuro.',
    'skip': 'Pular para o conteudo principal',
    'brand.sub': 'texto, fórmulas e traços em harmonia',
    'brand.aria': 'iScrev Notes página inicial',
    'nav.aria': 'Navegacao principal',
    'nav.open': 'Abrir menu',
    'nav.close': 'Fechar menu',
    'nav.lang': 'Alternar idioma',
    'nav.home': 'Início',
    'nav.about': 'Sobre',
    'nav.support': 'Apoie',
    'nav.app': 'Abrir diário',
    'hero.eyebrow': 'Apoio ao projeto',
    'hero.title_html': 'Mantenha o iScrev Notes<br>leve, independente e em evolução.',
    'hero.lead': 'Se o app te ajuda a escrever, estudar ou organizar ideias, hoje você pode apoiar o projeto via PIX. Nesta fase, preferimos um caminho simples, direto e coerente com a leveza do iScrev Notes, enquanto opções para apoiadores de outros países serão implementadas futuramente.',
    'hero.primary': 'Ver apoio via PIX',
    'hero.secondary': 'Abrir o app',
    'hero.meta.1': 'Persistência local',
    'hero.meta.2': 'Markdown e LaTeX',
    'hero.meta.3': 'Escrita à mão',
    'hero.meta.4': 'Exportação em .md e PDF',
    'panel.badge': 'apoio ao projeto',
    'panel.kicker': 'O que seu apoio mantém',
    'panel.title': 'Uma ferramenta que continua próxima do pensamento.',
    'panel.body': 'O objetivo do iScrev Notes é manter texto, fórmulas e rabiscos convivendo em uma interface confortável, simples de abrir e fácil de continuar usando.',
    'panel.list.1': 'Domínio, hospedagem e operação básica do site',
    'panel.list.2': 'Manutenção de exportação, renderização e compatibilidade',
    'panel.list.3': 'Evolução da experiência de escrita, desenho e leitura',
    'story.eyebrow': 'Por que existe esta página',
    'story.title': 'Contribuições ajudam a manter o projeto com autonomia e continuidade.',
    'story.p1': 'O iScrev Notes nasceu como um projeto independente para reunir escrita, LaTeX e traços livres no navegador sem exigir conta para o uso básico e com persistência prioritariamente local.',
    'story.p2': 'A página Support precisa refletir esse mesmo caráter: acolhedora, clara e direta. Por isso, nesta fase, ela assume um caminho único via PIX em vez de prometer meios internacionais que ainda serão implementados.',
    'trust.1.title': 'Apoio via PIX nesta fase',
    'trust.1.body': 'Hoje a página trabalha unicamente com PIX, em um fluxo direto para quem pode transferir em real brasileiro.',
    'trust.2.title': 'Transferência manual e transparente',
    'trust.2.body': 'Você escolhe um valor de referência, copia a chave e conclui a transferência no app do seu banco, sem passos escondidos.',
    'trust.3.title': 'Valores em real brasileiro',
    'trust.3.body': 'Todas as contribuições desta página são apresentadas em BRL (R$), moeda usada no PIX.',
    'trust.4.title': 'Canal para dúvidas',
    'trust.4.body_html': 'Se surgir alguma dúvida sobre o apoio atual ou sobre opções futuras, escreva para <a href="mailto:iscrev.tech@gmail.com">iscrev.tech@gmail.com</a>.',
    'donate.eyebrow': 'Formas de apoio',
    'donate.title': 'Escolha um valor e use a chave PIX com calma.',
    'donate.lead': 'No momento, o apoio é feito apenas por PIX. Você escolhe um valor sugerido ou livre, copia a chave e conclui a transferência no app do seu banco. Opções para apoiadores de fora do Brasil serão adicionadas futuramente.',
    'donate.note_html': 'Esta página não abre checkout nem processa cartão. Nesta etapa, ela oferece apenas apoio via PIX em BRL (R$). Se você está fora do Brasil ou prefere outro método, opções internacionais serão implementadas futuramente; enquanto isso, dúvidas podem ser tratadas pela <a href="contato.html">página de contato</a> ou pelo e-mail do projeto.',
    'method.1.title': 'PIX no Brasil',
    'method.1.body': 'Fluxo atual de apoio financeiro do projeto: direto, simples e alinhado à fase presente do iScrev Notes.',
    'method.2.title': 'Valor sugerido ou livre',
    'method.2.body': 'Escolha um valor pré-definido ou digite outro e use esse montante como referência ao fazer a transferência.',
    'method.3.title': 'Opções internacionais depois',
    'method.3.body': 'Doações de outros países ainda não estão disponíveis, mas fazem parte da evolução planejada desta página.',
    'card.kicker': 'Apoio via PIX',
    'card.title': 'Escolha um valor e copie a chave',
    'card.sub': 'Valores em real brasileiro',
    'label.amount': 'Valor do apoio',
    'amount.note': 'Escolha um valor sugerido ou defina outro para usar como referência no PIX.',
    'btn.custom': 'Outro valor',
    'input.placeholder': 'Digite outro valor',
    'input.aria': 'Valor personalizado',
    'summary.label': 'Valor de referência',
    'pix.note': 'Use o valor acima como referência e faça a transferência com a chave PIX abaixo. A confirmação acontece no app do seu banco.\n Cheque antes de confirmar a transferência o nome do destinario (Wandeson Ricardo da Silva CPF xxx.xxx.xxx-04).',
    'pix.keyLabel': 'Chave PIX atual',
    'pix.copy': 'Copiar chave',
    'pix.help_html': 'Se você está fora do Brasil ou prefere aguardar outro método, opções internacionais serão implementadas futuramente. Para dúvidas, escreva para <a href="mailto:iscrev.tech@gmail.com">iscrev.tech@gmail.com</a>.',
    'pix.copied': 'Chave PIX copiada.',
    'impact.eyebrow': 'Para onde vai o apoio',
    'impact.title': 'O que essa contribuição ajuda a sustentar no iScrev Notes',
    'impact.1.title': 'Infraestrutura essencial',
    'impact.1.body': 'Domínio, hospedagem, distribuição de assets e manutenção técnica das páginas públicas.',
    'impact.2.title': 'Qualidade da experiência',
    'impact.2.body': 'Ajustes na interface, polimento visual, melhorias de navegação e compatibilidade entre dispositivos.',
    'impact.3.title': 'Evolução do app',
    'impact.3.body': 'Refinamentos em exportação, escrita, fórmulas, desenho livre e estabilidade do diário principal.',
    'transparency.eyebrow': 'Clareza sobre pagamentos',
    'transparency.title': 'Uma página de apoio simples também precisa inspirar a mesma confiança que o resto do projeto.',
    'transparency.p1': 'Por isso, a versão atual da Support coloca o apoio dentro da identidade institucional do iScrev, com a mesma estrutura visual, a mesma linguagem editorial e um fluxo honesto via PIX, sem ruído entre intenção e ação.',
    'transparency.p2': 'O objetivo não é parecer uma fintech nem uma campanha genérica, mas uma continuação natural de um projeto de escrita e estudo feito com cuidado.',
    'detail.1.title': 'Operação atual',
    'detail.1.body': 'WSRicardo é o mantenedor público do projeto iScrev Notes.',
    'detail.2.title': 'Contato sobre apoio',
    'detail.2.body_html': '<a href="mailto:iscrev.tech@gmail.com">iscrev.tech@gmail.com</a>',
    'detail.3.title': 'Método atual',
    'detail.3.body': 'Fluxo único via PIX em real brasileiro.',
    'detail.4.title': 'Próximos passos',
    'detail.4.body': 'Opções para apoiadores de outros países serão implementadas futuramente.',
    'footer.title': 'Se o iScrev Notes já te ajuda hoje, o apoio ajuda a mantê-lo vivo amanhã.',
    'footer.body': 'Você pode apoiar agora via PIX, abrir o app ou entrar em contato para tratar de dúvidas sobre o projeto, privacidade ou pagamento.',
    'footer.primary': 'Abrir iScrev Notes',
    'footer.secondary': 'Falar sobre apoio',
    'footer.meta.1': 'Projeto independente',
    'footer.meta.2': 'Apoio via PIX',
    'footer.meta.3': 'Opções internacionais em desenvolvimento',
    'footer.legal_html': 'Privacidade e uso responsável: o iScrev Notes salva entradas e preferências principalmente no seu próprio navegador; veja a <a href="privacidade.html#privacidade">Política de Privacidade</a>, os <a href="privacidade.html#termos">Termos de Uso</a> e a <a href="contato.html">página de contato</a> para detalhes sobre tratamento de dados, recursos técnicos externos e canais de solicitação.'
  },
  en: {
    'meta.title': 'Support iScrev Notes | An independent writing and study project',
    'meta.description': 'Support iScrev Notes via PIX and help keep the project independent. At this stage, support happens in Brazilian reais, with international options planned for the future.',
    'skip': 'Skip to main content',
    'brand.sub': 'text, formulas and sketches in balance',
    'brand.aria': 'iScrev Notes home page',
    'nav.aria': 'Primary navigation',
    'nav.open': 'Open menu',
    'nav.close': 'Close menu',
    'nav.lang': 'Switch language',
    'nav.home': 'Home',
    'nav.about': 'About',
    'nav.support': 'Support',
    'nav.app': 'Open diary',
    'hero.eyebrow': 'Project support',
    'hero.title_html': 'Help keep iScrev Notes<br>light, independent and evolving.',
    'hero.lead': 'If the app helps you write, study or organize ideas, you can currently support the project through PIX. At this stage we are keeping the flow simple, direct and consistent with the lightweight nature of iScrev Notes, while support options for people in other countries are planned for a future update.',
    'hero.primary': 'View PIX support',
    'hero.secondary': 'Open the app',
    'hero.meta.1': 'Local-first persistence',
    'hero.meta.2': 'Markdown and LaTeX',
    'hero.meta.3': 'Handwriting',
    'hero.meta.4': 'Export to .md and PDF',
    'panel.badge': 'project support',
    'panel.kicker': 'What your support keeps alive',
    'panel.title': 'A tool that stays close to the way people think.',
    'panel.body': 'The goal of iScrev Notes is to keep text, formulas and freehand marks together inside a comfortable interface that is simple to open and easy to return to.',
    'panel.list.1': 'Domain, hosting and the site\'s baseline operation',
    'panel.list.2': 'Export, rendering and compatibility maintenance',
    'panel.list.3': 'Continued improvements to writing, drawing and reading flow',
    'story.eyebrow': 'Why this page exists',
    'story.title': 'Contributions help keep the project autonomous and ongoing.',
    'story.p1': 'iScrev Notes started as an independent project built to bring writing, LaTeX and freehand marks together in the browser without requiring an account for basic use and with local-first persistence as a priority.',
    'story.p2': 'The Support page should reflect that same character: warm, clear and direct. That is why, for now, it presents one honest PIX path instead of pretending international methods already exist.',
    'trust.1.title': 'PIX-only for now',
    'trust.1.body': 'Support is currently handled only through PIX, Brazil\'s instant payment system, for people who can transfer in Brazilian reais.',
    'trust.2.title': 'Manual and transparent transfer',
    'trust.2.body': 'You choose a reference amount, copy the key and complete the transfer in your banking app, without hidden steps.',
    'trust.3.title': 'Amounts shown in Brazilian reais',
    'trust.3.body': 'All contributions on this page are shown in BRL (R$), the currency used in PIX transfers.',
    'trust.4.title': 'Questions and payment help',
    'trust.4.body_html': 'If you have any question about the current support flow or future options, write to <a href="mailto:iscrev.tech@gmail.com">iscrev.tech@gmail.com</a>.',
    'donate.eyebrow': 'Ways to support',
    'donate.title': 'Choose an amount and use the PIX key at your own pace.',
    'donate.lead': 'For now, support is available only through PIX. You choose a suggested or custom amount, copy the key and complete the transfer in your banking app. Support options for people outside Brazil will be added later.',
    'donate.note_html': 'This page does not open a checkout or process card payments. At this stage it offers only PIX support in BRL (R$). If you are outside Brazil or prefer another method, international options will be added in a future update; until then, questions can go through the <a href="contact.html">contact page</a> or the project email.',
    'method.1.title': 'PIX in Brazil',
    'method.1.body': 'The current financial support flow for the project: direct, simple and aligned with the present stage of iScrev Notes.',
    'method.2.title': 'Preset or custom amount',
    'method.2.body': 'Choose a preset amount or enter your own and use that value as a reference when you make the transfer.',
    'method.3.title': 'International options later',
    'method.3.body': 'Support options for people in other countries are not available yet, but they are part of the planned evolution of this page.',
    'card.kicker': 'Support via PIX',
    'card.title': 'Choose an amount and copy the key',
    'card.sub': 'Amounts shown in Brazilian reais',
    'label.amount': 'Support amount',
    'amount.note': 'Choose a suggested amount or set your own to use as a reference for the PIX transfer.',
    'btn.custom': 'Custom amount',
    'input.placeholder': 'Enter another amount',
    'input.aria': 'Custom amount',
    'summary.label': 'Reference amount',
    'pix.note': 'Use the amount above as a reference and complete the transfer with the PIX key below. Confirmation happens in your banking app. \nCheck the recipients name before confirming the transfer (Wandeson Ricardo da Silva, CPF xxx.xxx.xxx-04)',
    'pix.keyLabel': 'Current PIX key',
    'pix.copy': 'Copy key',
    'pix.help_html': 'If you are outside Brazil or prefer to wait for another method, international support options will be added in a future update. If you have questions, write to <a href="mailto:iscrev.tech@gmail.com">iscrev.tech@gmail.com</a>.',
    'pix.copied': 'PIX key copied.',
    'impact.eyebrow': 'Where support goes',
    'impact.title': 'What this contribution helps sustain in iScrev Notes',
    'impact.1.title': 'Essential infrastructure',
    'impact.1.body': 'Domain, hosting, asset delivery and technical upkeep of the public pages.',
    'impact.2.title': 'Experience quality',
    'impact.2.body': 'Interface adjustments, visual polish, navigation improvements and better compatibility across devices.',
    'impact.3.title': 'App evolution',
    'impact.3.body': 'Refinements to export, writing, formulas, freehand drawing and the stability of the main diary.',
    'transparency.eyebrow': 'Payment clarity',
    'transparency.title': 'A simple support page should inspire the same trust as the rest of the project.',
    'transparency.p1': 'That is why this version keeps support inside the same institutional identity as the rest of iScrev, with the same visual structure, the same editorial tone and one honest PIX path instead of extra noise.',
    'transparency.p2': 'The goal is not to look like a fintech or a generic campaign page, but like a natural extension of a carefully made writing and study project.',
    'detail.1.title': 'Current operator',
    'detail.1.body': 'WSRicardo is the public maintainer of the iScrev Notes project.',
    'detail.2.title': 'Support contact',
    'detail.2.body_html': '<a href="mailto:iscrev.tech@gmail.com">iscrev.tech@gmail.com</a>',
    'detail.3.title': 'Current method',
    'detail.3.body': 'Single PIX flow in Brazilian reais.',
    'detail.4.title': 'Next step',
    'detail.4.body': 'Support options for people in other countries are planned for a future update.',
    'footer.title': 'If iScrev Notes already helps you today, support helps keep it alive tomorrow.',
    'footer.body': 'You can support the project via PIX now, open the app, or get in touch with questions about the project, privacy or payments.',
    'footer.primary': 'Open iScrev Notes',
    'footer.secondary': 'Talk about support',
    'footer.meta.1': 'Independent project',
    'footer.meta.2': 'Support via PIX',
    'footer.meta.3': 'International options in development',
    'footer.legal_html': 'Privacy and responsible use: iScrev Notes stores entries and preferences mainly in your own browser; see the <a href="privacy.html#privacy-policy">Privacy Policy</a>, <a href="privacy.html#terms-of-use">Terms of Use</a> and the <a href="contact.html">contact page</a> for details about data handling, external technical resources and request channels.'
  }
};

var ROUTES = {
  pt: {
    home: 'index.html',
    about: 'sobre.html',
    support: 'support.html',
    contact: 'contato.html'
  },
  en: {
    home: 'en.html',
    about: 'about.html',
    support: 'support.html?lang=en',
    contact: 'contact.html'
  }
};

var state = {
  amount: CONFIG.amounts.defaultValue,
  isCustom: false
};

function getLang() {
  var params;
  var forced;
  var navLang;

  try {
    params = new URLSearchParams(window.location.search);
    forced = params.get('lang');
    if (forced === 'pt' || forced === 'en') return forced;
  } catch (err) {}

  navLang = (navigator.language || navigator.userLanguage || 'pt-BR').toLowerCase();
  return navLang.indexOf('pt') === 0 ? 'pt' : 'en';
}

var lang = getLang();

function t(key) {
  var dict = COPY[lang] || COPY.pt;
  if (Object.prototype.hasOwnProperty.call(dict, key)) return dict[key];
  if (Object.prototype.hasOwnProperty.call(COPY.pt, key)) return COPY.pt[key];
  return key;
}

function qs(id) {
  return document.getElementById(id);
}

var dom = {
  html: document.documentElement,
  body: document.body,
  nav: document.querySelector('header nav'),
  brandLink: qs('brandLink'),
  brandSub: qs('brandSub'),
  homeLink: qs('homeLink'),
  aboutLink: qs('aboutLink'),
  supportNavLink: qs('supportNavLink'),
  appLink: qs('appLink'),
  heroSecondaryLink: qs('heroSecondaryLink'),
  footerPrimaryLink: qs('footerPrimaryLink'),
  footerSecondaryLink: qs('footerSecondaryLink'),
  langPt: qs('langPt'),
  langEn: qs('langEn'),
  amountsGrid: qs('amountsGrid'),
  customInput: qs('customInput'),
  supportCardIcon: qs('supportCardIcon'),
  currencyPrefix: qs('currencyPrefix'),
  summaryAmount: qs('summaryAmount'),
  pixKeyValue: qs('pixKeyValue'),
  copyPixButton: qs('copyPixButton'),
  copyStatus: qs('copyStatus'),
  metaDescription: qs('metaDescription'),
  canonicalLink: qs('canonicalLink'),
  ogTitle: qs('ogTitle'),
  ogDescription: qs('ogDescription'),
  ogUrl: qs('ogUrl'),
  ogLocale: qs('ogLocale'),
  ogLocaleAlternate: qs('ogLocaleAlternate'),
  twitterTitle: qs('twitterTitle'),
  twitterDescription: qs('twitterDescription')
};

function activeUrl() {
  return lang === 'en'
    ? 'https://www.iscrev.com/support.html?lang=en'
    : 'https://www.iscrev.com/support.html';
}

function currentCurrency() {
  return CONFIG.currency[lang] || CONFIG.currency.pt;
}

function formatNumber(value) {
  var locale = currentCurrency().locale;
  var hasDecimals = Math.round(value * 100) % 100 !== 0;
  return value.toLocaleString(locale, {
    minimumFractionDigits: hasDecimals ? 2 : 0,
    maximumFractionDigits: 2
  });
}

function formatAmount(value) {
  return currentCurrency().symbol + ' ' + formatNumber(value);
}

function sanitizeAmount(raw) {
  var normalized = String(raw).replace(',', '.').trim();
  var parsed = Number.parseFloat(normalized);

  if (!Number.isFinite(parsed)) return null;
  if (parsed < CONFIG.amounts.min) return CONFIG.amounts.min;
  if (parsed > CONFIG.amounts.max) return CONFIG.amounts.max;
  return Math.round(parsed * 100) / 100;
}

function applyMeta() {
  document.title = t('meta.title');
  dom.metaDescription.setAttribute('content', t('meta.description'));
  dom.ogTitle.setAttribute('content', t('meta.title'));
  dom.ogDescription.setAttribute('content', t('meta.description'));
  dom.twitterTitle.setAttribute('content', t('meta.title'));
  dom.twitterDescription.setAttribute('content', t('meta.description'));
  dom.canonicalLink.setAttribute('href', activeUrl());
  dom.ogUrl.setAttribute('content', activeUrl());
  dom.ogLocale.setAttribute('content', lang === 'en' ? 'en_US' : 'pt_BR');
  dom.ogLocaleAlternate.setAttribute('content', lang === 'en' ? 'pt_BR' : 'en_US');
}

function applyCopy() {
  var navToggle = document.querySelector('.nav-toggle');
  var langSwitcher = document.querySelector('.lang-switcher');

  dom.html.lang = lang === 'en' ? 'en' : 'pt-BR';
  dom.body.classList.toggle('page-en', lang === 'en');
  dom.body.classList.toggle('page-pt', lang !== 'en');

  document.querySelectorAll('[data-i18n]').forEach(function (node) {
    node.textContent = t(node.getAttribute('data-i18n'));
  });

  document.querySelectorAll('[data-i18n-html]').forEach(function (node) {
    node.innerHTML = t(node.getAttribute('data-i18n-html'));
  });

  dom.brandSub.textContent = t('brand.sub');
  dom.brandLink.setAttribute('aria-label', t('brand.aria'));
  dom.nav.setAttribute('aria-label', t('nav.aria'));

  if (navToggle) {
    navToggle.setAttribute('aria-label', t('nav.open'));
    navToggle.setAttribute('data-open-label', t('nav.open'));
    navToggle.setAttribute('data-close-label', t('nav.close'));
  }

  if (langSwitcher) {
    langSwitcher.setAttribute('aria-label', t('nav.lang'));
  }

  dom.customInput.setAttribute('placeholder', t('input.placeholder'));
  dom.customInput.setAttribute('aria-label', t('input.aria'));
  dom.amountsGrid.setAttribute('aria-label', t('label.amount'));
  dom.copyPixButton.setAttribute('aria-label', t('pix.copy'));
  dom.pixKeyValue.textContent = CONFIG.pix.key;
  dom.currencyPrefix.textContent = currentCurrency().symbol;
  dom.supportCardIcon.textContent = CONFIG.pix.label;
}

function applyRoutes() {
  var routes = ROUTES[lang];

  dom.brandLink.setAttribute('href', routes.home);
  dom.homeLink.setAttribute('href', routes.home);
  dom.aboutLink.setAttribute('href', routes.about);
  dom.supportNavLink.setAttribute('href', routes.support);
  dom.appLink.setAttribute('href', 'diario.html');
  dom.heroSecondaryLink.setAttribute('href', 'diario.html');
  dom.footerPrimaryLink.setAttribute('href', 'diario.html');
  dom.footerSecondaryLink.setAttribute('href', routes.contact);

  dom.langPt.classList.toggle('active', lang === 'pt');
  dom.langEn.classList.toggle('active', lang === 'en');

  if (lang === 'pt') {
    dom.langPt.setAttribute('aria-current', 'page');
    dom.langEn.removeAttribute('aria-current');
  } else {
    dom.langEn.setAttribute('aria-current', 'page');
    dom.langPt.removeAttribute('aria-current');
  }
}

function buildAmounts() {
  var fragment = document.createDocumentFragment();

  CONFIG.amounts.presets.forEach(function (amount) {
    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'support-amount-btn';
    button.textContent = formatAmount(amount);
    if (!state.isCustom && state.amount === amount) button.classList.add('active');

    button.addEventListener('click', function () {
      state.isCustom = false;
      state.amount = amount;
      dom.customInput.value = '';
      dom.copyStatus.textContent = '';
      render();
    });

    fragment.appendChild(button);
  });

  var customButton = document.createElement('button');
  customButton.type = 'button';
  customButton.className = 'support-amount-btn';
  customButton.textContent = t('btn.custom');
  if (state.isCustom) customButton.classList.add('active');

  customButton.addEventListener('click', function () {
    state.isCustom = true;
    if (!dom.customInput.value) dom.customInput.value = String(state.amount);
    dom.customInput.focus();
    render();
  });

  fragment.appendChild(customButton);
  dom.amountsGrid.innerHTML = '';
  dom.amountsGrid.appendChild(fragment);
}

function updateSummary() {
  dom.summaryAmount.textContent = formatAmount(state.amount);
}

function render() {
  buildAmounts();
  updateSummary();
}

function handleCustomInput() {
  var parsed = sanitizeAmount(dom.customInput.value);
  if (parsed === null) return;

  state.isCustom = true;
  state.amount = parsed;
  dom.copyStatus.textContent = '';
  render();
}

function copyPixKey() {
  function done() {
    dom.copyStatus.textContent = t('pix.copied');
  }

  function fallbackCopy() {
    var input = document.createElement('input');
    input.value = CONFIG.pix.key;
    document.body.appendChild(input);
    input.select();
    try {
      document.execCommand('copy');
    } catch (err) {}
    document.body.removeChild(input);
    done();
  }

  if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
    navigator.clipboard.writeText(CONFIG.pix.key).then(done).catch(fallbackCopy);
    return;
  }

  fallbackCopy();
}

function bindEvents() {
  dom.customInput.addEventListener('focus', function () {
    state.isCustom = true;
    render();
  });

  dom.customInput.addEventListener('input', handleCustomInput);
  dom.customInput.addEventListener('change', handleCustomInput);
  dom.copyPixButton.addEventListener('click', copyPixKey);
}

applyMeta();
applyCopy();
applyRoutes();
bindEvents();
render();

}());
