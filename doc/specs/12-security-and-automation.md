# CSpec 12 — Segurança, Privacidade e Automação

## 1. Padrões de Segurança (Frontend)

Devido ao escopo *Local-first*, o risco de invasões de banco de dados tradicionais é inexistente. O foco de segurança primário do ecossistema é o *Cross-Site Scripting (XSS)*.

### 1.1 Defesa contra XSS (iScrev Notes)

A *engine* responsável pela visualização das notas (`src/assets/js/diario/editor/markdown.js`) sanitiza a entrada Markdown rigorosamente no cliente:
*   As tags HTML não documentadas e links interativos passam por regras ativas de bloqueio.
*   Links e URLs são capturados pela rotina de verificação assíncrona que converte vetores (ex: `javascript:alert('xss')` ou `data:text/html,...`) para âncoras inofensivas (`#`).
*   Imagens injetadas via URL evitam a execução paralela de payloads em `onerror` ou protocolos não HTTP(S).

## 2. PWA e Resiliência (Service Worker)

Ambas as aplicações garantem *fallback* progressivo.
Os Service Workers de ambas as vias (`service-worker.js` e `xboard/sw.js`) adotam a tática **Stale-While-Revalidate**, porém contendo validações rígidas de Promessa (Promise):

*   Sempre que a aplicação tenta renovar o cache, se a API `fetch` colapsar devido à falta de rede (desconexão ou modo avião do usuário), a cadeia de chamadas lança um `.catch()` preventivo.
*   Esse `catch` não propaga exceções, instruindo a Engine do Browser a renderizar confiavelmente o conteúdo cacheadamente inativo, certificando acesso *offline-first* impecável.

## 3. Automação e Deployments

### 3.1 Portabilidade Cross-Machine

Os scripts operacionais da plataforma (`build_blog.py`, `inject_index.py`, etc) situados na raiz do repositório operam livremente em qualquer ambiente, sistema operacional ou pipeline CI/CD:
*   Utilizam caminhos relativos construídos semanticamente via `os.path.dirname(os.path.abspath(__file__))`. Nenhum script confia no caminho arbitrário `C:/Users/...`.

### 3.2 Sincronização Segura de Dados

Durante os builds estáticos gerados pelo *Pelican*, as árvores sintáticas e assets (`images`, `blog`, `pt`) são copiadas com flags de sobrescrita brandas (`dirs_exist_ok=True` em ambientes Python >3.8) em substituição a lógicas destrutivas arriscadas como a aniquilação incondicional da pasta-destino (`shutil.rmtree`), o que impedia bloqueios de I/O em ambientes Microsoft Windows.

## 4. Políticas de Dados

O iScrev abdicou de telemetrias furtivas, *fingerprinting* em massa e *tracking* comportamental intrusivo. Os dados financeiros de doação (via Stripe ou Pix) são delegados a instâncias operacionais separadas (sem exposição de PII no front-end em adequação às normas GDPR e LGPD). O código cliente (`support.js`) abstém-se da hardcodificação de dados não institucionais.
