# CSpec 08 — Internacionalização e Conteúdo Localizado

## 1. Objetivo

Descrever o sistema de i18n atual e as regras para evolução segura do texto de interface.

## 2. Dicionário

O dicionário `I18N` é um objeto estático com pelo menos dois namespaces:

- `pt`
- `en`

As chaves cobrem:

- shell da sidebar;
- modos;
- toolbar textual;
- toolbar da caneta;
- estados vazios;
- labels legais;
- modal de equações;
- modal de apoio;
- feedbacks de toast;
- rótulos de humor;
- fullscreen;
- cópia do PIX.

## 3. Idioma inicial

`currentLang` é resolvido por:

1. `localStorage['diario_lang']`, se válido;
2. `navigator.language` iniciando com `pt`;
3. fallback `en`.

## 4. Resolução de chaves

`t(key)` aplica fallback triplo:

1. `I18N[currentLang][key]`
2. `I18N.pt[key]`
3. a própria `key`

Isto é requisito de resiliência e evita `undefined` na UI.

## 5. Aplicação de locale

`applyLocale(lang)` delega para `doApply(lang)`.

### 5.1 Efeitos de `doApply(lang)`

- atualiza `currentLang`;
- persiste `diario_lang`;
- atualiza `document.documentElement.lang`;
- percorre `TEXT_MAP`;
- traduz placeholders, textos e títulos;
- atualiza links legais por idioma;
- sincroniza botão da sidebar;
- reconstrói `#mood-select`;
- marca o botão de idioma ativo;
- atualiza label do botão Home;
- reconstrói `Pen.buildToolbar()`;
- atualiza estatísticas;
- re-renderiza a lista filtrada.

## 6. `TEXT_MAP`

`TEXT_MAP` é um array explícito de:

```ts
[elementId, translationKey, kind]
```

Onde `kind` pode ser:

- `text`
- `html`
- `ph`
- `title`

### 6.1 Requisito

Novos elementos traduzíveis devem ser adicionados explicitamente ao mapa ou cobertos por rotina equivalente igualmente auditável.

## 7. Componentes reconstruídos

Certos componentes não são apenas atualizados; eles são recriados:

- seletor de humor;
- toolbar da caneta;
- estado ativo dos botões de idioma.

Isto é importante porque textos de botões, `title` e `aria-label` podem depender do idioma.

## 8. Impacto em exportação

Na exportação Markdown:

- rótulos humanos do front matter são localizados;
- `pen_strokes` permanece fixo.

Isso significa que a camada de i18n influencia a legibilidade do arquivo, mas não deve quebrar a reimportação.

## 9. Impacto em layout

O CSS foi preparado para acomodar variação de largura textual entre PT e EN. Mudanças em cópia que aumentem significativamente o comprimento de labels devem revisar:

- botões de modo;
- botões principais;
- tooltips com `data-label`;
- toolbar da caneta;
- shell responsivo.

## 10. Regras para novas chaves

1. Toda nova chave deve existir em `pt` e `en`.
2. Se uma chave só existir em `pt`, o app ainda funciona, mas isso deve ser tratado como fallback temporário.
3. Novos textos que apareçam em botões devem considerar `title`, `aria-label` e, quando aplicável, `data-label`.
4. Chaves usadas em exportação ou parsing de arquivo exigem atenção especial para não alterar campos fixos de máquina.
