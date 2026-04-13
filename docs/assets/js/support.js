(function () {
'use strict';

var CONFIG = Object.freeze({
  currency: Object.freeze({
    pt: Object.freeze({
      symbol: 'R$',
      locale: 'pt-BR'
    }),
    en: Object.freeze({
      symbol: 'US$',
      locale: 'en-US'
    })
  }),
  amounts: Object.freeze({
    presets: Object.freeze([5, 10, 25, 50, 100]),
    defaultValue: 10,
    min: 1,
    max: 10000
  }),
  stripeLinks: Object.freeze({
    pt: Object.freeze({
      '5': '',
      '10': '',
      '25': '',
      '50': '',
      '100': '',
      custom: ''
    }),
    en: Object.freeze({
      '5': '',
      '10': '',
      '25': '',
      '50': '',
      '100': '',
      custom: ''
    })
  }),
  pix: Object.freeze({
    key: 'suporte@wsricardo.com.br'
  })
});

var COPY = {
  pt: {
    'meta.title': 'Apoie o iScrev Notes | Projeto independente de escrita e estudo',
    'meta.description': 'Apoie o iScrev Notes e ajude a manter o projeto independente. Contribua com cartão via Stripe ou por PIX no Brasil.',
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
    'hero.lead': 'Se o app te ajuda a escrever, estudar ou organizar ideias, sua contribuição ajuda a sustentar domínio, infraestrutura, refinamentos da interface e novas melhorias sem transformar a experiência em algo pesado ou impessoal.',
    'hero.primary': 'Escolher forma de apoio',
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
    'story.p2': 'A página Support precisa refletir exatamente esse mesmo caráter: acolhedora, clara e direta, sem parecer um checkout isolado do restante do site.',
    'trust.1.title': 'Cartão com checkout hospedado',
    'trust.1.body': 'Pagamentos por cartão seguem para uma página segura da Stripe. Os dados do cartão não passam pelos servidores do iScrev Notes.',
    'trust.2.title': 'PIX para usuários no Brasil',
    'trust.2.body': 'Quem preferir apoiar via PIX encontra uma opção direta voltada ao público brasileiro, sem esconder que se trata de um fluxo manual.',
    'trust.3.title': 'Valores em real brasileiro',
    'trust.3.body': 'Os valores desta página são mostrados em BRL (R$), inclusive para o apoio por cartão.',
    'trust.4.title': 'Canal para dúvidas',
    'trust.4.body_html': 'Se surgir alguma dúvida sobre apoio ou pagamento, escreva para <a href="mailto:iscrev.tech@gmail.com">iscrev.tech@gmail.com</a>.',
    'donate.eyebrow': 'Formas de apoio',
    'donate.title': 'Escolha o valor e o caminho que faz mais sentido para você.',
    'donate.lead': 'Stripe é o caminho principal para cartão e costuma ser a opção mais simples. PIX fica disponível como alternativa para quem está no Brasil e prefere transferência direta.',
    'donate.note_html': 'Cartões seguem por checkout hospedado da Stripe. PIX aparece como alternativa direta para o Brasil. Em qualquer um dos casos, dúvidas sobre apoio podem ser tratadas pela <a href="contato.html">página de contato</a> ou pelo e-mail do projeto.',
    'method.1.title': 'Cartão via Stripe',
    'method.1.body': 'Checkout externo, hospedado pela Stripe, adequado para uma contribuição rápida sem o site lidar com os dados do cartão.',
    'method.2.title': 'PIX no Brasil',
    'method.2.body': 'Opção direta para usuários brasileiros. Hoje a página prioriza cópia da chave PIX e transparência sobre o fluxo.',
    'method.3.title': 'Transparência primeiro',
    'method.3.body': 'A página mostra exatamente o que é automático, o que é manual e para onde seguir em caso de dúvida.',
    'card.kicker': 'Apoio rápido',
    'card.title': 'Escolha o valor e o método',
    'card.sub': 'Valores em real brasileiro',
    'label.amount': 'Valor da contribuição',
    'amount.note': 'Os valores são exibidos em BRL (R$).',
    'btn.custom': 'Outro valor',
    'input.placeholder': 'Digite um valor',
    'input.aria': 'Valor personalizado',
    'tab.group': 'Método de apoio',
    'tab.stripe': 'Cartão',
    'tab.stripe.help': 'Checkout hospedado',
    'tab.pix': 'PIX',
    'tab.pix.badge': 'Brasil',
    'tab.pix.help': 'Transferência direta',
    'summary.label': 'Você está apoiando com',
    'stripe.note': 'Você será redirecionado para o checkout seguro da Stripe. O iScrev Notes não processa nem armazena os dados do cartão.',
    'stripe.cta': 'Continuar com Stripe',
    'stripe.foot': 'Pagamento hospedado em checkout seguro.',
    'stripe.unavailable': 'Os links do checkout por cartão ainda não foram configurados nesta cópia da página.',
    'pix.note': 'PIX é uma alternativa voltada a usuários no Brasil. Use a chave abaixo no app do seu banco.',
    'pix.keyLabel': 'Chave PIX atual',
    'pix.copy': 'Copiar chave',
    'pix.help_html': 'Se quiser confirmar detalhes do apoio ou relatar algum problema, use <a href="mailto:iscrev.tech@gmail.com">iscrev.tech@gmail.com</a>.',
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
    'transparency.title': 'Uma página de apoio precisa inspirar a mesma confiança que o resto do projeto.',
    'transparency.p1': 'Por isso, a versão recomendada da Support coloca o apoio dentro da identidade institucional do iScrev, com a mesma estrutura visual, a mesma linguagem editorial e menos ruído entre intenção e ação.',
    'transparency.p2': 'O objetivo não é parecer uma fintech nem uma campanha genérica, mas uma continuação natural de um projeto de escrita e estudo feito com cuidado.',
    'detail.1.title': 'Operação atual',
    'detail.1.body': 'WSRicardo é o mantenedor público do projeto iScrev Notes.',
    'detail.2.title': 'Contato sobre apoio',
    'detail.2.body_html': '<a href="mailto:iscrev.tech@gmail.com">iscrev.tech@gmail.com</a>',
    'detail.3.title': 'Cartão',
    'detail.3.body': 'Fluxo principal via Stripe hospedado.',
    'detail.4.title': 'PIX',
    'detail.4.body': 'Alternativa manual para usuários no Brasil.',
    'success': 'A Stripe informou que o apoio foi concluído com sucesso. Muito obrigado por contribuir com o projeto.',
    'footer.title': 'Se o iScrev Notes já te ajuda hoje, o apoio ajuda a mantê-lo vivo amanhã.',
    'footer.body': 'Você pode contribuir agora, abrir o app ou entrar em contato para tratar de dúvidas sobre o projeto, privacidade ou pagamento.',
    'footer.primary': 'Abrir iScrev Notes',
    'footer.secondary': 'Falar sobre apoio',
    'footer.meta.1': 'Projeto independente',
    'footer.meta.2': 'Apoio via Stripe ou PIX',
    'footer.meta.3': 'Escrita, fórmulas e traços no mesmo espaço',
    'footer.legal_html': 'Privacidade e uso responsável: o iScrev Notes salva entradas e preferências principalmente no seu próprio navegador; veja a <a href="privacidade.html#privacidade">Política de Privacidade</a>, os <a href="privacidade.html#termos">Termos de Uso</a> e a <a href="contato.html">página de contato</a> para detalhes sobre tratamento de dados, recursos técnicos externos e canais de solicitação.'
  },
  en: {
    'meta.title': 'Support iScrev Notes | An independent writing and study project',
    'meta.description': 'Support iScrev Notes and help keep the project independent. Contribute with card via Stripe or by PIX in Brazil.',
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
    'hero.lead': 'If the app helps you write, study or organize ideas, your contribution helps sustain the domain, infrastructure, interface refinements and future improvements without turning the experience into something heavy or impersonal.',
    'hero.primary': 'Choose a support option',
    'hero.secondary': 'Open the app',
    'hero.meta.1': 'Local-first persistence',
    'hero.meta.2': 'Markdown and LaTeX',
    'hero.meta.3': 'Handwriting',
    'hero.meta.4': 'Export to .md and PDF',
    'panel.badge': 'project support',
    'panel.kicker': 'What your support keeps alive',
    'panel.title': 'A tool that stays close to the way people think.',
    'panel.body': 'The goal of iScrev Notes is to keep text, formulas and freehand marks together inside a comfortable interface that is simple to open and easy to return to.',
    'panel.list.1': "Domain, hosting and the site's baseline operation",
    'panel.list.2': 'Export, rendering and compatibility maintenance',
    'panel.list.3': 'Continued improvements to writing, drawing and reading flow',
    'story.eyebrow': 'Why this page exists',
    'story.title': 'Contributions help keep the project autonomous and ongoing.',
    'story.p1': 'iScrev Notes started as an independent project built to bring writing, LaTeX and freehand marks together in the browser without requiring an account for basic use and with local-first persistence as a priority.',
    'story.p2': 'The Support page should reflect that same character: warm, clear and direct, without feeling like a detached checkout microsite.',
    'trust.1.title': 'Card payments through hosted checkout',
    'trust.1.body': 'Card payments move to a secure Stripe page. Card details do not pass through iScrev Notes servers.',
    'trust.2.title': 'PIX for users in Brazil',
    'trust.2.body': 'Anyone who prefers PIX gets a direct option aimed at Brazilian users, without pretending the flow is more automated than it really is.',
    'trust.3.title': 'Amounts are shown in U.S. dollars',
    'trust.3.body': 'The values shown on the English interface are displayed in USD (US$).',
    'trust.4.title': 'Questions and payment help',
    'trust.4.body_html': 'If you have any question about support or payments, write to <a href="mailto:iscrev.tech@gmail.com">iscrev.tech@gmail.com</a>.',
    'donate.eyebrow': 'Ways to support',
    'donate.title': 'Choose the amount and path that fit you best.',
    'donate.lead': 'Stripe is the primary path for card payments and is usually the simplest option. PIX remains available as an alternative for people in Brazil who prefer direct transfer.',
    'donate.note_html': 'Card payments go through Stripe hosted checkout. PIX appears as a direct alternative for Brazil. In either case, questions about support can go through the <a href="contact.html">contact page</a> or the project email.',
    'method.1.title': 'Card via Stripe',
    'method.1.body': 'External checkout hosted by Stripe, well suited to a quick contribution without the site handling card details.',
    'method.2.title': 'PIX in Brazil',
    'method.2.body': 'A direct option for Brazilian users. Right now the page prioritizes copying the PIX key and being explicit about the flow.',
    'method.3.title': 'Transparency first',
    'method.3.body': 'The page shows exactly what is automatic, what is manual and where to go if something needs clarification.',
    'card.kicker': 'Quick support',
    'card.title': 'Choose the amount and method',
    'card.sub': 'Amounts shown in U.S. dollars',
    'label.amount': 'Contribution amount',
    'amount.note': 'All amounts shown on the English interface use USD (US$).',
    'btn.custom': 'Custom amount',
    'input.placeholder': 'Enter an amount',
    'input.aria': 'Custom amount',
    'tab.group': 'Support method',
    'tab.stripe': 'Card',
    'tab.stripe.help': 'Hosted checkout',
    'tab.pix': 'PIX',
    'tab.pix.badge': 'Brazil',
    'tab.pix.help': 'Direct transfer',
    'summary.label': 'You are supporting with',
    'stripe.note': 'You will be redirected to Stripe secure checkout. iScrev Notes does not process or store card details.',
    'stripe.cta': 'Continue with Stripe',
    'stripe.foot': 'Hosted payment through secure checkout.',
    'stripe.unavailable': 'Card checkout links are not configured in this copy of the page yet.',
    'pix.note': 'PIX is an option aimed at users in Brazil. Use the key below in your banking app.',
    'pix.keyLabel': 'Current PIX key',
    'pix.copy': 'Copy key',
    'pix.help_html': 'If you want to confirm support details or report an issue, use <a href="mailto:iscrev.tech@gmail.com">iscrev.tech@gmail.com</a>.',
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
    'transparency.title': 'A support page should inspire the same trust as the rest of the project.',
    'transparency.p1': 'That is why this recommended version places support inside the same institutional identity as the rest of iScrev, with the same visual structure, the same editorial tone and less friction between intent and action.',
    'transparency.p2': 'The goal is not to look like a fintech or a generic campaign page, but like a natural extension of a carefully made writing and study project.',
    'detail.1.title': 'Current operator',
    'detail.1.body': 'WSRicardo is the public maintainer of the iScrev Notes project.',
    'detail.2.title': 'Support contact',
    'detail.2.body_html': '<a href="mailto:iscrev.tech@gmail.com">iscrev.tech@gmail.com</a>',
    'detail.3.title': 'Card payments',
    'detail.3.body': 'Primary flow through Stripe hosted checkout.',
    'detail.4.title': 'PIX',
    'detail.4.body': 'Manual alternative for users in Brazil.',
    'success': 'Stripe reported that your support was completed successfully. Thank you very much for contributing to the project.',
    'footer.title': 'If iScrev Notes already helps you today, support helps keep it alive tomorrow.',
    'footer.body': 'You can contribute now, open the app, or get in touch about the project, privacy or payment-related questions.',
    'footer.primary': 'Open iScrev Notes',
    'footer.secondary': 'Talk about support',
    'footer.meta.1': 'Independent project',
    'footer.meta.2': 'Support via Stripe or PIX',
    'footer.meta.3': 'Writing, formulas and sketches in one place',
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
  isCustom: false,
  method: 'stripe'
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
  supportTabs: qs('supportTabs'),
  customInput: qs('customInput'),
  supportCardIcon: qs('supportCardIcon'),
  currencyPrefix: qs('currencyPrefix'),
  tabStripe: qs('tabStripe'),
  tabPix: qs('tabPix'),
  panelStripe: qs('panelStripe'),
  panelPix: qs('panelPix'),
  summaryAmount: qs('summaryAmount'),
  stripeButton: qs('stripeButton'),
  stripeFootnote: qs('stripeFootnote'),
  pixKeyValue: qs('pixKeyValue'),
  copyPixButton: qs('copyPixButton'),
  copyStatus: qs('copyStatus'),
  successBanner: qs('successBanner'),
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

function getStripeLink() {
  var links = CONFIG.stripeLinks[lang] || CONFIG.stripeLinks.pt;
  return state.isCustom
    ? links.custom
    : (links[String(state.amount)] || '');
}

function isConfigured(link) {
  return typeof link === 'string'
    && link.indexOf('https://buy.stripe.com/') === 0
    && link.length > 'https://buy.stripe.com/'.length;
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
  dom.supportTabs.setAttribute('aria-label', t('tab.group'));
  dom.copyPixButton.setAttribute('aria-label', t('pix.copy'));
  dom.pixKeyValue.textContent = CONFIG.pix.key;
  dom.currencyPrefix.textContent = currentCurrency().symbol;
  dom.supportCardIcon.textContent = currentCurrency().symbol;
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

function setMethod(method) {
  state.method = method === 'pix' ? 'pix' : 'stripe';
  render();
}

function updateMethodPanels() {
  var stripeActive = state.method === 'stripe';

  dom.tabStripe.classList.toggle('active', stripeActive);
  dom.tabStripe.setAttribute('aria-selected', stripeActive ? 'true' : 'false');
  dom.tabPix.classList.toggle('active', !stripeActive);
  dom.tabPix.setAttribute('aria-selected', stripeActive ? 'false' : 'true');
  dom.panelStripe.classList.toggle('active', stripeActive);
  dom.panelPix.classList.toggle('active', !stripeActive);
}

function updateStripeButton() {
  var link = getStripeLink();
  var configured = isConfigured(link);

  dom.stripeButton.textContent = t('stripe.cta');

  if (configured) {
    dom.stripeButton.setAttribute('href', link);
    dom.stripeButton.removeAttribute('aria-disabled');
    dom.stripeButton.classList.remove('support-button-disabled');
    dom.stripeFootnote.textContent = t('stripe.foot');
  } else {
    dom.stripeButton.setAttribute('href', '#support-options');
    dom.stripeButton.setAttribute('aria-disabled', 'true');
    dom.stripeButton.classList.add('support-button-disabled');
    dom.stripeFootnote.textContent = t('stripe.unavailable');
  }
}

function updateSummary() {
  dom.summaryAmount.textContent = formatAmount(state.amount);
}

function render() {
  buildAmounts();
  updateMethodPanels();
  updateSummary();
  updateStripeButton();
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

function showSuccessState() {
  var params;

  try {
    params = new URLSearchParams(window.location.search);
  } catch (err) {
    return;
  }

  if (params.get('redirect_status') === 'succeeded') {
    dom.successBanner.hidden = false;
    dom.successBanner.textContent = t('success');
  } else {
    dom.successBanner.hidden = true;
  }
}

function bindEvents() {
  dom.customInput.addEventListener('focus', function () {
    state.isCustom = true;
    render();
  });

  dom.customInput.addEventListener('input', handleCustomInput);
  dom.customInput.addEventListener('change', handleCustomInput);
  dom.tabStripe.addEventListener('click', function () { setMethod('stripe'); });
  dom.tabPix.addEventListener('click', function () { setMethod('pix'); });
  dom.copyPixButton.addEventListener('click', copyPixKey);
}

applyMeta();
applyCopy();
applyRoutes();
bindEvents();
render();
showSuccessState();

}());
