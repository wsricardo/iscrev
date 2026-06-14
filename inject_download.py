import os

html_download_en = """
            <section class="main-section download-section" style="display: grid; grid-template-columns: minmax(0, 1fr) minmax(300px, 1fr); gap: 40px; align-items: center; background: linear-gradient(135deg, rgba(200,132,58,0.1) 0%, rgba(139,58,31,0.05) 100%);">
                <div class="download-copy" style="padding-right: 20px;">
                    <p class="eyebrow">Get the App</p>
                    <h2 style="font-size: clamp(2rem, 3.4vw, 2.8rem); margin-bottom: 15px; color: var(--ink);">Download iScrev XBoard</h2>
                    <p style="color: var(--ink-soft); line-height: 1.8; margin-bottom: 25px;">
                        Take your teaching and presentations to the next level. Download the latest desktop version of iScrev XBoard for a fast, native digital whiteboard experience, or use it directly in your browser.
                    </p>
                    <div style="display: flex; gap: 15px; flex-wrap: wrap;">
                        <a href="https://github.com/wsricardo/iScrev-XBoard/releases/latest" target="_blank" class="button-primary" style="font-size: 1.05rem;">
                            <svg style="width:20px;height:20px;fill:currentColor;margin-right:5px;" viewBox="0 0 24 24"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>
                            Latest Release (GitHub)
                        </a>
                        <a href="xboard/index.html" target="_blank" class="button-secondary" style="font-size: 1.05rem;">Open Web App</a>
                    </div>
                </div>
                <div class="download-graphic" style="text-align: center;">
                    <img src="assets/img/iscrev_xboard_download.png" alt="iScrev XBoard Download" style="max-width: 100%; border-radius: var(--radius-xl); box-shadow: var(--shadow-soft); border: 1px solid rgba(139,58,31,0.1);">
                </div>
            </section>
"""

html_download_pt = """
            <section class="main-section download-section" style="display: grid; grid-template-columns: minmax(0, 1fr) minmax(300px, 1fr); gap: 40px; align-items: center; background: linear-gradient(135deg, rgba(200,132,58,0.1) 0%, rgba(139,58,31,0.05) 100%);">
                <div class="download-copy" style="padding-right: 20px;">
                    <p class="eyebrow">Baixe o Aplicativo</p>
                    <h2 style="font-size: clamp(2rem, 3.4vw, 2.8rem); margin-bottom: 15px; color: var(--ink);">Download iScrev XBoard</h2>
                    <p style="color: var(--ink-soft); line-height: 1.8; margin-bottom: 25px;">
                        Eleve o nível das suas aulas e apresentações. Baixe a versão desktop mais recente da Lousa iScrev XBoard para uma experiência nativa mais rápida, ou acesse diretamente do seu navegador.
                    </p>
                    <div style="display: flex; gap: 15px; flex-wrap: wrap;">
                        <a href="https://github.com/wsricardo/iScrev-XBoard/releases/latest" target="_blank" class="button-primary" style="font-size: 1.05rem;">
                            <svg style="width:20px;height:20px;fill:currentColor;margin-right:5px;" viewBox="0 0 24 24"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>
                            Último Release (GitHub)
                        </a>
                        <a href="xboard/index.html" target="_blank" class="button-secondary" style="font-size: 1.05rem;">Abrir Web App</a>
                    </div>
                </div>
                <div class="download-graphic" style="text-align: center;">
                    <img src="assets/img/iscrev_xboard_download.png" alt="Download iScrev XBoard" style="max-width: 100%; border-radius: var(--radius-xl); box-shadow: var(--shadow-soft); border: 1px solid rgba(139,58,31,0.1);">
                </div>
            </section>
"""

css_add = """
@media (max-width: 850px) {
    .download-section {
        grid-template-columns: 1fr !important;
        text-align: center;
    }
    .download-section .download-copy {
        padding-right: 0 !important;
    }
    .download-section .download-copy div {
        justify-content: center;
    }
}
"""

src_dir = r"c:\Users\wsric\iscrev\src"

# Update style.css
with open(os.path.join(src_dir, 'assets', 'css', 'style.css'), 'a', encoding='utf-8') as f:
    f.write(css_add)

# Inject in index.html
index_path = os.path.join(src_dir, 'index.html')
with open(index_path, 'r', encoding='utf-8') as f:
    content_en = f.read()

if 'download-section' not in content_en:
    content_en = content_en.replace('</section>\n            <section class="main-section main-section-blog">', '</section>\n' + html_download_en + '\n            <section class="main-section main-section-blog">')
    with open(index_path, 'w', encoding='utf-8') as f:
        f.write(content_en)

# Inject in pt.html
pt_path = os.path.join(src_dir, 'pt.html')
with open(pt_path, 'r', encoding='utf-8') as f:
    content_pt = f.read()

if 'download-section' not in content_pt:
    content_pt = content_pt.replace('</section>\n            <section class="main-section main-section-blog">', '</section>\n' + html_download_pt + '\n            <section class="main-section main-section-blog">')
    with open(pt_path, 'w', encoding='utf-8') as f:
        f.write(content_pt)

print("Injected Download Section successfully.")
