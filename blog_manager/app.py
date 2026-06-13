from flask import Flask, render_template, request, redirect, url_for, flash, jsonify
from deep_translator import GoogleTranslator
import os
import frontmatter
import subprocess
from datetime import datetime

app = Flask(__name__)
app.secret_key = "iscrev_secret_key_cms"

CONTENT_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'pelican', 'content')
PELICAN_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'pelican')

def parse_pelican_file(filepath):
    metadata = {}
    body_lines = []
    with open(filepath, 'r', encoding='utf-8') as f:
        lines = f.readlines()
        
    in_body = False
    for i, line in enumerate(lines):
        if in_body:
            body_lines.append(line)
            continue
            
        if line.strip() == '':
            in_body = True
            continue
            
        if ':' in line:
            key, val = line.split(':', 1)
            metadata[key.strip()] = val.strip()
        else:
            in_body = True
            body_lines.append(line)
            
    return metadata, ''.join(body_lines)

def save_pelican_file(filepath, metadata, body):
    with open(filepath, 'w', encoding='utf-8') as f:
        for key, val in metadata.items():
            f.write(f"{key}: {val}\n")
        f.write("\n")
        f.write(body)

def get_posts():
    posts = {}
    for filename in os.listdir(CONTENT_DIR):
        if not filename.endswith(".md"):
            continue
        
        filepath = os.path.join(CONTENT_DIR, filename)
        metadata, _ = parse_pelican_file(filepath)
        
        slug = metadata.get('Slug', filename.replace('-pt.md', '').replace('.md', ''))
        lang = metadata.get('Lang', 'en').lower()
        
        if slug not in posts:
            posts[slug] = {'slug': slug, 'title_en': '', 'title_pt': ''}
            
        if lang == 'pt':
            posts[slug]['title_pt'] = metadata.get('Title', '')
        else:
            posts[slug]['title_en'] = metadata.get('Title', '')
            
    return list(posts.values())

@app.route('/')
def index():
    posts = get_posts()
    return render_template('index.html', posts=posts)

@app.route('/create', methods=['GET', 'POST'])
def create():
    if request.method == 'POST':
        slug = request.form['slug']
        title_en = request.form['title_en']
        content_en = request.form['content_en']
        title_pt = request.form['title_pt']
        content_pt = request.form['content_pt']
        date_str = datetime.now().strftime("%Y-%m-%d %H:%M")
        
        meta_en = {'Title': title_en, 'Slug': slug, 'Date': date_str, 'Lang': 'en'}
        meta_pt = {'Title': title_pt, 'Slug': slug, 'Date': date_str, 'Lang': 'pt'}
        
        save_pelican_file(os.path.join(CONTENT_DIR, f"{slug}.md"), meta_en, content_en)
        save_pelican_file(os.path.join(CONTENT_DIR, f"{slug}-pt.md"), meta_pt, content_pt)
            
        flash("Postagem criada com sucesso!")
        return redirect(url_for('index'))
        
    return render_template('create.html', is_edit=False, slug='', title_en='', content_en='', title_pt='', content_pt='')

def find_post_files(target_slug):
    en_path = None
    pt_path = None
    for filename in os.listdir(CONTENT_DIR):
        if not filename.endswith(".md"):
            continue
        filepath = os.path.join(CONTENT_DIR, filename)
        metadata, _ = parse_pelican_file(filepath)
        slug = metadata.get('Slug', filename.replace('-pt.md', '').replace('.md', ''))
        lang = metadata.get('Lang', 'en').lower()
        if slug == target_slug:
            if lang == 'pt':
                pt_path = filepath
            else:
                en_path = filepath
                
    if not en_path:
        en_path = os.path.join(CONTENT_DIR, f"{target_slug}.md")
    if not pt_path:
        pt_path = os.path.join(CONTENT_DIR, f"{target_slug}-pt.md")
        
    return en_path, pt_path

@app.route('/edit/<slug>', methods=['GET', 'POST'])
def edit(slug):
    en_path, pt_path = find_post_files(slug)
    
    if request.method == 'POST':
        title_en = request.form['title_en']
        content_en = request.form['content_en']
        title_pt = request.form['title_pt']
        content_pt = request.form['content_pt']
        
        if os.path.exists(en_path):
            meta_en, _ = parse_pelican_file(en_path)
            meta_en['Title'] = title_en
        else:
            meta_en = {'Title': title_en, 'Slug': slug, 'Lang': 'en', 'Date': datetime.now().strftime("%Y-%m-%d %H:%M")}
            
        if os.path.exists(pt_path):
            meta_pt, _ = parse_pelican_file(pt_path)
            meta_pt['Title'] = title_pt
        else:
            meta_pt = {'Title': title_pt, 'Slug': slug, 'Lang': 'pt', 'Date': datetime.now().strftime("%Y-%m-%d %H:%M")}
            
        save_pelican_file(en_path, meta_en, content_en)
        save_pelican_file(pt_path, meta_pt, content_pt)
            
        flash("Postagem salva com sucesso!")
        return redirect(url_for('index'))
        
    title_en = content_en = title_pt = content_pt = ""
    if os.path.exists(en_path):
        meta, body = parse_pelican_file(en_path)
        title_en = meta.get('Title', '')
        content_en = body
    if os.path.exists(pt_path):
        meta, body = parse_pelican_file(pt_path)
        title_pt = meta.get('Title', '')
        content_pt = body
        
    return render_template('create.html', is_edit=True, slug=slug, title_en=title_en, content_en=content_en, title_pt=title_pt, content_pt=content_pt)

@app.route('/build', methods=['POST'])
def build():
    import subprocess
    import shutil
    try:
        subprocess.run(['pelican', 'content', '-s', 'pelicanconf.py'], cwd=PELICAN_DIR, check=True)
        
        # Sincronizar o blog gerado para a pasta src para facilitar o desenvolvimento local
        src_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'src')
        docs_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'docs')
        
        # Copia docs/blog -> src/blog
        if os.path.exists(os.path.join(docs_dir, 'blog')):
            if os.path.exists(os.path.join(src_dir, 'blog')):
                shutil.rmtree(os.path.join(src_dir, 'blog'))
            shutil.copytree(os.path.join(docs_dir, 'blog'), os.path.join(src_dir, 'blog'))
            
        # Copia docs/pt/blog -> src/pt/blog
        if os.path.exists(os.path.join(docs_dir, 'pt', 'blog')):
            if not os.path.exists(os.path.join(src_dir, 'pt')):
                os.makedirs(os.path.join(src_dir, 'pt'))
            if os.path.exists(os.path.join(src_dir, 'pt', 'blog')):
                shutil.rmtree(os.path.join(src_dir, 'pt', 'blog'))
            shutil.copytree(os.path.join(docs_dir, 'pt', 'blog'), os.path.join(src_dir, 'pt', 'blog'))
            
        # Copia docs/images -> src/images
        if os.path.exists(os.path.join(docs_dir, 'images')):
            if os.path.exists(os.path.join(src_dir, 'images')):
                shutil.rmtree(os.path.join(src_dir, 'images'))
            shutil.copytree(os.path.join(docs_dir, 'images'), os.path.join(src_dir, 'images'))
            
        flash("Site gerado com sucesso para docs/ e sincronizado com src/!")
    except subprocess.CalledProcessError as e:
        flash(f"Erro ao gerar o site: {e}")
    return redirect(url_for('index'))

@app.route('/api/translate', methods=['POST'])
def translate_api():
    data = request.json
    if not data or 'text' not in data:
        return jsonify({'error': 'No text provided'}), 400
        
    text = data['text']
    if not text.strip():
        return jsonify({'translated': ''})
        
    try:
        translator = GoogleTranslator(source='pt', target='en')
        # Translate handles chunks up to 5000 chars, which is usually enough.
        # If it's larger, we might need to split it, but for simple blog posts this is fine.
        translated = translator.translate(text)
        return jsonify({'translated': translated})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5001)
