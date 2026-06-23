# CSpec 11 — Ecossistema e iScrev XBoard

## 1. iScrev XBoard (Lousa Digital)

O **iScrev XBoard** foi introduzido como o braço de ensino e colaboração visual do ecossistema iScrev. Diferente do *Notes* que é primariamente textual e voltado à reflexão pessoal, o *XBoard* é uma lousa de alto desempenho orientada à colaboração, exposição de ideias e aulas.

### 1.1 Arquitetura do Canvas

O motor principal reside em `src/xboard/js/core/canvas-engine.js` operando sobre Raster 2D (não SVG).
*   **Performance:** Desenho otimizado baseado em eventos de ponteiro inter-frame.
*   **Histórico:** Possui sua própria fila de `Undo/Redo` serializando `ImageData` nos limites de memória do navegador.

### 1.2 Recursos de Mídia

O XBoard provê extensibilidade multimídia nativa controlada por `media-viewer.js` e `recorder.js`:
*   **Apresentações e PDF:** Carregamento de apostilas em iframe/embed para anotação conjunta.
*   **Gravação Integrada:** Usa a API `MediaRecorder` em conjunto com a captura da stream do `<canvas>` e áudio do microfone do usuário para gerar `.webm` localmente, exportáveis via blob (zero backend).

### 1.3 Biblioteca e Armazenamento

Aulas finalizadas (`admin-panel.js`) têm seus `base64` gerados e alocados no `localStorage` sob a chave `xboard_lessons`. Como no *Notes*, todas as aulas pertencem à máquina local do usuário e nunca trafegam na rede sem o consentimento através de exportação manual.

## 2. Integração do Ecossistema

### 2.1 Separação de Preocupações

Embora *Notes* e *XBoard* compartilhem o domínio (`www.iscrev.com`) e o ethos *Local-first*, eles vivem arquiteturalmente separados. O *Notes* é acessado via `/diario.html` e o *XBoard* via `/xboard/`.
Eles não compartilham `IndexedDB` nem `localStorage`, permitindo total desacoplamento e mitigação de risco de corrupção de estado cruzada.

### 2.2 Ponto de Acesso

O usuário é capaz de transitar entre as soluções por meio do site institucional principal (`index.html`) e `pt.html`, que possuem seções dedicadas com chamadas claras orientadas a "Escrita Pessoal" (Notes) e "Colaboração Visual" (XBoard).
