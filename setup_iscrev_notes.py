import os
import shutil

TARGET_REPO = r'C:\Users\wsric\GitHub\iscrev-notes'
SRC_DIR = os.path.join(TARGET_REPO, 'src')

if not os.path.exists(SRC_DIR):
    print(f"Directory {SRC_DIR} does not exist.")
    exit(1)

# 1. Clean HTML files in src/
# Keep only diario.html, manifest.json, service-worker.js and docs (like DOCUMENTACAO.md)
html_to_keep = ['diario.html', 'manifest.json', 'service-worker.js', 'DOCUMENTACAO.md', 'iScrev-Notes-Historico-Tecnico.md']
for f in os.listdir(SRC_DIR):
    filepath = os.path.join(SRC_DIR, f)
    if os.path.isfile(filepath) and f.endswith('.html') and f not in html_to_keep:
        os.remove(filepath)
        print(f"Removed {f}")

# 2. Clean CSS files
css_dir = os.path.join(SRC_DIR, 'assets', 'css')
if os.path.exists(css_dir):
    for f in os.listdir(css_dir):
        if f != 'diario.css':
            filepath = os.path.join(css_dir, f)
            if os.path.isfile(filepath):
                os.remove(filepath)
                print(f"Removed CSS {f}")

# 3. Clean JS files
js_dir = os.path.join(SRC_DIR, 'assets', 'js')
if os.path.exists(js_dir):
    for f in os.listdir(js_dir):
        filepath = os.path.join(js_dir, f)
        if os.path.isfile(filepath) and f not in ['diario.js', 'package.json']:
            os.remove(filepath)
            print(f"Removed JS {f}")

# 4. Clean up other directories if any (like `todos` which is an example dir)
todos_dir = os.path.join(SRC_DIR, 'todos')
if os.path.exists(todos_dir):
    shutil.rmtree(todos_dir)
    print("Removed 'todos' directory")


# 5. Fix service-worker.js
sw_path = os.path.join(SRC_DIR, 'service-worker.js')
if os.path.exists(sw_path):
    with open(sw_path, 'r', encoding='utf-8') as f:
        sw_content = f.read()

    old_assets = '''const ASSETS = [
    "./", "./diario.html", "./assets/css/diario.css", "./assets/css/style.css",
    "./assets/js/diario.js", "./assets/js/site-nav.js", "./assets/js/ui.js",
    "https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css",
    "https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.js",
    "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Lora:ital,wght@0,400;0,500;1,400&family=Dancing+Script:wght@600&family=JetBrains+Mono:wght@400;500&display=swap"
]'''

    new_assets = '''const ASSETS = [
    "./", "./diario.html", "./assets/css/diario.css",
    "./assets/js/diario.js",
    "https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css",
    "https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.js"
]'''

    sw_content = sw_content.replace(old_assets, new_assets)
    # Bump version
    sw_content = sw_content.replace('const CACHE = "iscrev-notes-v10.12"', 'const CACHE = "iscrev-notes-v11.0.0"')
    
    with open(sw_path, 'w', encoding='utf-8') as f:
        f.write(sw_content)
    print("Updated service-worker.js")


# 6. Create GitHub Actions Workflow
workflow_dir = os.path.join(TARGET_REPO, '.github', 'workflows')
os.makedirs(workflow_dir, exist_ok=True)

workflow_content = """name: Deploy to iScrev Docs

on:
  push:
    tags:
      - 'v*.*.*'  # Dispara apenas quando criar tag estilo v1.0.0
  workflow_dispatch:  # Permite disparar manualmente via botão no GitHub Actions

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout App Repository
        uses: actions/checkout@v4
        with:
          path: 'app-repo'

      - name: Checkout Website Repository
        uses: actions/checkout@v4
        with:
          repository: 'wsricardo/iscrev'  # Nome do repositorio institucional
          token: ${{ secrets.DEPLOY_TOKEN }}
          path: 'site-repo'

      - name: Sync App Files to Docs
        run: |
          echo "Copying files to docs directory..."
          
          # Root files from app-repo/src
          cp app-repo/src/diario.html site-repo/docs/
          cp app-repo/src/manifest.json site-repo/docs/
          cp app-repo/src/service-worker.js site-repo/docs/
          
          # CSS
          mkdir -p site-repo/docs/assets/css
          cp app-repo/src/assets/css/diario.css site-repo/docs/assets/css/
          
          # JS
          mkdir -p site-repo/docs/assets/js/diario
          cp app-repo/src/assets/js/diario.js site-repo/docs/assets/js/
          cp -r app-repo/src/assets/js/diario/* site-repo/docs/assets/js/diario/
          
          # Icones de imagem
          mkdir -p site-repo/docs/assets/img
          cp app-repo/src/assets/img/icon-192.png site-repo/docs/assets/img/ || true
          cp app-repo/src/assets/img/icon-512.png site-repo/docs/assets/img/ || true
          cp app-repo/src/assets/img/favicon.svg site-repo/docs/assets/img/ || true

      - name: Commit and Push to Website Repo
        run: |
          cd site-repo
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git add docs/
          
          # Apenas commit se houver mudancas
          if ! git diff-index --quiet HEAD; then
            git commit -m "chore: deploy iscrev-notes release ${{ github.ref_name }}"
            git push origin main
          else
            echo "No changes to deploy."
          fi
"""

with open(os.path.join(workflow_dir, 'deploy.yml'), 'w', encoding='utf-8') as f:
    f.write(workflow_content)
print("Created GitHub Actions workflow (.github/workflows/deploy.yml)")

