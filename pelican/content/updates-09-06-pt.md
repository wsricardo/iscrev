Title: Atualizações de Junho no iScrev Notes: Apoio via Stripe, Novo Layout e Código Limpo
Date: 2026-06-09 17:00
Category: Anuncios
Tags: atualizacoes, stripe, pix, apoio, desenvolvimento, design
Slug: updates-09-06-2026
Author: WSRicardo
Summary: Neste mês, o iScrev Notes recebeu atualizações vitais: a integração de pagamentos via Stripe para apoios internacionais, refinamentos na página de doação e uma limpeza profunda na arquitetura legada do projeto.
Lang: pt

Chegamos a mais uma etapa importante de evolução do iScrev Notes. Junho trouxe novidades não apenas visuais, mas focadas na sustentabilidade a longo prazo do projeto e na qualidade interna do código. 

Como um projeto independente, o iScrev Notes cresce com o tempo, a pesquisa e o apoio da comunidade. O grande foco desta atualização foi tornar esse apoio mais acessível, global e seguro, além de garantir que a aplicação continue leve e rápida.

## Apoio Global com Stripe e PIX Simplificado

A maior novidade técnica voltada para a comunidade é a **integração com o Stripe**. Até pouco tempo atrás, o suporte ao projeto era limitado ao público brasileiro através de transferências via PIX. Com a nova atualização, usuários do mundo todo agora podem apoiar o iScrev Notes de forma rápida e segura utilizando cartões de crédito.

O design da página de apoio (`support.html`) e do modal interno no diário também passou por uma reformulação. A premissa foi abraçar o **minimalismo e a honestidade**. Removemos formulários complexos e caixas de seleção de valores que adicionavam atrito. Agora, o fluxo é o mais limpo possível:

- **Para o Brasil (PT):** O usuário tem acesso direto à nossa chave PIX para copiar, colar no seu banco e definir o valor que sentir no coração, além de poder usar o Stripe.
- **Internacional (EN):** O botão do Stripe leva direto para o checkout global, com um valor sugerido partindo de 1 dólar, mas permitindo que a contribuição seja livre.

Essa abordagem se alinha à nossa filosofia: nada de letras miúdas, taxas escondidas ou processos longos. Apenas um clique ou um "copiar e colar".

## Limpeza Profunda e Adeus ao Código Legado

Desenvolver um app local-first significa ter uma obsessão por manter o código pequeno, rápido e funcional offline. Durante esta atualização, fizemos uma verdadeira "faxina" na base de código (`src/`):

1. **Adeus ao Exportador de PDF Antigo:** No início do projeto, tínhamos uma biblioteca pesada focada em gerar PDFs. Desde que migramos para um CSS refinado de impressão nativa (`window.print()`), esse exportador assíncrono tornou-se obsoleto. Hoje ele foi oficialmente deletado, reduzindo o peso do pacote e do nosso Service Worker.
2. **Otimização de Variáveis:** O código de configuração de valores, moedas e estados obsoletos (que antes regiam a velha página de apoio) foi completamente varrido do `support.js`. 
3. **Novo Cache:** Lançamos a versão `v10.7` do nosso cache offline, assegurando que navegadores peguem a versão mais leve do app.

## Blog Estruturado e Sincronizado

E, como você pode estar notando caso esteja lendo isso do nosso diretório raiz, ajustamos a forma como nosso blog estático interage com o app!

Refinamos a arquitetura do **Pelican** para garantir que categorias, tags, feeds RSS/Atom e artigos não "vazem" para a raiz do site principal. Tudo agora vive harmoniosamente dentro da subpasta `/blog/`. Isso significa que o `iscrev.com` mantém suas landing pages puras na raiz, e o conteúdo textual e atualizações ficam perfeitamente delimitados.

## Próximos Passos

Ainda temos muito trabalho pela frente. O próximo grande salto do projeto envolverá modularizar ainda mais o arquivo principal do diário, abraçando ES Modules com força total. Isso abrirá portas para a construção de funcionalidades mais ambiciosas no futuro, preservando a essência de "um arquivo só".

Muito obrigado a todos que usam, escrevem, desenham e apoiam o iScrev Notes. Continuamos em frente!

---

*Para apoiar o projeto e nos ajudar a manter essa ferramenta sem anúncios e focada na privacidade, visite nossa [página de apoio](/support.html).*
