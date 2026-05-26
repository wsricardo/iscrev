# Especificação Técnica — 07. Sistema de Internacionalização (i18n)

Este documento especifica o funcionamento do sistema de internacionalização (i18n) da aplicação de diário.

---

## 1. Visão Geral

O sistema de i18n é responsável por traduzir a interface do usuário entre Português (pt) e Inglês (en). Ele opera inteiramente no lado do cliente, sem recarregar a página, e persiste a preferência de idioma do usuário.

## 2. Dicionário de Traduções

As traduções são armazenadas em um único objeto JavaScript estático, `I18N`, que contém sub-objetos para cada idioma.

```javascript
var I18N = {
  pt: {
    'btn.new': 'Nova Entrada',
    'mode.edit': 'Editar',
    // ...
  },
  en: {
    'btn.new': 'New Entry',
    'mode.edit': 'Edit',
    // ...
  }
};
```

## 3. Função de Tradução `t(key)`

A função `t(key: string): string` é o ponto central para obter uma string traduzida. Ela implementa uma estratégia de fallback triplo:

1.  Tenta encontrar a `key` no dicionário do idioma atualmente ativo (`I18N[currentLang]`).
2.  Se não encontrar, tenta encontrar a `key` no dicionário de português (`I18N.pt`), que serve como fallback padrão.
3.  Se ainda assim não encontrar, retorna a própria `key` como string.

Este comportamento garante que a interface nunca exiba `undefined` ou quebre por uma chave de tradução ausente.

## 4. Aplicação da Localização `applyLocale(lang)`

A função `applyLocale(lang: 'pt' | 'en')` orquestra a atualização de toda a UI quando o idioma é trocado.

1.  **Persistência:** O idioma selecionado é salvo em `localStorage['diario_lang']`.
2.  **Atualização do DOM:** Em vez de uma varredura global por atributos `data-i18n`, a função percorre um mapa explícito e predefinido (`TEXT_MAP`). Este mapa associa IDs de elementos a chaves de tradução. Esta abordagem é mais performática e fácil de auditar, pois toca apenas os elementos que precisam ser alterados.
3.  **Componentes Dinâmicos:** A função também é responsável por reconstruir componentes dinâmicos que contêm texto, como as opções do seletor de humor (`#mood-select`) e a barra de ferramentas da caneta (`Pen.buildToolbar()`).
4.  **Estabilidade de Layout:** Para evitar que a UI "salte" quando os textos dos botões mudam de comprimento (ex: "Salvar" vs "Save"), os botões possuem um `min-width` em CSS, calculado para acomodar a tradução mais longa.

## 5. Detecção Inicial

Na primeira vez que o aplicativo é carregado, o idioma é determinado na seguinte ordem de prioridade:

1.  Verifica se há um idioma salvo em `localStorage['diario_lang']`.
2.  Se não houver, verifica o idioma do navegador (`navigator.language`). Se começar com `'pt'`, usa português.
3.  Caso contrário, o padrão é inglês.