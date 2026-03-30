# Relatorio de Analise SEO e Acessibilidade

> Projeto: iScrev Notes  
> Escopo analisado: `src/` e `docs/`  
> Data: 29 de marco de 2026  
> Base da analise: inspecao local do codigo, `src/DOCUMENTACAO.md`, `src/todos/iScrev-Notes-SEO-Acessibilidade.md` e referencias oficiais do Google Search Central e Google AdSense Help

---

## 1. Objetivo

Este relatorio registra o estado atual do iScrev Notes quanto a:

- SEO tecnico e on-page;
- acessibilidade geral de navegacao e foco;
- adequacao estrutural para mecanismos de busca;
- prontidao basica para futura aprovacao no Google AdSense.

O criterio adotado respeita a filosofia do projeto:

- visual confortavel;
- baixa distracao;
- simplicidade de implementacao;
- preservacao da identidade de caderno digital;
- ausencia de intervencoes que descaracterizem o design atual.

---

## 2. Resumo Executivo

O projeto esta em um estado bom de base tecnica para SEO e em um estado intermediario de acessibilidade. A estrutura institucional e suficientemente clara para indexacao, e o app principal foi corretamente tratado como uma pagina funcional que nao deve competir com as landing pages institucionais na busca.

### 2.1 Diagnostico resumido

- SEO tecnico: bom
- SEO de conteudo: bom, mas ainda pode crescer
- acessibilidade de navegacao: boa
- acessibilidade de formularios do app: intermediaria
- prontidao para AdSense: parcial

### 2.2 Leitura geral

O site ja possui:

- titulos e descricoes coerentes;
- `canonical` e `hreflang`;
- `robots.txt` e `sitemap.xml`;
- `JSON-LD` nas paginas principais;
- favicon;
- `skip link`;
- estados de foco visiveis;
- `aria-label` e semantica basica de navegacao.

Os principais bloqueios restantes para um nivel mais forte de conformidade e para maior chance de aprovacao no AdSense nao estao mais no visual, e sim em lacunas de estrutura editorial e juridico-informacional:

- ausencia de pagina de privacidade;
- ausencia de pagina de contato;
- ausencia de pagina de termos de uso;
- ausencia de `ads.txt`;
- ausencia de imagem Open Graph/Twitter;
- alguns controles do app ainda dependem mais de placeholder do que de rotulos semanticos explicitos.

---

## 3. O Que Foi Encontrado Como Ponto Forte

### 3.1 Estrutura institucional clara

O projeto possui quatro paginas institucionais bem definidas:

- `index.html`
- `sobre.html`
- `en.html`
- `about.html`

Isso e positivo para SEO porque cria pontos de entrada reais para o produto, em vez de depender apenas da shell do app.

### 3.2 SEO tecnico basico bem encaminhado

Foi identificado no estado atual:

- `title` descritivo nas paginas principais;
- `meta description` coerente;
- `meta robots` apropriado;
- `canonical` consistente;
- `hreflang` entre PT-BR e EN;
- `JSON-LD` para `WebSite`, `WebPage`, `AboutPage` e `SoftwareApplication`;
- `theme-color`;
- `author`;
- `robots.txt` sem bloqueio indevido de JS;
- `sitemap.xml` com alternates por idioma e `lastmod`.

Isso ja coloca o projeto acima de muitos sites pequenos que chegam ao Search Console sem base tecnica minima.

### 3.3 Decisao correta para o app principal

A pagina `diario.html` esta marcada com:

- `noindex, follow`

Essa decisao e tecnicamente adequada ao projeto atual. A pagina do app e uma shell funcional, nao uma landing page rica em conteudo indexavel. Deixar essa URL competir diretamente nas buscas poderia enfraquecer a qualidade percebida do site em mecanismos de busca.

### 3.4 Boas melhorias de acessibilidade ja presentes

Foi identificado:

- `lang` nas paginas;
- `skip-link` para pular ao conteudo;
- `focus-visible` consistente em links, botoes e campos;
- `aria-label` no menu principal;
- controle mobile do menu com `aria-expanded` e `aria-hidden`;
- `main` com foco programatico;
- varios controles do app com texto visivel ou `aria-label`.

Esses pontos melhoram muito a navegacao por teclado sem exigir mudanca visual forte.

### 3.5 Coerencia entre `src` e `docs`

O conjunto principal de arquivos espelhados entre `src` e `docs` esta alinhado. Isso e importante porque evita que o ambiente publicado fique tecnicamente defasado em relacao ao ambiente de desenvolvimento.

---

## 4. Gaps de SEO Encontrados

### 4.1 Falta de imagem social compartilhavel

Nao foi identificado um pacote de imagem social completo, especialmente:

- imagem Open Graph;
- imagem para Twitter Card.

Impacto:

- compartilhamentos ficam pobres visualmente;
- CTR potencial em redes e apps de mensagem cai;
- a apresentacao publica do produto perde forca.

Prioridade: alta

### 4.2 Falta de paginas de confianca institucional

Nao foram encontrados, no projeto atual:

- pagina de privacidade;
- pagina de contato;
- pagina de termos de uso.

Impacto:

- reduz confianca editorial e institucional;
- enfraquece sinais de transparencia;
- pesa negativamente para revisoes humanas e para AdSense.

Prioridade: critica para AdSense

### 4.3 Conteudo institucional ainda enxuto

As paginas institucionais sao boas, mas ainda podem crescer em profundidade sem perder a leveza.

Hoje elas apresentam:

- proposta;
- beneficios;
- design;
- fluxo de uso.

Mas ainda ha espaco para adicionar, de forma discreta:

- perguntas frequentes;
- casos de uso;
- explicacao de privacidade local-first;
- diferenciadores práticos.

Impacto:

- mais semantica e contexto para motores de busca;
- mais conteudo util para AdSense;
- maior permanencia do usuario.

Prioridade: media

### 4.4 Ausencia de `ads.txt`

O arquivo `ads.txt` nao foi encontrado.

Impacto:

- nao bloqueia a aprovacao inicial em todos os cenarios, mas e importante para operacao publicitaria madura;
- vira um requisito relevante assim que a monetizacao entrar em producao.

Prioridade: media, apos conta AdSense ativa

### 4.5 Manifest e camada PWA ainda ausentes

O material interno de SEO/acessibilidade cita `manifest.json`, mas ele nao aparece no estado atual publicado.

Impacto:

- nao e critico para indexacao;
- mas reduz sinais complementares de qualidade mobile.

Prioridade: baixa a media

---

## 5. Gaps de Acessibilidade Encontrados

### 5.1 Formularios com dependencia excessiva de placeholder

No app principal, varios campos ainda se apresentam mais por placeholder do que por rotulo semantico associado. Isso vale especialmente para:

- busca da sidebar;
- titulo da entrada;
- corpo do texto;
- possivelmente o seletor de mood e o modal de equacao.

Impacto:

- piora experiencia para leitor de tela;
- reduz clareza de contexto quando o campo recebe foco;
- dificulta navegacao assistiva em formulários longos.

Prioridade: alta

### 5.2 Menu mobile sem foco contido

O menu mobile institucional abre corretamente e anuncia estado, mas nao ha indicio de foco contido no painel quando aberto.

Impacto:

- em teclado, o foco pode continuar "atraves" do painel;
- nao chega a ser um erro grave para esse tipo de dropdown, mas pode ser refinado.

Prioridade: media

### 5.3 Ausencia de tratamento de `prefers-reduced-motion`

Nao foi encontrado tratamento especifico para reduzir animacoes quando o usuario manifesta preferencia por movimento reduzido.

Impacto:

- menor conforto para usuarios sensiveis a animacao;
- nao compromete a navegacao geral, mas e uma melhoria recomendada.

Prioridade: media

### 5.4 Sem auditoria automatizada registrada

Nao ha, no estado atual inspecionado, evidencia de:

- Lighthouse automatizado;
- axe-core;
- testes sistematicos de WCAG.

Impacto:

- alguns problemas podem passar despercebidos;
- dificulta medir regressao.

Prioridade: media

---

## 6. AdSense - Estado de Prontidao

Com base no estado atual do projeto e nas orientacoes oficiais do AdSense, o iScrev Notes esta melhor preparado tecnicamente do que antes, mas ainda nao esta no ponto ideal para submissao forte.

### 6.1 Pontos positivos para AdSense

- navegacao clara;
- paginas institucionais reais;
- conteudo original;
- tema legitimo e util;
- proposta clara de produto;
- boa experiencia visual;
- versao mobile responsiva;
- metadados e semantica melhorados.

### 6.2 Pontos que ainda pesam contra

- falta de politica de privacidade;
- falta de pagina de contato;
- falta de termos de uso;
- falta de `ads.txt`;
- conteudo institucional ainda relativamente curto;
- app principal sem pagina publica de explicacao juridica/comercial associada.

### 6.3 Avaliacao qualitativa

- chance tecnica de rastreamento/indexacao: boa
- chance de entendimento do produto: boa
- chance de aprovacao imediata no AdSense sem paginas auxiliares: baixa a media

Conclusao pratica:

Antes de solicitar aprovacao no AdSense, o projeto deveria no minimo publicar:

1. `privacidade.html`
2. `privacy.html`
3. `contato.html` ou pagina equivalente
4. opcionalmente `termos.html`

---

## 7. Recomendacoes Priorizadas

### 7.1 Prioridade critica

- Criar pagina de politica de privacidade em PT-BR e EN.
- Criar pagina de contato.
- Adicionar links para essas paginas no footer institucional.

### 7.2 Prioridade alta

- Adicionar rotulos semanticamente associados aos campos principais do app.
- Criar imagem Open Graph/Twitter.
- Incluir `og:image` e `twitter:image`.

### 7.3 Prioridade media

- Adicionar tratamento para `prefers-reduced-motion`.
- Avaliar foco mais controlado no menu mobile.
- Expandir levemente o conteudo institucional com FAQ ou secoes complementares.

### 7.4 Prioridade baixa a media

- Criar `manifest.json`.
- Planejar `ads.txt` para fase de monetizacao.
- Refinar structured data com mais tipos apenas quando houver mais conteudo visivel correspondente.

---

## 8. Sugestoes de Implementacao Sem Ferir o Design

As melhorias recomendadas podem ser feitas sem romper a filosofia do projeto.

### 8.1 Politica e contato

Usar a mesma linguagem visual:

- fundo em papel quente;
- tipografia atual;
- layout de leitura simples;
- footer compartilhado.

### 8.2 Rotulos acessiveis no diario

Sem mudar o desenho, e possivel:

- inserir `label` visualmente oculto para busca;
- inserir `aria-label` ou `aria-labelledby` para campos do editor;
- associar melhor o `select` de mood e o campo do modal de equacao.

### 8.3 Open Graph

Criar uma unica imagem editorial coerente com o produto:

- logo;
- nome do app;
- frase curta;
- atmosfera de papel e caderno;
- sem poluicao visual.

### 8.4 Motion reduction

Adicionar um bloco pequeno em CSS:

```css
@media (prefers-reduced-motion: reduce){
  *{
    animation:none !important;
    transition:none !important;
    scroll-behavior:auto !important;
  }
}
```

Isso melhora acessibilidade sem mudar a identidade visual para a maioria dos usuarios.

---

## 9. Referencias Oficiais Utilizadas

### Google Search Central

- Canonical:  
  https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls

- robots.txt:  
  https://developers.google.com/search/docs/crawling-indexing/robots/create-robots-txt

- Hreflang / versoes localizadas:  
  https://developers.google.com/search/docs/advanced/crawling/localized-versions

- Structured data guidelines:  
  https://developers.google.com/search/docs/appearance/structured-data/sd-policies

### Google AdSense Help

- Make sure your site's pages are ready for AdSense:  
  https://support.google.com/adsense/answer/7299563

- Google Publisher Policies:  
  https://support.google.com/adsense/answer/10008391

---

## 10. Conclusao

O iScrev Notes ja possui uma base tecnicamente boa para ser encontrado por mecanismos de busca e para amadurecer rumo a uma aprovacao publicitaria futura. O projeto ganhou estrutura, semantica, consistencia entre idiomas e melhorias reais de navegacao por teclado.

O que ainda falta nao e uma mudanca de visual ou de filosofia. Falta sobretudo completar a camada de confianca editorial e juridica do site e fechar alguns detalhes de acessibilidade dos formularios do app.

Em resumo:

- SEO tecnico: bem encaminhado
- acessibilidade geral: boa, com lacunas pontuais no app
- AdSense: ainda precisa de paginas institucionais de confianca e alguns sinais complementares

O caminho mais adequado continua sendo evoluir por camadas, preservando a proposta do projeto: um diario digital e caderno de anotacoes com visual confortavel, sem distracoes e orientado ao trabalho real do usuario.
