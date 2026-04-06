# iScrev Notes — Guia Completo de SEO, Acessibilidade e Google AdSense

> **Objetivo:** fazer o iScrev Notes aparecer bem posicionado em mecanismos de busca, cumprir os requisitos de acessibilidade WCAG 2.2 e estar apto para aprovação no Google AdSense.  
> **Stack:** HTML5 estático · CSS3 · JS ES5 · zero frameworks  
> **Data:** março de 2026

---

## Sumário

1. [Como o Google Avalia um Site](#1-como-o-google-avalia-um-site)
2. [SEO Técnico — Fundação](#2-seo-técnico--fundação)
3. [SEO On-page — Conteúdo e Estrutura](#3-seo-on-page--conteúdo-e-estrutura)
4. [Core Web Vitals — Performance que o Google Mede](#4-core-web-vitals--performance-que-o-google-mede)
5. [Dados Estruturados (JSON-LD)](#5-dados-estruturados-json-ld)
6. [Internacionalização e Hreflang](#6-internacionalização-e-hreflang)
7. [Acessibilidade WCAG 2.2](#7-acessibilidade-wcag-22)
8. [Requisitos do Google AdSense](#8-requisitos-do-google-adsense)
9. [Infraestrutura e Domínio](#9-infraestrutura-e-domínio)
10. [Plano de Ação Priorizado](#10-plano-de-ação-priorizado)
11. [Ferramentas de Diagnóstico e Monitoramento](#11-ferramentas-de-diagnóstico-e-monitoramento)
12. [Referências Oficiais](#12-referências-oficiais)

---

## 1. Como o Google Avalia um Site

Antes de implementar qualquer coisa, é essencial entender o modelo mental do Google. O algoritmo avalia três dimensões de forma simultânea:

```
┌─────────────────────────────────────────────┐
│              COMO O GOOGLE DECIDE            │
│                                             │
│   RELEVÂNCIA          AUTORIDADE            │
│   (conteúdo)          (reputação)           │
│   • palavras-chave    • links externos      │
│   • estrutura HTML    • tempo no domínio    │
│   • meta tags         • menções na web      │
│                                             │
│              EXPERIÊNCIA                    │
│              (Core Web Vitals)              │
│              • velocidade                   │
│              • estabilidade visual          │
│              • interatividade               │
└─────────────────────────────────────────────┘
```

Para o iScrev Notes — um projeto novo — a estratégia é:

1. **Maximizar relevância** com conteúdo bem estruturado e palavras-chave corretas.
2. **Garantir experiência excelente** com performance e acessibilidade.
3. **Construir autoridade** com o tempo, via conteúdo consistente.

---

## 2. SEO Técnico — Fundação

### 2.1 `<head>` Completo para Cada Página

O `<head>` atual está incompleto. Abaixo está o bloco completo que cada página precisa ter:

```html
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <!-- ── Título e descrição ──────────────────────────────────────── -->
  <!-- Título: 50–60 caracteres. Palavra-chave principal no início. -->
  <title>iScrev Notes | Diário digital com LaTeX e caneta manuscrita</title>

  <!-- Descrição: 140–160 caracteres. Deve conter CTA implícito. -->
  <meta name="description"
        content="Escreva, calcule e rabisque no mesmo lugar. iScrev Notes é um diário digital gratuito com Markdown, LaTeX e anotações manuscritas. Funciona no browser, sem instalação.">

  <!-- ── Canônica: evita conteúdo duplicado ─────────────────────── -->
  <link rel="canonical" href="https://seudominio.com/">

  <!-- ── Open Graph (Facebook, WhatsApp, LinkedIn) ──────────────── -->
  <meta property="og:type"        content="website">
  <meta property="og:url"         content="https://seudominio.com/">
  <meta property="og:title"       content="iScrev Notes | Diário digital com LaTeX e caneta">
  <meta property="og:description" content="Escreva, calcule e rabisque no mesmo lugar. Grátis, sem instalação.">
  <meta property="og:image"       content="https://seudominio.com/assets/img/og-cover.jpg">
  <meta property="og:image:width"  content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:locale"       content="pt_BR">
  <meta property="og:site_name"    content="iScrev Notes">

  <!-- ── Twitter/X Card ────────────────────────────────────────── -->
  <meta name="twitter:card"        content="summary_large_image">
  <meta name="twitter:site"        content="@seuarroba">
  <meta name="twitter:title"       content="iScrev Notes | Diário digital com LaTeX">
  <meta name="twitter:description" content="Escreva, calcule e rabisque no mesmo lugar.">
  <meta name="twitter:image"       content="https://seudominio.com/assets/img/og-cover.jpg">

  <!-- ── Hreflang: indica versões por idioma ───────────────────── -->
  <link rel="alternate" hreflang="pt-BR" href="https://seudominio.com/">
  <link rel="alternate" hreflang="en"    href="https://seudominio.com/en.html">
  <link rel="alternate" hreflang="x-default" href="https://seudominio.com/">

  <!-- ── Favicon completo ──────────────────────────────────────── -->
  <link rel="icon"             href="/favicon.ico" sizes="any">
  <link rel="icon"             href="/assets/img/icon.svg" type="image/svg+xml">
  <link rel="apple-touch-icon" href="/assets/img/apple-touch-icon.png">
  <link rel="manifest"         href="/manifest.json">

  <!-- ── Cor do tema (browser mobile) ─────────────────────────── -->
  <meta name="theme-color" content="#c8843a">

  <!-- ── Robots ────────────────────────────────────────────────── -->
  <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large">

  <!-- ── Dados estruturados ────────────────────────────────────── -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "iScrev Notes",
    "url": "https://www.iscrev.com/diario.html",
    "description": "Diário digital com Markdown, LaTeX e anotações manuscritas",
    "applicationCategory": "ProductivityApplication",
    "operatingSystem": "Web",
    "browserRequirements": "Requires JavaScript",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "BRL"
    },
    "author": {
      "@type": "Person",
      "name": "Wandeson Ricardo", 
      "url": "https://www.wsricardo.com.br"
    }
  }
  </script>

  <!-- ── Fontes com preconnect ─────────────────────────────────── -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="preload" as="style"
        href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Dancing+Script:wght@700&display=swap">
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Lora:ital,wght@0,400;0,500;1,400&family=Dancing+Script:wght@600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">

  <link rel="stylesheet" href="assets/css/style.css">
</head>
```

---

### 2.2 Criação da Imagem OG (Open Graph)

A imagem `og-cover.jpg` é exibida quando o link é compartilhado no WhatsApp, Twitter, LinkedIn ou Facebook. Ela determina se alguém vai clicar.

**Especificações obrigatórias:**

| Propriedade | Valor |
|-------------|-------|
| Dimensões | 1200 × 630 px |
| Formato | JPEG (melhor compressão) ou PNG |
| Tamanho máximo | 300 KB |
| Texto na imagem | Máximo 20% da área |
| Safe zone | 50px de margem em todos os lados |

**Conteúdo sugerido para a imagem:**

```
┌─────────────────────────────────────────────────────────────┐
│                                              [logotipo]     │
│                                                             │
│   iScrev Notes                                              │
│   Diário digital com LaTeX e caneta                         │
│                                                             │
│   ┌──────────────────┐                                      │
│   │ ✏  Editar        │  Markdown · LaTeX · Caneta           │
│   │ ✒  Caneta        │  Gratuito · No browser               │
│   │ 👁  Preview       │                                      │
│   └──────────────────┘                                      │
│                                                             │
│   seudominio.com                                            │
└─────────────────────────────────────────────────────────────┘ 
```

Ferramentas gratuitas para criar: **Figma** (figma.com), **Canva** ou **GIMP**.

---

### 2.3 Favicon Completo

Um favicon completo é necessário para credibilidade e para aparecer bem no Google:

```
assets/img/
├── favicon.ico          ← 16×16 e 32×32 multiplex (gerado por realfavicongenerator.net)
├── icon.svg             ← versão vetorial (suportada em browsers modernos)
├── apple-touch-icon.png ← 180×180 px (iOS)
├── icon-192.png         ← 192×192 px (Android PWA)
├── icon-512.png         ← 512×512 px (Android PWA splash)
└── og-cover.jpg         ← 1200×630 px (Open Graph)
```

Ferramenta gratuita para gerar todos os tamanhos de uma vez: https://realfavicongenerator.net

---

### 2.4 Arquivo `robots.txt`

Crie na raiz do domínio:

```
# robots.txt — iScrev Notes
# https://seudominio.com/robots.txt

User-agent: *
Allow: /

# Não indexar o app em si (conteúdo dinâmico do usuário, sem valor de SEO)
Disallow: /diario.html

# Não indexar arquivos JS/CSS (economia de crawl budget)
Disallow: /assets/js/
Disallow: /assets/css/

# Sitemap
Sitemap: https://seudominio.com/sitemap.xml
```

> **Por que `Disallow` no `diario.html`?** O app exibe conteúdo dinâmico do usuário armazenado localmente — o Google não verá nenhum conteúdo relevante lá. Indexar uma página vazia prejudica o Score.

---

### 2.5 Arquivo `sitemap.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">

  <!-- Home PT -->
  <url>
    <loc>https://seudominio.com/</loc>
    <xhtml:link rel="alternate" hreflang="pt-BR" href="https://seudominio.com/"/>
    <xhtml:link rel="alternate" hreflang="en"    href="https://seudominio.com/en.html"/>
    <lastmod>2026-03-01</lastmod>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>

  <!-- Sobre PT -->
  <url>
    <loc>https://seudominio.com/sobre.html</loc>
    <xhtml:link rel="alternate" hreflang="pt-BR" href="https://seudominio.com/sobre.html"/>
    <xhtml:link rel="alternate" hreflang="en"    href="https://seudominio.com/about.html"/>
    <lastmod>2026-03-01</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>

  <!-- Home EN -->
  <url>
    <loc>https://seudominio.com/en.html</loc>
    <xhtml:link rel="alternate" hreflang="en"    href="https://seudominio.com/en.html"/>
    <xhtml:link rel="alternate" hreflang="pt-BR" href="https://seudominio.com/"/>
    <lastmod>2026-03-01</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>

  <!-- About EN -->
  <url>
    <loc>https://seudominio.com/about.html</loc>
    <xhtml:link rel="alternate" hreflang="en"    href="https://seudominio.com/about.html"/>
    <xhtml:link rel="alternate" hreflang="pt-BR" href="https://seudominio.com/sobre.html"/>
    <lastmod>2026-03-01</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>

</urlset>
```

Depois de criar, submeter no **Google Search Console** → Sitemaps.

---

### 2.6 Web App Manifest (PWA básico)

O `manifest.json` melhora a experiência mobile e dá sinais de credibilidade ao Google:

```json
{
  "name": "iScrev Notes",
  "short_name": "iScrev",
  "description": "Diário digital com Markdown, LaTeX e caneta manuscrita",
  "start_url": "/diario.html",
  "display": "standalone",
  "background_color": "#f5efe0",
  "theme_color": "#c8843a",
  "lang": "pt-BR",
  "icons": [
    {
      "src": "/assets/img/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/assets/img/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ],
  "screenshots": [
    {
      "src": "/assets/img/screenshot-desktop.jpg",
      "sizes": "1280x720",
      "type": "image/jpeg",
      "form_factor": "wide",
      "label": "Editor com modo caneta ativo"
    }
  ]
}
```

---

## 3. SEO On-page — Conteúdo e Estrutura

### 3.1 Hierarquia de Headings

O Google lê a estrutura de headings como um sumário do conteúdo. A regra é: **um único `<h1>` por página**, que deve conter a palavra-chave principal.

**Estrutura correta para `index.html`:**

```html
<h1>Escreva, rabisque e calcule no mesmo lugar — iScrev Notes</h1>
  <h2>O que você ganha</h2>
    <h3>Escrita leve com Markdown</h3>
    <h3>Fórmulas LaTeX integradas</h3>
    <h3>Caneta manuscrita sobre o texto</h3>
  <h2>Como funciona</h2>
    <h3>Passo 1: Abra uma entrada</h3>
    <h3>Passo 2: Escreva e estruture</h3>
  <h2>Por que o iScrev Notes funciona bem</h2>
```

**Regras:**
- Nunca pule níveis (h1 → h3 sem h2)
- Nunca use h2/h3 apenas por estética — use CSS para estilizar parágrafos
- O `<h1>` deve ser único e conter a palavra-chave principal

---

### 3.2 Palavras-chave Alvo por Página

Pesquisa de palavras-chave com volume de busca relevante para o iScrev Notes:

**`index.html` (PT):**

| Palavra-chave | Intenção | Prioridade |
|---------------|----------|-----------|
| diário digital grátis | Transacional | Alta |
| app de anotações online | Transacional | Alta |
| editor markdown gratuito | Informacional | Média |
| diário com LaTeX | Cauda longa | Alta (pouca concorrência) |
| anotações com caneta digital | Informacional | Média |
| caderno digital para estudantes | Transacional | Alta |
| app para escrever e desenhar | Transacional | Média |

**`en.html` (EN):**

| Keyword | Intent | Priority |
|---------|--------|----------|
| free digital diary | Transactional | High |
| online markdown editor | Transactional | High |
| digital notebook with LaTeX | Long-tail | High |
| handwriting annotation app | Informational | Medium |
| browser-based note app | Transactional | High |

**Como usar as palavras-chave:**
- No `<title>` e `<meta description>`
- No `<h1>` (obrigatório)
- Nos primeiros 100 palavras do conteúdo
- Em pelo menos um `<h2>`
- Nos atributos `alt` das imagens
- Naturalmente no corpo do texto — nunca forçado

---

### 3.3 Texto Alternativo em Imagens (`alt`)

Cada imagem precisa de `alt` descritivo. Imagens decorativas usam `alt=""`:

```html
<!-- ERRADO -->
<img src="screenshot.jpg">
<img src="logo.png" alt="logo">

<!-- CERTO -->
<img src="screenshot.jpg"
     alt="Interface do iScrev Notes mostrando o modo caneta com anotações manuscritas sobre texto Markdown">

<img src="logo.png" alt="iScrev Notes — diário digital">

<!-- Decorativa: alt vazio intencionalmente -->
<img src="background-pattern.svg" alt="" role="presentation">
```

---

### 3.4 Links Internos e Âncoras

Links internos distribuem a "autoridade" entre as páginas e ajudam o Google a entender a estrutura:

```html
<!-- Cada página deve linkar para as demais de forma natural -->
<!-- Em index.html: -->
<a href="sobre.html">Saiba mais sobre a proposta do iScrev Notes</a>
<a href="diario.html">Abrir o app gratuitamente</a>

<!-- Evitar textos genéricos como "clique aqui" ou "leia mais" -->
<!-- ERRADO: -->
<a href="sobre.html">Clique aqui</a>

<!-- CERTO: -->
<a href="sobre.html">Conheça a proposta do iScrev Notes</a>
```

---

### 3.5 Seção de Perguntas Frequentes (FAQ)

Uma seção de FAQ com dados estruturados aparece diretamente nos resultados do Google como "Featured Snippets" — sem precisar de posição #1. Adicionar ao final de `index.html`:

```html
<!-- HTML da seção FAQ -->
<section class="faq-section">
  <h2>Perguntas frequentes</h2>

  <details>
    <summary>O iScrev Notes é gratuito?</summary>
    <p>Sim. O iScrev Notes é completamente gratuito e funciona diretamente no browser, sem necessidade de cadastro, instalação ou pagamento.</p>
  </details>

  <details>
    <summary>Meus dados ficam salvos onde?</summary>
    <p>Tudo é salvo localmente no seu dispositivo, usando IndexedDB do browser. Nenhum dado é enviado para servidores. Você pode exportar suas entradas como arquivos Markdown (.md) para backup.</p>
  </details>

  <details>
    <summary>Posso usar LaTeX no iScrev Notes?</summary>
    <p>Sim. O iScrev Notes suporta equações LaTeX inline com $formula$ e em bloco com $$formula$$, renderizadas em tempo real pelo KaTeX.</p>
  </details>

  <details>
    <summary>O app funciona sem internet?</summary>
    <p>Após o primeiro carregamento, o app pode funcionar sem conexão, pois todos os dados ficam no dispositivo. Fontes e estilos requerem conexão na primeira visita.</p>
  </details>

  <details>
    <summary>Posso usar o iScrev Notes no celular?</summary>
    <p>Sim. O iScrev Notes tem interface responsiva e funciona em smartphones e tablets modernos via browser.</p>
  </details>
</section>
```

```html
<!-- Dados estruturados correspondentes ao FAQ -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "O iScrev Notes é gratuito?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Sim. O iScrev Notes é completamente gratuito e funciona diretamente no browser, sem necessidade de cadastro, instalação ou pagamento."
      }
    },
    {
      "@type": "Question",
      "name": "Meus dados ficam salvos onde?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Tudo é salvo localmente no seu dispositivo, usando IndexedDB do browser. Nenhum dado é enviado para servidores."
      }
    },
    {
      "@type": "Question",
      "name": "Posso usar LaTeX no iScrev Notes?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Sim. O iScrev Notes suporta equações LaTeX inline com $formula$ e em bloco com $$formula$$, renderizadas em tempo real pelo KaTeX."
      }
    },
    {
      "@type": "Question",
      "name": "O app funciona sem internet?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Após o primeiro carregamento, o app pode funcionar sem conexão, pois todos os dados ficam no dispositivo."
      }
    },
    {
      "@type": "Question",
      "name": "Posso usar o iScrev Notes no celular?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Sim. O iScrev Notes tem interface responsiva e funciona em smartphones e tablets modernos via browser."
      }
    }
  ]
}
</script>
```

---

## 4. Core Web Vitals — Performance que o Google Mede

O Google usa três métricas de performance como fator de rankeamento direto desde 2021:

```
┌────────────────────────────────────────────────────────────┐
│                    CORE WEB VITALS                         │
│                                                            │
│  LCP — Largest Contentful Paint                            │
│  "Quanto tempo até o maior elemento aparecer?"             │
│  BOM: < 2,5s  │  REGULAR: 2,5s–4s  │  RUIM: > 4s          │
│                                                            │
│  INP — Interaction to Next Paint (substitui FID em 2024)  │
│  "Quanto tempo até responder a uma interação?"             │
│  BOM: < 200ms  │  REGULAR: 200–500ms  │  RUIM: > 500ms     │
│                                                            │
│  CLS — Cumulative Layout Shift                             │
│  "O layout pulou enquanto carregava?"                      │
│  BOM: < 0,1  │  REGULAR: 0,1–0,25  │  RUIM: > 0,25         │
└────────────────────────────────────────────────────────────┘
```

### 4.1 Melhorar LCP — Fontes e Imagem Hero

O elemento LCP nas páginas do iScrev Notes é o `<h1>`, que usa `Playfair Display` (fonte externa). Para reduzir o FOUT e melhorar o LCP:

```html
<!-- Estratégia de carregamento de fontes em 3 camadas -->

<!-- Camada 1: preconnect para DNS/TLS antecipado -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>

<!-- Camada 2: preload da fonte mais crítica (Playfair Display 700) -->
<!-- Encontre a URL exata inspecionando o CSS do Google Fonts -->
<link rel="preload" as="font" type="font/woff2" crossorigin
      href="https://fonts.gstatic.com/s/playfairdisplay/v37/nuFvD-vYSZviVYUb_rj3ij__anPXJzD.woff2">

<!-- Camada 3: carregamento do CSS de fontes -->
<link rel="stylesheet"
      href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&display=swap">
```

**CSS de fallback para evitar FOUT:**

```css
/* Usa fonte do sistema enquanto Playfair carrega */
h1, h2, h3 {
  font-family: 'Playfair Display', Georgia, 'Times New Roman', serif;
  font-display: swap; /* instrui o browser a usar fallback imediatamente */
}

/* Ajuste métrico para que Georgia não cause CLS ao trocar por Playfair */
@font-face {
  font-family: 'Playfair Display Fallback';
  src: local('Georgia');
  size-adjust: 94%;
  ascent-override: 93%;
  descent-override: 25%;
  line-gap-override: 0%;
}
```

### 4.2 Melhorar CLS — Dimensões Explícitas

Qualquer elemento sem dimensões declaradas pode causar CLS quando carregar:

```html
<!-- ERRADO: browser não sabe o tamanho antes de carregar a imagem -->
<img src="screenshot.jpg" alt="...">

<!-- CERTO: dimensões explícitas evitam layout shift -->
<img src="screenshot.jpg"
     alt="..."
     width="800"
     height="450"
     loading="lazy"
     decoding="async">
```

```css
/* Para elementos que mudam de tamanho dinamicamente, reserve espaço */
.hero-panel {
  min-height: 460px; /* altura mínima conhecida */
  aspect-ratio: 4 / 3;
}
```

### 4.3 Melhorar INP — Código JavaScript

O `diario.js` tem ~2000 linhas executadas sincrona­mente. Para o INP das páginas institucionais (que são estáticas), o impacto é pequeno. Mas o `site-nav.js` deve ser carregado de forma não bloqueante:

```html
<!-- Mover scripts para o final do body ou usar defer -->

<!-- ERRADO: bloqueia o parser -->
<script src="assets/js/site-nav.js"></script>

<!-- CERTO: carrega em paralelo, executa após parsing do HTML -->
<script src="assets/js/site-nav.js" defer></script>
```

### 4.4 Compressão de Imagens

Todas as imagens devem estar em formatos modernos:

```html
<!-- Usar <picture> para servir WebP com fallback JPEG -->
<picture>
  <source srcset="assets/img/screenshot.webp" type="image/webp">
  <source srcset="assets/img/screenshot.jpg"  type="image/jpeg">
  <img src="assets/img/screenshot.jpg"
       alt="Interface do iScrev Notes"
       width="800" height="450"
       loading="lazy">
</picture>
```

Ferramenta de conversão gratuita: **Squoosh** (squoosh.app) — converte e comprime para WebP/AVIF no browser.

Metas de tamanho por tipo:

| Tipo de imagem | Tamanho máximo ideal |
|----------------|---------------------|
| Hero/OG cover | 80–150 KB |
| Screenshots | 30–80 KB |
| Ícones SVG | < 5 KB |
| Favicon .ico | < 10 KB |

---

## 5. Dados Estruturados (JSON-LD)

Os dados estruturados permitem que o Google exiba rich results — resultados enriquecidos com estrelas, imagens, FAQs, listas e breadcrumbs diretamente na página de busca.

### 5.1 Organização (todas as páginas)

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "iScrev Notes",
  "url": "https://seudominio.com",
  "logo": {
    "@type": "ImageObject",
    "url": "https://seudominio.com/assets/img/icon-512.png",
    "width": 512,
    "height": 512
  },
  "founder": {
    "@type": "Person",
    "name": "Wandeson Ricardo",
    "url": "https://www.wsricardo.com.br"
  },
  "sameAs": [
    "https://github.com/seuperfil",
    "https://twitter.com/seuarroba"
  ]
}
</script>
```

### 5.2 Breadcrumb (páginas internas)

Para `sobre.html` e `about.html`:

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Início",
      "item": "https://seudominio.com/"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Sobre o iScrev Notes",
      "item": "https://seudominio.com/sobre.html"
    }
  ]
}
</script>
```

### 5.3 SoftwareApplication (index.html e en.html)

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "iScrev Notes",
  "operatingSystem": "Web",
  "applicationCategory": "ProductivityApplication",
  "applicationSubCategory": "Note-taking",
  "url": "https://seudominio.com/diario.html",
  "description": "Diário digital gratuito com Markdown, LaTeX e caneta manuscrita. Funciona no browser sem instalação.",
  "featureList": [
    "Editor Markdown",
    "Renderização LaTeX com KaTeX",
    "Anotações manuscritas SVG",
    "Exportação para PDF e Markdown",
    "Funcionamento offline",
    "Sem cadastro ou instalação"
  ],
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "BRL"
  },
  "screenshot": {
    "@type": "ImageObject",
    "url": "https://seudominio.com/assets/img/screenshot-desktop.jpg",
    "width": 1280,
    "height": 720
  },
  "inLanguage": ["pt-BR", "en"],
  "author": {
    "@type": "Person",
    "name": "Wandeson Ricardo",
    "url": "https://www.wsricardo.com.br"
  }
}
</script>
```

---

## 6. Internacionalização e Hreflang

### 6.1 Regra Fundamental

O Google precisa entender que `index.html` (PT) e `en.html` (EN) são traduções da mesma página, não conteúdo duplicado. O `hreflang` resolve isso.

**Cada página deve referenciar TODAS as versões, incluindo ela mesma:**

```html
<!-- Em index.html (versão PT) -->
<link rel="alternate" hreflang="pt-BR"   href="https://seudominio.com/index.html">
<link rel="alternate" hreflang="en"      href="https://seudominio.com/en.html">
<link rel="alternate" hreflang="x-default" href="https://seudominio.com/index.html">

<!-- Em en.html (versão EN) -->
<link rel="alternate" hreflang="en"      href="https://seudominio.com/en.html">
<link rel="alternate" hreflang="pt-BR"   href="https://seudominio.com/index.html">
<link rel="alternate" hreflang="x-default" href="https://seudominio.com/index.html">
```

`x-default` indica para qual página enviar usuários de países sem versão específica.

### 6.2 Verificar Implementação

Ferramenta gratuita: https://technicalseo.com/tools/hreflang/

---

## 7. Acessibilidade WCAG 2.2

O Google usa acessibilidade como fator indireto de rankeamento (quanto mais acessível, mais tempo os usuários passam no site, menor a taxa de rejeição). Para o AdSense, o Google também avalia se o site é utilizável.

### 7.1 Nível WCAG 2.2 AA — Requisitos Mínimos

As quatro categorias do WCAG são agrupadas pelo acrônimo **POUR**:

```
P — Perceptível   (o conteúdo pode ser percebido)
O — Operável      (a interface pode ser operada)
U — Compreensível (o conteúdo pode ser compreendido)
R — Robusto       (funciona em tecnologias assistivas)
```

### 7.2 Correções para as Páginas Institucionais

**a) Skip link (navegar teclado antes do conteúdo principal):**

```html
<!-- Primeiro elemento do <body> — invisível até receber foco -->
<a class="skip-link" href="#main-content">Pular para o conteúdo principal</a>

<style>
.skip-link {
  position: absolute;
  top: -100%;
  left: 16px;
  background: var(--warm);
  color: #fff;
  padding: 8px 16px;
  border-radius: 0 0 8px 8px;
  font-family: 'Lora', serif;
  font-size: .9rem;
  text-decoration: none;
  z-index: 9999;
  transition: top .2s;
}
.skip-link:focus {
  top: 0; /* aparece quando recebe foco via Tab */
}
</style>
```

```html
<!-- Na tag main da página -->
<main id="main-content" tabindex="-1">
  ...
</main>
```

**b) `lang` correto em cada página:**

```html
<!-- index.html -->
<html lang="pt-BR">

<!-- en.html -->
<html lang="en">

<!-- sobre.html -->
<html lang="pt-BR">

<!-- about.html -->
<html lang="en">
```

**c) Roles ARIA onde necessário:**

```html
<!-- Navegação: role implícito em <nav> mas precisa de label -->
<nav aria-label="Navegação principal">

<!-- Botão hamburger: deve anunciar estado -->
<button class="nav-toggle"
        aria-label="Abrir menu"
        aria-expanded="false"
        aria-controls="site-nav-group">

<!-- Links ativos: aria-current -->
<a href="index.html" aria-current="page">Início</a>

<!-- Seção de features: usar landmarks -->
<section aria-labelledby="features-heading">
  <h2 id="features-heading">O que você ganha</h2>
  ...
</section>
```

**d) Contraste mínimo WCAG AA:**

| Combinação | Ratio atual | Mínimo AA | Status |
|------------|-------------|-----------|--------|
| `--ink` (#1a1209) sobre `--paper` (#f5efe0) | ~12:1 | 4.5:1 | ✅ |
| `--rust` (#8b3a1f) sobre `--paper` (#f5efe0) | ~7.2:1 | 4.5:1 | ✅ |
| `--ink-soft` (#4c3925) sobre `--paper-soft` (#fbf7ef) | ~8.1:1 | 4.5:1 | ✅ |
| `.nav-link` texto (#4c3925) sobre nav (#fbf7ef) | ~8.1:1 | 4.5:1 | ✅ |
| texto branco sobre `--warm` (#c8843a) | ~3.1:1 | 4.5:1 | ⚠️ Verificar |

> O texto branco sobre `--warm` pode estar abaixo do mínimo. Use https://webaim.org/resources/contrastchecker/ para verificar e ajustar o warm para `#b06e28` se necessário.

**e) Elementos interativos com tamanho mínimo (WCAG 2.5.8 — novo no 2.2):**

```css
/* Botões e links precisam de área de toque mínima de 24×24px */
/* Recomendado: 44×44px para uso confortável em mobile */
.nav-toggle,
.nav-cta,
.button-primary,
.button-secondary {
  min-height: 44px;
  min-width: 44px;
}

/* Links inline: garantir padding suficiente */
.nav-link {
  padding: 10px 16px; /* já OK no style.css atual */
}
```

**f) Foco visível (WCAG 2.4.11 — novo no 2.2):**

```css
/* Remover outline padrão APENAS se substituir por algo melhor */
/* NUNCA fazer outline: none sem alternativa */

:focus-visible {
  outline: 3px solid var(--warm);
  outline-offset: 3px;
  border-radius: 4px;
}

/* Botões já têm :focus-visible no style.css — verificar se está ativo */
.nav-cta:focus-visible,
.button-primary:focus-visible {
  outline: 3px solid #fff;
  outline-offset: 2px;
}
```

### 7.3 Correções Específicas para o Diário (`diario.html`)

**a) Labels para todos os controles de formulário:**

```html
<!-- O #search-input precisa de label associado -->
<!-- ERRADO: placeholder não é label -->
<input type="text" id="search-input" placeholder="Buscar entradas…">

<!-- CERTO: label visualmente oculto mas presente para leitores de tela -->
<label for="search-input" class="sr-only">Buscar entradas</label>
<input type="text" id="search-input" placeholder="Buscar entradas…">
```

```css
/* Classe utilitária para conteúdo acessível mas visualmente oculto */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

**b) Região viva para toasts (anúncio em leitores de tela):**

```html
<!-- O toast precisa de role="alert" para ser anunciado automaticamente -->
<div class="toast"
     id="toast"
     role="alert"
     aria-live="polite"
     aria-atomic="true"></div>
```

**c) SVG de caneta precisa de descrição adequada:**

```html
<svg id="pen-svg"
     role="img"
     aria-label="Área de anotações manuscritas. Use o modo caneta para desenhar."
     focusable="false">
  <title>Anotações manuscritas</title>
  <g id="pen-layer"></g>
</svg>
```

**d) Ordem de foco lógica na toolbar:**

```html
<!-- Usar tabindex="0" apenas quando necessário -->
<!-- A ordem dos elementos no DOM define a ordem de foco -->
<!-- Verificar se a toolbar segue a ordem visual lógica -->
<div class="toolbar" role="toolbar" aria-label="Ferramentas de edição">
  <!-- botões na ordem visual correta -->
</div>
```

**e) Estados de botões de modo:**

```html
<!-- Botões do mode-toggle precisam comunicar estado ativo -->
<button class="mode-btn active"
        id="mode-edit"
        aria-pressed="true">
  ✏ <span>Editar</span>
</button>
<button class="mode-btn"
        id="mode-pen"
        aria-pressed="false">
  ✒ <span>Caneta</span>
</button>
```

```javascript
// Atualizar aria-pressed ao mudar de modo
function setMode(m) {
  document.getElementById('mode-edit').setAttribute('aria-pressed', m === 'edit' ? 'true' : 'false');
  document.getElementById('mode-pen').setAttribute('aria-pressed', m === 'pen' ? 'true' : 'false');
  document.getElementById('mode-preview').setAttribute('aria-pressed', m === 'preview' ? 'true' : 'false');
  // ... resto da função
}
```

---

## 8. Requisitos do Google AdSense

O AdSense é a plataforma de anúncios do Google para sites. Para ser aprovado, há requisitos técnicos, de conteúdo e de política. Abaixo está a lista completa com o status do iScrev Notes:

### 8.1 Checklist de Aprovação

| Requisito | Status | O que fazer |
|-----------|--------|-------------|
| Domínio próprio (não Netlify/GitHub Pages subdomínio) | ⚠️ Verificar | Registrar domínio próprio — ver seção 9 |
| Site no ar há ≥ 3–6 meses | ⚠️ Verificar | Publicar o quanto antes |
| Conteúdo original e suficiente | ⚠️ Parcial | Adicionar blog ou seção de ajuda — ver abaixo |
| Política de Privacidade | ❌ Ausente | Criar página obrigatoriamente |
| Termos de Uso | ❌ Ausente | Criar página recomendada |
| Navegação clara | ✅ OK | Já tem navegação principal |
| Design profissional | ✅ OK | Design bem cuidado |
| Mobile-friendly | ✅ OK | Layout responsivo implementado |
| HTTPS | ⚠️ Verificar | Obrigatório — ver seção 9 |
| Sem conteúdo proibido | ✅ OK | Conteúdo neutro e educacional |
| Sem excesso de anúncios de outras redes | ✅ OK | Não há anúncios ainda |
| Velocidade adequada | ⚠️ Verificar | Implementar melhorias da seção 4 |

### 8.2 Política de Privacidade (OBRIGATÓRIO)

**Este é o requisito mais frequentemente ignorado e é eliminatório para o AdSense.** Criar a página `privacidade.html`:

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Política de Privacidade — iScrev Notes</title>
  <!-- ... head completo ... -->
</head>
<body>
  <main>
    <h1>Política de Privacidade</h1>
    <p><strong>Última atualização:</strong> março de 2026</p>

    <h2>1. Dados que coletamos</h2>
    <p>
      O iScrev Notes não coleta dados pessoais dos usuários. Todo o conteúdo
      criado (entradas do diário, anotações, configurações) é armazenado
      exclusivamente no dispositivo do usuário via IndexedDB e localStorage
      do browser. Nenhuma informação é transmitida para servidores externos.
    </p>

    <h2>2. Cookies e tecnologias de rastreamento</h2>
    <p>
      Este site não utiliza cookies próprios. Caso anúncios do Google AdSense
      sejam exibidos, o Google poderá utilizar cookies de publicidade para
      personalizar anúncios. Consulte a Política de Privacidade do Google:
      <a href="https://policies.google.com/privacy" target="_blank" rel="noopener">
        policies.google.com/privacy
      </a>
    </p>

    <h2>3. Google AdSense</h2>
    <p>
      Este site pode exibir anúncios fornecidos pelo Google AdSense.
      O Google utiliza cookies para veicular anúncios com base em visitas
      anteriores do usuário a este ou outros sites. Os usuários podem desativar
      a publicidade personalizada acessando:
      <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener">
        Configurações de anúncios do Google
      </a>
    </p>

    <h2>4. Google Analytics (se aplicável)</h2>
    <p>
      Este site pode utilizar o Google Analytics para análise de tráfego
      anônimo. Os dados coletados pelo Analytics não identificam o usuário
      individualmente e são usados apenas para métricas de audiência.
    </p>

    <h2>5. Seus direitos (LGPD)</h2>
    <p>
      De acordo com a Lei Geral de Proteção de Dados (Lei 13.709/2018),
      você tem o direito de solicitar informações sobre qualquer dado
      eventualmente associado ao seu uso deste site. Para exercer esses
      direitos, entre em contato pelo e-mail indicado abaixo.
    </p>

    <h2>6. Contato</h2>
    <p>
      Dúvidas sobre esta política de privacidade:
      <a href="mailto:contato@seudominio.com">contato@seudominio.com</a>
    </p>
  </main>
</body>
</html>
```

**Adicionar no footer de todas as páginas:**

```html
<footer>
  <!-- ... conteúdo do footer ... -->
  <div class="footer-legal">
    <a href="privacidade.html">Política de Privacidade</a>
    <a href="termos.html">Termos de Uso</a>
  </div>
</footer>
```

### 8.3 Conteúdo Original Suficiente

O Google AdSense rejeita sites com conteúdo insuficiente. O iScrev Notes tem páginas institucionais bem escritas, mas o ideal para aprovação é ter:

**Conteúdo mínimo sugerido:**

| Elemento | Mínimo | Status atual |
|----------|--------|-------------|
| Páginas com texto original | 4–5 | ✅ Tem 4 |
| Palavras por página principal | 400+ | ✅ OK |
| Seção de ajuda ou tutorial | 1 | ❌ Ausente |
| Página de contato ou formulário | 1 | ❌ Ausente |
| Política de Privacidade | 1 | ❌ Ausente |

**Adicionar uma seção "Como usar" em `sobre.html`:**

Expandir as páginas com tutoriais passo a passo do uso do app — capturas de tela, casos de uso (estudante, escritor, pesquisador). Cada página deve ter pelo menos 600 palavras de conteúdo original.

### 8.4 Onde Posicionar os Anúncios (após aprovação)

O AdSense funciona melhor em posições que não interfiram na experiência:

```
Páginas institucionais (index, sobre, en, about):
├── Banner horizontal: após o hero (abaixo do fold)
├── Banner lateral: em telas ≥ 1024px, na sidebar direita
└── Banner ao final: antes do footer

NÃO posicionar anúncios em:
├── diario.html (o app em si — prejudica a experiência e viola políticas)
├── Acima do fold sem conteúdo antes
├── Pop-ups ou overlays
└── Dentro de modais
```

```html
<!-- Exemplo de bloco de anúncio AdSense (após aprovação) -->
<!-- Posicionado entre seções da página institucional -->
<div class="ad-container" aria-label="Publicidade">
  <ins class="adsbygoogle"
       style="display:block"
       data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
       data-ad-slot="XXXXXXXXXX"
       data-ad-format="auto"
       data-full-width-responsive="true"></ins>
</div>
```

```css
/* Garantir que anúncios não causem CLS */
.ad-container {
  min-height: 90px; /* altura mínima reservada */
  margin: 24px 0;
  overflow: hidden;
}
```

---

## 9. Infraestrutura e Domínio

### 9.1 Por que Domínio Próprio é Essencial

Sem domínio próprio, o site fica em subdomínios como `seusite.netlify.app` ou `seusite.github.io`. Isso impacta:

- O Google AdSense **raramente aprova** subdomínios de serviços gratuitos
- Subdomínios compartilham reputação com outros sites na mesma plataforma
- Dificulta o rankeamento porque a autoridade do domínio é zero

**Custo de um domínio .com.br:** ~R$ 40–60/ano no Registro.br (registro.br).

### 9.2 Hospedagem Gratuita com Domínio Próprio

Estas plataformas hospedam sites estáticos gratuitamente e permitem domínio próprio:

| Plataforma | Plano gratuito | HTTPS automático | CDN | Deploy |
|-----------|---------------|-----------------|-----|--------|
| Netlify | ✅ Ilimitado | ✅ | ✅ | Git ou drag-and-drop |
| Vercel | ✅ Ilimitado | ✅ | ✅ | Git |
| GitHub Pages | ✅ Ilimitado | ✅ | Parcial | Git |
| Cloudflare Pages | ✅ Ilimitado | ✅ | ✅ | Git |

**Recomendação:** Netlify ou Cloudflare Pages — ambos têm CDN global, HTTPS automático e domínio próprio gratuito.

### 9.3 HTTPS Obrigatório

Sem HTTPS, o Google Chrome exibe "Não seguro" e o Google penaliza o rankeamento. Todas as plataformas citadas fornecem HTTPS via Let's Encrypt automaticamente ao apontar o domínio.

### 9.4 Google Search Console

Após publicar com domínio próprio:

1. Acessar https://search.google.com/search-console
2. Adicionar a propriedade com o domínio
3. Verificar via arquivo HTML ou registro DNS
4. Submeter o `sitemap.xml`
5. Solicitar indexação das páginas principais

O Search Console mostra quais palavras-chave trazem cliques, quais páginas estão indexadas e erros técnicos de rastreamento.

---

## 10. Plano de Ação Priorizado

Ordenado por impacto × facilidade de implementação:

### Semana 1 — Fundação Técnica

- [ ] Registrar domínio próprio (registro.br ou Namecheap)
- [ ] Publicar em Netlify ou Cloudflare Pages com HTTPS
- [ ] Criar `robots.txt` e `sitemap.xml`
- [ ] Criar `privacidade.html` com política completa
- [ ] Criar `favicon.ico`, `icon-192.png`, `icon-512.png`
- [ ] Criar `manifest.json`
- [ ] Adicionar link para Política de Privacidade no footer

### Semana 2 — `<head>` e Metadados

- [ ] Atualizar `<head>` completo em todas as 4 páginas (seção 2.1)
- [ ] Criar imagem OG `og-cover.jpg` (1200×630)
- [ ] Adicionar todos os `<link rel="alternate" hreflang>` (seção 6)
- [ ] Adicionar dados estruturados JSON-LD (seção 5)
- [ ] Verificar e corrigir atributos `alt` em todas as imagens

### Semana 3 — Acessibilidade

- [ ] Adicionar skip link em todas as páginas
- [ ] Adicionar `aria-label` em todos os `<nav>`
- [ ] Corrigir `aria-pressed` nos botões de modo do diário
- [ ] Adicionar `role="alert"` no toast
- [ ] Adicionar `<label>` no `#search-input`
- [ ] Verificar contraste de todas as combinações de cor
- [ ] Testar navegação completa por teclado (Tab/Enter/Escape)

### Semana 4 — Performance e Conteúdo

- [ ] Converter imagens para WebP com fallback JPEG
- [ ] Adicionar `width` e `height` em todas as `<img>`
- [ ] Mover `site-nav.js` para `defer`
- [ ] Adicionar `loading="lazy"` em imagens abaixo do fold
- [ ] Criar seção FAQ em `index.html` e `en.html` com JSON-LD
- [ ] Expandir `sobre.html` para 600+ palavras com tutorial passo a passo

### Semana 5+ — Indexação e AdSense

- [ ] Submeter ao Google Search Console
- [ ] Aguardar indexação (2–4 semanas tipicamente)
- [ ] Instalar Google Analytics (GA4) para métricas
- [ ] Aguardar ≥ 3 meses de domínio ativo com conteúdo
- [ ] Solicitar aprovação no Google AdSense
- [ ] Após aprovação: posicionar anúncios nas páginas institucionais

---

## 11. Ferramentas de Diagnóstico e Monitoramento

### 11.1 Verificação Técnica

| Ferramenta | O que verifica | URL |
|------------|---------------|-----|
| Google Search Console | Indexação, erros, palavras-chave | search.google.com/search-console |
| Lighthouse (Chrome DevTools) | Performance, SEO, acessibilidade, PWA | Tecla F12 → aba Lighthouse |
| PageSpeed Insights | Core Web Vitals reais e laboratório | pagespeed.web.dev |
| Rich Results Test | Dados estruturados JSON-LD | search.google.com/test/rich-results |
| Mobile-Friendly Test | Usabilidade mobile | search.google.com/test/mobile-friendly |
| Structured Data Linter | Validação de schema.org | linter.structured-data.org |
| Open Graph Debugger | Preview das meta tags OG | developers.facebook.com/tools/debug |
| Twitter Card Validator | Preview no Twitter | cards-dev.twitter.com/validator |

### 11.2 Verificação de Acessibilidade

| Ferramenta | O que verifica | URL |
|------------|---------------|-----|
| WAVE | Erros e alertas WCAG visuais | wave.webaim.org |
| axe DevTools | 98% dos WCAG automáticos | Chrome Extension |
| Colour Contrast Analyser | Ratio de contraste exato | coolors.co/contrast-checker |
| WebAIM Contrast Checker | WCAG AA e AAA | webaim.org/resources/contrastchecker |
| NVDA (Windows) | Leitor de tela real | nvaccess.org/download |
| VoiceOver (macOS/iOS) | Leitor de tela nativo Apple | Built-in |

### 11.3 Monitoramento Contínuo

```
Rotina mensal recomendada:
├── Verificar Search Console por erros de rastreamento
├── Verificar Core Web Vitals no PageSpeed Insights
├── Executar Lighthouse nas páginas principais
├── Verificar se novas páginas foram indexadas
└── Analisar quais palavras-chave trazem tráfego
```

---

## 12. Referências Oficiais

### Documentação Google

| Recurso | URL |
|---------|-----|
| Guia de SEO para iniciantes | developers.google.com/search/docs/beginner/seo-starter-guide |
| Core Web Vitals | web.dev/explore/learn-core-web-vitals |
| Dados estruturados schema.org | developers.google.com/search/docs/appearance/structured-data |
| Central de ajuda do AdSense | support.google.com/adsense |
| Políticas do programa AdSense | support.google.com/adsense/answer/48182 |
| Search Console — Início | search.google.com/search-console/about |

### WCAG e Acessibilidade

| Recurso | URL |
|---------|-----|
| WCAG 2.2 — Especificação completa | w3.org/TR/WCAG22 |
| WCAG Quick Reference | w3.org/WAI/WCAG22/quickref |
| ARIA — Práticas de autoria | w3.org/WAI/ARIA/apg |
| WebAIM — Guias práticos | webaim.org/intro |
| MDN — Acessibilidade | developer.mozilla.org/en-US/docs/Web/Accessibility |

### Open Graph e Twitter Cards

| Recurso | URL |
|---------|-----|
| Open Graph Protocol | ogp.me |
| Twitter Card documentation | developer.twitter.com/en/docs/twitter-for-websites/cards |
| LinkedIn Post Inspector | linkedin.com/post-inspector |

### Schema.org

| Recurso | URL |
|---------|-----|
| SoftwareApplication | schema.org/SoftwareApplication |
| FAQPage | schema.org/FAQPage |
| BreadcrumbList | schema.org/BreadcrumbList |
| Organization | schema.org/Organization |

### Performance e Ferramentas

| Recurso | URL |
|---------|-----|
| Squoosh — compressão de imagens | squoosh.app |
| Real Favicon Generator | realfavicongenerator.net |
| Google Fonts Optimization | fonts.google.com/knowledge |
| WebPageTest | webpagetest.org |
| Cloudflare Pages (hospedagem) | pages.cloudflare.com |
| Netlify (hospedagem) | netlify.com |

---

*Este documento é um guia vivo. Revisitar a cada 6 meses — algoritmos do Google mudam regularmente.*
