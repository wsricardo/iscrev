import os
import re

css_code = """
/* Ecosystem Section & Modal */
.ecosystem-section {
    padding: 40px;
    border: 1px solid var(--border);
    border-radius: var(--radius-xl);
    background: linear-gradient(135deg, rgba(251,247,239,0.9) 0%, rgba(245,239,224,0.8) 100%);
    box-shadow: var(--shadow-soft);
    margin-bottom: 28px;
    text-align: center;
}

.ecosystem-section h2 {
    font-size: clamp(2rem, 3vw, 2.8rem);
    color: var(--ink);
    margin-bottom: 12px;
}

.ecosystem-section p.lead {
    color: var(--ink-soft);
    max-width: 60ch;
    margin: 0 auto 30px auto;
    line-height: 1.7;
}

.eco-slider {
    display: flex;
    overflow-x: auto;
    gap: 20px;
    padding-bottom: 20px;
    scroll-snap-type: x mandatory;
    scrollbar-width: thin;
    scrollbar-color: var(--warm) transparent;
}

.eco-card {
    flex: 0 0 calc(33.333% - 14px);
    scroll-snap-align: center;
    border-radius: var(--radius-lg);
    overflow: hidden;
    border: 1px solid rgba(139,58,31,0.15);
    background: #fff;
    box-shadow: 0 8px 16px rgba(0,0,0,0.05);
    min-width: 280px;
}

.eco-card img {
    width: 100%;
    height: 200px;
    object-fit: cover;
    display: block;
}

.eco-card-content {
    padding: 15px;
    text-align: left;
}

.eco-card-content h3 {
    font-size: 1.1rem;
    margin-bottom: 5px;
    color: var(--rust);
}

.eco-card-content p {
    font-size: 0.9rem;
    color: var(--ink-soft);
    line-height: 1.4;
}

.btn-custom-author {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    padding: 14px 24px;
    margin-top: 20px;
    border-radius: 50px;
    background: linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%);
    color: #fff;
    font-weight: 600;
    font-family: 'JetBrains Mono', monospace;
    font-size: 1rem;
    border: 2px solid rgba(255,255,255,0.1);
    box-shadow: 0 10px 20px rgba(0,0,0,0.15);
    cursor: pointer;
    transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
}

.btn-custom-author:hover {
    transform: translateY(-2px);
    box-shadow: 0 15px 25px rgba(0,0,0,0.2);
    background: linear-gradient(135deg, var(--rust) 0%, var(--warm) 100%);
}

.btn-custom-author svg {
    width: 20px;
    height: 20px;
    fill: currentColor;
}

/* Author Modal */
.glass-dialog {
    border: 1px solid rgba(139,58,31,0.2);
    border-radius: var(--radius-xl);
    background: rgba(251,247,239,0.95);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    box-shadow: 0 25px 50px rgba(0,0,0,0.15);
    padding: 0;
    width: 90%;
    max-width: 800px;
    color: var(--ink);
}

.glass-dialog::backdrop {
    background: rgba(0,0,0,0.5);
    backdrop-filter: blur(4px);
}

.dialog-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 30px;
    border-bottom: 1px solid rgba(139,58,31,0.1);
    background: rgba(255,255,255,0.5);
}

.dialog-header h3 {
    margin: 0;
    font-size: 1.5rem;
    color: var(--rust);
}

.close-btn {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: var(--ink-soft);
    transition: color 0.2s;
}

.close-btn:hover {
    color: var(--rust);
}

.dialog-content {
    padding: 30px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 30px;
}

.dialog-section h4 {
    font-family: 'Playfair Display', serif;
    font-size: 1.3rem;
    margin-bottom: 15px;
    color: var(--ink);
}

.dialog-section p {
    font-size: 0.95rem;
    line-height: 1.6;
    color: var(--ink-soft);
    margin-bottom: 15px;
}

.social-links {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
}

.social-link {
    padding: 8px 12px;
    border-radius: var(--radius-sm);
    background: rgba(200,132,58,0.15);
    color: var(--rust);
    text-decoration: none;
    font-size: 0.85rem;
    font-family: 'JetBrains Mono', monospace;
    transition: background 0.2s, color 0.2s;
}

.social-link:hover {
    background: var(--warm);
    color: #fff;
}

@media (max-width: 768px) {
    .dialog-content {
        grid-template-columns: 1fr;
    }
    .eco-card {
        flex: 0 0 calc(85%);
    }
}
"""

js_code = """
document.addEventListener('DOMContentLoaded', () => {
    const authorModal = document.getElementById('author-modal');
    const openBtn = document.getElementById('btn-open-author');
    const closeBtn = document.getElementById('btn-close-author');

    if (openBtn && authorModal) {
        openBtn.addEventListener('click', () => {
            authorModal.showModal();
        });
    }

    if (closeBtn && authorModal) {
        closeBtn.addEventListener('click', () => {
            authorModal.close();
        });
    }
    
    if (authorModal) {
        authorModal.addEventListener('click', (e) => {
            const dialogDimensions = authorModal.getBoundingClientRect()
            if (
                e.clientX < dialogDimensions.left ||
                e.clientX > dialogDimensions.right ||
                e.clientY < dialogDimensions.top ||
                e.clientY > dialogDimensions.bottom
            ) {
                authorModal.close();
            }
        });
    }
});
"""

html_ecosystem_en = """
            <section class="ecosystem-section">
                <h2>Explore the iScrev Ecosystem</h2>
                <p class="lead">From writing to teaching, iScrev provides the calm and focus you need to excel in your daily routines.</p>
                
                <div class="eco-slider">
                    <article class="eco-card">
                        <img src="assets/img/iscrev_use_case_1.png" alt="Studying in a cozy cafe">
                        <div class="eco-card-content">
                            <h3>Study & Reflection</h3>
                            <p>Perfect for reading, studying and organizing ideas in a comfortable atmosphere.</p>
                        </div>
                    </article>
                    <article class="eco-card">
                        <img src="assets/img/iscrev_use_case_2.png" alt="Teaching with digital whiteboard">
                        <div class="eco-card-content">
                            <h3>Teach & Present</h3>
                            <p>Use iScrev XBoard to dynamically present and draw concepts in classrooms.</p>
                        </div>
                    </article>
                    <article class="eco-card">
                        <img src="assets/img/iscrev_use_case_3.png" alt="Creative work late at night">
                        <div class="eco-card-content">
                            <h3>Create & Focus</h3>
                            <p>Ideal for programmers and artists working late on personal projects.</p>
                        </div>
                    </article>
                </div>

                <button id="btn-open-author" class="btn-custom-author">
                    <svg viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                    Meet the Ecosystem & Author
                </button>
            </section>
"""

html_ecosystem_pt = """
            <section class="ecosystem-section">
                <h2>Explore o Ecossistema iScrev</h2>
                <p class="lead">Da escrita ao ensino, o iScrev oferece a calma e o foco que você precisa para se destacar na sua rotina.</p>
                
                <div class="eco-slider">
                    <article class="eco-card">
                        <img src="assets/img/iscrev_use_case_1.png" alt="Estudando num café aconchegante">
                        <div class="eco-card-content">
                            <h3>Estudo & Reflexão</h3>
                            <p>Perfeito para ler, estudar e organizar ideias em um ambiente confortável.</p>
                        </div>
                    </article>
                    <article class="eco-card">
                        <img src="assets/img/iscrev_use_case_2.png" alt="Ensinando com lousa digital">
                        <div class="eco-card-content">
                            <h3>Ensino & Apresentação</h3>
                            <p>Use a Lousa iScrev XBoard para desenhar e apresentar conceitos em aulas.</p>
                        </div>
                    </article>
                    <article class="eco-card">
                        <img src="assets/img/iscrev_use_case_3.png" alt="Trabalho criativo noturno">
                        <div class="eco-card-content">
                            <h3>Criação & Foco</h3>
                            <p>Ideal para programadores e artistas trabalhando até tarde em projetos pessoais.</p>
                        </div>
                    </article>
                </div>

                <button id="btn-open-author" class="btn-custom-author">
                    <svg viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                    Conheça o Ecossistema e o Autor
                </button>
            </section>
"""

html_modal_en = """
    <!-- Author Modal -->
    <dialog id="author-modal" class="glass-dialog">
        <header class="dialog-header">
            <h3>About the Project & Creator</h3>
            <button id="btn-close-author" class="close-btn">&times;</button>
        </header>
        <div class="dialog-content">
            <div class="dialog-section">
                <h4>The iScrev Ecosystem</h4>
                <p><strong>iScrev Notes</strong> and <strong>iScrev XBoard</strong> were born from the need to unify text, mathematical formulas, and sketches without breaking the creative momentum.</p>
                <p>Instead of fragmented tools, we offer a cohesive experience inspired by classic notebooks, designed for students, teachers, and professionals.</p>
            </div>
            <div class="dialog-section" style="border-left: 1px solid rgba(139,58,31,0.1); padding-left: 20px;">
                <h4>Wandeson Ricardo (Author)</h4>
                <p>Inspired by Da Vinci and polymathy, WSRicardo is an independent developer, researcher, and artist. His work spans from Anatomy to Algorithms, Calculus to Visual Arts.</p>
                <p>Support his independent projects or discover his portfolio and channels below:</p>
                <div class="social-links">
                    <a href="https://www.wsricardo.com.br" target="_blank" class="social-link">Portfolio</a>
                    <a href="https://github.com/wsricardo" target="_blank" class="social-link">GitHub</a>
                    <a href="https://www.youtube.com/@dimensaoalfa" target="_blank" class="social-link">YouTube (Science)</a>
                    <a href="https://www.youtube.com/@WSRicardoArte" target="_blank" class="social-link">YouTube (Arts)</a>
                    <a href="https://apoia.se/wsricardo" target="_blank" class="social-link" style="background: var(--warm); color: white;">Apoia.se</a>
                </div>
            </div>
        </div>
    </dialog>
"""

html_modal_pt = """
    <!-- Author Modal -->
    <dialog id="author-modal" class="glass-dialog">
        <header class="dialog-header">
            <h3>Sobre o Projeto e o Criador</h3>
            <button id="btn-close-author" class="close-btn">&times;</button>
        </header>
        <div class="dialog-content">
            <div class="dialog-section">
                <h4>Ecossistema iScrev</h4>
                <p>O <strong>iScrev Notes</strong> e a lousa <strong>iScrev XBoard</strong> nasceram da necessidade de unificar texto, fórmulas matemáticas e desenhos sem quebrar o ritmo criativo.</p>
                <p>Ao invés de ferramentas fragmentadas, oferecemos uma experiência coesa inspirada em cadernos clássicos, pensada para estudantes, professores e profissionais.</p>
            </div>
            <div class="dialog-section" style="border-left: 1px solid rgba(139,58,31,0.1); padding-left: 20px;">
                <h4>Wandeson Ricardo (Autor)</h4>
                <p>Inspirado por Da Vinci e pela polimatia, WSRicardo é desenvolvedor independente, pesquisador e artista. Seu trabalho vai da Anatomia aos Algoritmos, do Cálculo às Artes Visuais.</p>
                <p>Apoie os projetos independentes ou conheça o portfólio completo e os canais do autor:</p>
                <div class="social-links">
                    <a href="https://www.wsricardo.com.br" target="_blank" class="social-link">Portfólio Oficial</a>
                    <a href="https://github.com/wsricardo" target="_blank" class="social-link">GitHub</a>
                    <a href="https://www.youtube.com/@dimensaoalfa" target="_blank" class="social-link">YouTube (Ciência)</a>
                    <a href="https://www.youtube.com/@WSRicardoArte" target="_blank" class="social-link">YouTube (Artes)</a>
                    <a href="https://apoia.se/wsricardo" target="_blank" class="social-link" style="background: var(--warm); color: white;">Apoiar Projeto</a>
                </div>
            </div>
        </div>
    </dialog>
"""

src_dir = r"c:\Users\wsric\iscrev\src"

# 1. Append CSS
with open(os.path.join(src_dir, 'assets', 'css', 'style.css'), 'a', encoding='utf-8') as f:
    f.write(css_code)

# 2. Append JS
with open(os.path.join(src_dir, 'assets', 'js', 'site-nav.js'), 'a', encoding='utf-8') as f:
    f.write(js_code)

# 3. Inject HTML into index.html
with open(os.path.join(src_dir, 'index.html'), 'r', encoding='utf-8') as f:
    content_en = f.read()

if 'ecosystem-section' not in content_en:
    content_en = content_en.replace('<section class="main-section main-section-blog">', html_ecosystem_en + '\n<section class="main-section main-section-blog">')
if 'author-modal' not in content_en:
    content_en = content_en.replace('</body>', html_modal_en + '\n</body>')

with open(os.path.join(src_dir, 'index.html'), 'w', encoding='utf-8') as f:
    f.write(content_en)

# 4. Inject HTML into pt.html
with open(os.path.join(src_dir, 'pt.html'), 'r', encoding='utf-8') as f:
    content_pt = f.read()

if 'ecosystem-section' not in content_pt:
    content_pt = content_pt.replace('<section class="main-section main-section-blog">', html_ecosystem_pt + '\n<section class="main-section main-section-blog">')
if 'author-modal' not in content_pt:
    content_pt = content_pt.replace('</body>', html_modal_pt + '\n</body>')

with open(os.path.join(src_dir, 'pt.html'), 'w', encoding='utf-8') as f:
    f.write(content_pt)

print("Injected HTML, CSS, and JS successfully.")
