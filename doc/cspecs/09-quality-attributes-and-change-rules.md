# CSpec 09 — Qualidades do Sistema e Regras de Mudança

## 1. Objetivo

Registrar os atributos de qualidade mais importantes do iScrev Notes e transformar riscos conhecidos em regras práticas para manutenção orientada por especificação.

## 2. Atributos de qualidade prioritários

### 2.1 Privacidade

- não há login;
- não há backend de dados do diário;
- a persistência é local;
- exportação é controlada pelo usuário.

### 2.2 Robustez offline

- há service worker;
- os dados principais vivem no navegador;
- o app deve degradar bem sem conectividade após cache inicial bem-sucedido.

### 2.3 Baixa fricção

- criação de entrada em um clique;
- autosave textual;
- persistência imediata de traços;
- troca de idioma sem reload;
- abertura automática da entrada mais recente quando disponível.

### 2.4 Fidelidade geométrica

- texto renderizado e traços precisam permanecer alinhados;
- impressão e preview dependem dessa fidelidade.

### 2.5 Manutenibilidade

- apesar de `diario.js` ser monolítico, as responsabilidades já estão seccionadas;
- estas `cspecs` existem para tornar refactors mais seguros.

## 3. Riscos técnicos conhecidos

### 3.1 Monólito de runtime

`src/assets/js/diario.js` concentra muitos subsistemas. Qualquer refactor deve ser incremental e acompanhado pelas `cspecs` correspondentes.

### 3.2 Bootstrap com resíduos legados

Há chamadas fora da cadeia principal de inicialização:

- `loadData();`
- `applyLocale(currentLang);`
- abertura da última entrada condicionada a `entries.length`
- `syncResponsiveShell();`

Esses trechos refletem evolução incremental e devem ser vistos como candidatos a consolidação, não como comportamento ideal a ser perpetuado.

### 3.3 Acoplamento por IDs

Grande parte do app depende de `getElementById`. Alterações estruturais em HTML têm alto potencial de quebra silenciosa.

### 3.4 Protocolo Markdown informal

O formato de importação/exportação funciona, mas ainda é baseado em regex e convenção. Mudanças precisam ser extremamente cuidadosas.

### 3.5 Dependências CDN

KaTeX e Google Fonts ainda dependem de recursos externos na primeira carga em muitos cenários.

## 4. Regras obrigatórias para mudança

1. Mudanças de comportamento devem atualizar a `cspec` correspondente antes ou junto com o código.
2. Alterações em formato de dados exigem estratégia explícita de compatibilidade.
3. Alterações no shell que mudem scroll, overlay ou viewport exigem revisão do contrato de caneta.
4. Alterações em i18n devem preservar fallback funcional.
5. Alterações em impressão devem validar tanto stage print quanto `pdf-exporter.js`.

## 5. Checklist de regressão manual

### 5.1 Fluxos principais

- criar nova entrada;
- editar título e corpo;
- salvar manualmente;
- aguardar autosave;
- fechar e reabrir a entrada;
- excluir entrada.

### 5.2 Superfícies

- alternar `edit -> pen -> preview -> edit`;
- verificar se preview reflete o corpo atual;
- desenhar, apagar, desfazer e limpar traços;
- rolar o editor e validar alinhamento dos traços.

### 5.3 Persistência

- recarregar a página e confirmar restauração;
- validar fallback sem perda quando IndexedDB não estiver disponível;
- observar toasts de falha de storage quando possível.

### 5.4 I18n

- alternar PT/EN;
- verificar placeholders;
- verificar mood select;
- verificar tooltips da caneta e fullscreen;
- validar links legais por idioma.

### 5.5 Import/export

- exportar Markdown;
- importar o mesmo arquivo;
- exportar nota com traços;
- imprimir nota com e sem traços.

### 5.6 Shell

- abrir/fechar sidebar em desktop;
- abrir/fechar drawer em mobile;
- testar `Escape`;
- testar fullscreen.

## 6. Estratégia recomendada de refactor

### 6.1 Ordem segura

1. extrair subsistema mantendo API pública;
2. validar com checklist manual;
3. atualizar `cspec`;
4. só depois simplificar chamadas internas.

### 6.2 Ordem insegura

Não é recomendado mudar ao mesmo tempo:

- estrutura do preview;
- contrato de impressão;
- modelo de traços;
- geometria do overlay.

Esses quatro eixos são altamente acoplados.

## 7. Meta de evolução

O alvo não é apenas “organizar arquivos”, e sim preservar os pontos fortes do produto:

- sensação de caderno;
- local-first real;
- mistura de texto, fórmula e manuscrito;
- operação simples e confiável.

Qualquer modernização deve ser julgada por esses critérios, não apenas por limpeza estrutural.
