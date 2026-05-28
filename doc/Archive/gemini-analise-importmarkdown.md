### Análise da Função `importMarkdown()` em `src/assets/js/diario.js`
A função `importMarkdown()` é responsável por permitir que o usuário selecione um arquivo Markdown (`.md`, `.markdown`, `.txt`), leia seu conteúdo, extraia metadados (front matter YAML), anotações manuscritas em SVG (se presentes) e o corpo do texto, e então crie uma nova entrada no aplicativo com esses dados.
Ela está localizada em `src/assets/js/diario.js`, aproximadamente entre as linhas 2459 e 2550 do arquivo fornecido.
```javascript
function importMarkdown() {
 var input    = document.createElement('input');
 input.type   = 'file';
 input.accept = '.md,.markdown,.txt';
 input.addEventListener('change', function () {
    var file = input.files && input.files;
   if (!file) return;
   var reader = new FileReader();
   reader.onload = function (ev) {
     try {
       var raw = ev.target.result;
       /* ── 1. Front matter ───────────────────────────────────────── */
       var fmRegex  = /^---\r?\n([\s\S]*?)\r?\n---/;
       var fmMatch  = raw.match(fmRegex);
        var fm       = fmMatch ? fmMatch : '';
        var afterFm  = fmMatch ? raw.slice(fmMatch.length).trim() : raw.trim();
       /* ── 2. Título ─────────────────────────────────────────────── */
       /* Aceita "titulo:", "title:" ou qualquer chave que o i18n gere */
       var titleMatch = fm.match(/(?:^|\n)(?:titulo|title|[^:\n]+)\s*:\s*(.+)/i);
       /* Restringe: só pega a primeira linha que parece um título */
       titleMatch = fm.match(/(?:^|\n)(?:titulo|title)\s*:\s*(.+)/i);
        var title = titleMatch ? titleMatch.trim() : '';
       /* Fallback: primeiro heading do body */
       if (!title) {
         var hMatch = afterFm.match(/^#\s+(.+)/m);
          title = hMatch ? hMatch.trim() : file.name.replace(/\.(md|markdown|txt)$/i, '');
       }
       /* ── 3. Humor ──────────────────────────────────────────────── */
       var moodMatch = fm.match(/(?:^|\n)(?:humor|mood)\s*:\s*(.+)/i);
        var mood      = moodMatch ? moodMatch.trim() : '';
       if (mood === '\u2014' || mood === '-') mood = '';
       /* ── 4. Traços manuscritos ─────────────────────────────────── */
       var strokes      = [];
       var strokesMatch = fm.match(/(?:^|\n)pen_strokes\s*:\s*([A-Za-z0-9+/=]+)/);
       if (strokesMatch) {
         try {
            var decoded = JSON.parse(atob(strokesMatch.trim()));
           /* Verifica versão e estrutura antes de usar */
           if (decoded && decoded.v === 1 && Array.isArray(decoded.s)) {
             strokes = decoded.s;
           }
         } catch (decodeErr) {
           /* Strokes corrompidos: importa só o texto */
            console.warn('[Import Markdown] Erro ao decodificar traços manuscritos:', decodeErr); // Adicionado log de erro
           strokes = [];
         }
       }
       /* ── 5. Body ───────────────────────────────────────────────── */
       /* Remove o "# Título\n\n" que exportMarkdown adiciona no topo */
       var body = afterFm.replace(/^#[^\n]+\n\n?/, '').trim();
       /* ── 6. Cria e abre a entrada ──────────────────────────────── */
       var now   = new Date().toISOString();
       var entry = {
         id:        uid(),
         title:     title,
         body:      body,
         mood:      mood,
         strokes:   strokes,   /* Pen.load() (chamado em openEntry) sanitiza */
         createdAt: now,
         updatedAt: now
       };
       entries.unshift(entry);
        saveEntry_store(entry); // <--- ALTERADO: Usa a função de persistência correta
       openEntry(entry.id);    /* abre + chama Pen.load(entry.strokes) */
       showToast(t('toast.imported'));
     } catch (parseErr) {
       showToast(t('toast.importErr'));
     }
   };
   reader.onerror = function () {
     showToast(t('toast.importErr'));
   };
   reader.readAsText(file, 'utf-8');
 });
 /* Dispara o seletor de arquivo */
 input.click();
}
