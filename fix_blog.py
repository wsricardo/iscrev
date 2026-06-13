import re

def update_file(filepath, is_pt):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Unified replacement HTML
    title = 'Do Nosso Blog' if is_pt else 'From Our Blog'
    desc = 'Um espaço para compartilhar a jornada de desenvolvimento, as decisões de design e a filosofia que tornam o iScrev Notes uma ferramenta única.' if is_pt else 'A space to share the development journey, design decisions, and the philosophy that makes iScrev Notes a unique tool.'
    view_all = 'Ver todos os posts &rarr;' if is_pt else 'View all posts &rarr;'
    blog_url = '/pt/blog/' if is_pt else '/blog/'
    json_url = '/pt/blog/latest.json' if is_pt else '/blog/latest.json'
    loading_text = 'Carregando últimas postagens...' if is_pt else 'Loading latest posts...'
    empty_text = 'Nenhuma postagem recente encontrada.' if is_pt else 'No recent posts found.'
    error_text = 'Não foi possível carregar as postagens.' if is_pt else 'Could not load recent posts.'

    new_html = f'''<article class="card">
    <div class="card-content">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
            <h2 class="card-title" style="margin: 0;">{title}</h2>
            <a href="{blog_url}" style="color: var(--warm, #c8843a); text-decoration: none; font-weight: 500; font-family: 'Lora', serif;">{view_all}</a>
        </div>
        <p>{desc}</p>
        
        <hr class="card-divider" style="border: none; height: 1px; background-color: var(--line, #e0e0e0); margin: 1.5rem 0;">

        <div class="slider-container" style="position: relative;">
            <button class="slider-btn slider-prev" onclick="scrollSlider(-1)" aria-label="Previous posts">&larr;</button>
            
            <div class="slider-track" id="blog-slider-track" style="display: flex; overflow-x: auto; scroll-snap-type: x mandatory; gap: 20px; padding-bottom: 10px; scrollbar-width: none;">
                <div style="padding: 20px; text-align: center; width: 100%; color: #826262;">{loading_text}</div>
            </div>
            
            <button class="slider-btn slider-next" onclick="scrollSlider(1)" aria-label="Next posts">&rarr;</button>
        </div>
    </div>
</article>

<style>
    .slider-track::-webkit-scrollbar {{ display: none; }}
    .blog-card {{
        flex: 0 0 calc(100% / 1.2);
        scroll-snap-align: start;
        background: #FDF9F7;
        border: 1px solid rgba(99, 55, 55, 0.1);
        border-radius: 8px;
        padding: 20px;
        text-decoration: none;
        color: inherit;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        transition: transform 0.2s ease, box-shadow 0.2s ease;
    }}
    @media (min-width: 768px) {{
        .blog-card {{ flex: 0 0 calc(100% / 2.5 - 20px); }}
    }}
    .blog-card:hover {{
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(99, 55, 55, 0.08);
    }}
    .blog-card-title {{
        font-family: 'Playfair Display', serif;
        font-size: 1.25rem;
        color: var(--ink, #1a1209);
        margin: 0 0 12px 0;
        line-height: 1.3;
    }}
    .blog-card-date {{
        font-family: 'Lora', serif;
        font-size: 0.85rem;
        color: var(--rust, #8b3a1f);
        text-transform: uppercase;
        letter-spacing: 0.05em;
        font-weight: 500;
    }}
    .slider-btn {{
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        background: #fff;
        border: 1px solid rgba(99, 55, 55, 0.2);
        color: #633737;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 5px rgba(0,0,0,0.05);
        z-index: 2;
        font-size: 1.2rem;
    }}
    .slider-prev {{ left: -15px; }}
    .slider-next {{ right: -15px; }}
    .slider-btn:hover {{ background: #633737; color: #fff; }}
    @media (max-width: 768px) {{
        .slider-prev, .slider-next {{ display: none; }}
    }}
</style>

<script>
    function scrollSlider(direction) {{
        const track = document.getElementById('blog-slider-track');
        const scrollAmount = track.clientWidth > 768 ? track.clientWidth / 2.5 : track.clientWidth / 1.2;
        track.scrollBy({{ left: direction * scrollAmount, behavior: 'smooth' }});
    }}

    document.addEventListener('DOMContentLoaded', async () => {{
        try {{
            const response = await fetch('{json_url}');
            if (!response.ok) throw new Error('Could not fetch');
            const posts = await response.json();
            
            const track = document.getElementById('blog-slider-track');
            if (posts.length > 0) {{
                track.innerHTML = posts.map(post => `
                    <a href="${{post.url.startsWith('/pt') ? post.url : ( '{is_pt}'=='True' ? '/pt'+post.url : post.url )}}" class="blog-card">
                        <h3 class="blog-card-title">${{post.title}}</h3>
                        <span class="blog-card-date">${{post.date}}</span>
                    </a>
                `).join('');
            }} else {{
                track.innerHTML = '<div style="padding: 20px; text-align: center; width: 100%; color: #826262;">{empty_text}</div>';
            }}
        }} catch (e) {{
            document.getElementById('blog-slider-track').innerHTML = '<div style="padding: 20px; text-align: center; width: 100%; color: #826262;">{error_text}</div>';
        }}
    }});
</script>'''

    if is_pt:
        start_idx = content.find('<article class="card">')
        if start_idx != -1:
             slider_script_idx = content.find('scrollSlider', start_idx)
             end_idx = content.find('</script>', slider_script_idx) + 9
             
             # Replace the whole chunk:
             content = content[:start_idx] + new_html + content[end_idx:]
             
             # Also remove the wrapper of the new slider I had added if it's outside the script
             # We can do this cleanly by removing `</section>\n\n            <section class="section section-blog-slider">\n                <div class="section-content">`
             content = content.replace('</section>\n\n            <section class="section section-blog-slider">\n                <div class="section-content">', '')
             # remove trailing closure of the old slider wrapper
             content = content.replace('                </div>\n            </section>\n\n        </main>', '        </main>')
             content = content.replace('                </div>\n            </section>', '')
    else:
        start_idx = content.find('<section class="section section-blog-slider">')
        if start_idx != -1:
             slider_script_idx = content.find('scrollSlider', start_idx)
             end_idx = content.find('</script>', slider_script_idx) + 9
             content = content[:start_idx] + new_html + content[end_idx:]
             # The remaining closing tags from the old slider
             content = content.replace('                </div>\n            </section>\n\n        </main>', '        </main>')
             content = content.replace('                </div>\n            </section>', '')

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

update_file('c:/Users/wsric/iscrev/src/pt.html', True)
update_file('c:/Users/wsric/iscrev/src/index.html', False)
