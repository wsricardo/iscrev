# Análise da Seção 0 — Internacionalização (i18n)

> **Produto:** iScrev Notes  
> **Escopo:** Detalhamento técnico da Seção 0 de `diario.js`.  
> **Fontes:** `diario.js`, `DiarioJSAnalysis.md`, `MigrationPlan.md`

---

## 1. Resumo e Explicação

Esta seção é responsável por toda a lógica de tradução da interface do usuário (UI). Ela permite que o aplicativo alterne entre português ('pt') e inglês ('en') sem a necessidade de recarregar a página. A arquitetura se baseia em um dicionário estático e na manipulação direta do DOM para aplicar os textos, uma abordagem performática que evita seletores de atributo globais.

## 2. Funções e Dados

-   **`I18N` (Objeto)**: Um grande objeto que serve como dicionário, armazenando todos os textos da UI. É organizado por idioma (`pt`, `en`) e por chaves de tradução (ex: `'btn.new'`).

-   **`currentLang` (Variável)**: Armazena o idioma ativo ('pt' ou 'en'). Na primeira visita, detecta o idioma do navegador (`navigator.language`); nas visitas seguintes, lê o valor salvo no `localStorage['diario_lang']`.

-   **`t(key)`**:
    -   **Papel**: Função principal de tradução. Retorna a string de texto para uma chave específica no idioma atual.
    -   **Entrada**: `key` (String) - A chave de tradução (ex: `'toast.saved'`).
    -   **Saída**: (String) - O texto traduzido. Possui um sistema de fallback: se a chave não existe no idioma atual, tenta buscar em português. Se ainda assim falhar, retorna a própria chave, evitando que a UI quebre.

-   **`applyLocale(lang)`**:
    -   **Papel**: Função pública que serve como ponto de entrada para iniciar a aplicação de um novo idioma na UI.
    -   **Entrada**: `lang` (String) - O código do idioma a ser aplicado ('pt' ou 'en').
    -   **Saída**: Nenhuma.

-   **`doApply(lang)`**:
    -   **Papel**: O núcleo da lógica de tradução. É aqui que a mágica acontece.
    -   **Ações**:
        1.  Atualiza a variável `currentLang` e persiste a escolha no `localStorage`.
        2.  Define o atributo `lang` da tag `<html>` para acessibilidade.
        3.  Percorre um mapa estático `TEXT_MAP` (um array de `[id, chave, tipo]`) e atualiza o `textContent`, `placeholder` ou `title` de cada elemento do DOM.
        4.  Reconstrói componentes dinâmicos que dependem de texto, como o seletor de humor (`#mood-select`) e a barra de ferramentas da caneta (`Pen.buildToolbar()`).

## 3. Plano de Migração

Conforme o `MigrationPlan.md` (Fase 3), esta seção será extraída para o módulo **`ui/i18n.js`**.

-   **Objetivo**: Isolar completamente a lógica de tradução em um módulo coeso. O novo módulo exportará as funções `t()` e `applyLocale()`.
-   **Mudança Arquitetural**: A principal mudança será no desacoplamento. Em vez de `doApply` chamar diretamente funções de outros módulos (como `Pen.buildToolbar()` ou `renderList()`), a nova função `applyLocale` deverá se comunicar de forma indireta. A estratégia recomendada é emitir um evento customizado no `document` (ex: `new CustomEvent('language-changed')`). Outros módulos de UI (como `sidebar.js` ou `pen.js`) serão responsáveis por ouvir esse evento e se atualizarem conforme necessário. Isso quebra a dependência direta e torna a arquitetura mais robusta.