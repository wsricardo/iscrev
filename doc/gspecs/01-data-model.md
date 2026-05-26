# Especificação Técnica — 01. Modelo de Dados

Este documento especifica as estruturas de dados fundamentais utilizadas pela aplicação iScrev Notes.

---

## 1. Interface `Entry`

A `Entry` representa uma única anotação no diário. É a unidade principal de dados persistida no armazenamento.

```typescript
interface Entry {
  id:        string;
  title:     string;
  body:      string;
  mood:      string;
  strokes:   Stroke[];
  createdAt: string;
  updatedAt: string;
}
```

### Campos

-   `id`: (`string`) Identificador único da entrada. Gerado por `uid()`, é uma string no formato `base36(Date.now())` concatenado com um sufixo aleatório, o que o torna ordenável por data de criação.
-   `title`: (`string`) O título da entrada em texto puro.
-   `body`: (`string`) O corpo da entrada, contendo Markdown e/ou sintaxe LaTeX.
-   `mood`: (`string`) Um único caractere emoji Unicode ou uma string vazia.
-   `strokes`: (`Stroke[]`) Um array de objetos `Stroke` que representam as anotações manuscritas.
-   `createdAt`: (`string`) Data de criação no formato ISO 8601. É imutável.
-   `updatedAt`: (`string`) Data da última modificação no formato ISO 8601. Atualizada a cada salvamento.

### Invariantes Críticas

1.  **Texto Bruto:** Os campos `title` e `body` **devem** sempre armazenar texto bruto (plain text). HTML nunca é persistido para evitar riscos de segurança (XSS) e garantir a legibilidade dos dados exportados. A conversão para HTML ocorre apenas em tempo de execução para a visualização.

## 2. Interface `Stroke`

A `Stroke` representa um único traço contínuo feito com a caneta.

```typescript
interface Stroke {
  pts: [number, number][];
  c:   string;
  w:   number;
}
```

### Campos

-   `pts`: (`Array<[number, number]>`) Um array de pares de coordenadas `[x, y]` que definem a geometria do traço. As coordenadas são inteiras e estão no espaço do documento (incluindo `scrollTop`). Os pontos são o resultado da simplificação pelo algoritmo Douglas-Peucker.
-   `c`: (`string`) A cor do traço, em formato hexadecimal (ex: `#1a1209`). O valor é sempre validado contra uma whitelist de cores predefinidas.
-   `w`: (`number`) A espessura (largura) do traço em pixels. O valor é sempre validado e limitado a um intervalo seguro (e.g., 0.5 a 8).

## 3. Chaves de Armazenamento

| Armazenamento | Chave / Store Name | Tipo | Conteúdo |
|---|---|---|---|
| IndexedDB | Banco: `meu_diario_db`, Store: `entries` | Object Store | Coleção de objetos `Entry`, com `id` como `keyPath`. |
| localStorage | `meu_diario_v2` | JSON String | `string` contendo o array de objetos `Entry`. Usado como fallback. |
| localStorage | `diario_lang` | String | O código do idioma ativo (`'pt'` ou `'en'`). |
| localStorage | `meu_diario_migrated` | String | Flag (`"1"`) que indica se os dados do `localStorage` já foram migrados para o IndexedDB. |

