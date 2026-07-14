import os
import shutil

SOURCE_DIR = r'c:\Users\wsric\iscrev\src'
TARGET_DIR = r'c:\Users\wsric\iscrev-notes-export'

if not os.path.exists(TARGET_DIR):
    os.makedirs(TARGET_DIR)

def copy_file(src_rel, tgt_rel=None):
    if tgt_rel is None:
        tgt_rel = src_rel
    
    src_path = os.path.join(SOURCE_DIR, src_rel)
    tgt_path = os.path.join(TARGET_DIR, tgt_rel)
    
    if os.path.exists(src_path):
        os.makedirs(os.path.dirname(tgt_path), exist_ok=True)
        shutil.copy2(src_path, tgt_path)
        print(f"Copied {src_rel}")
    else:
        print(f"Warning: {src_rel} not found")

def copy_dir(src_rel, tgt_rel=None):
    if tgt_rel is None:
        tgt_rel = src_rel
    
    src_path = os.path.join(SOURCE_DIR, src_rel)
    tgt_path = os.path.join(TARGET_DIR, tgt_rel)
    
    if os.path.exists(src_path):
        if os.path.exists(tgt_path):
            shutil.rmtree(tgt_path)
        shutil.copytree(src_path, tgt_path)
        print(f"Copied directory {src_rel}")
    else:
        print(f"Warning: directory {src_rel} not found")

# Core App Files
copy_file('diario.html')
copy_file('manifest.json')
copy_file('service-worker.js')

# CSS
copy_file(os.path.join('assets', 'css', 'diario.css'))

# JS
copy_file(os.path.join('assets', 'js', 'diario.js'))
copy_dir(os.path.join('assets', 'js', 'diario'))

# Images (Icons mentioned in manifest)
copy_file(os.path.join('assets', 'img', 'icon-192.png'))
copy_file(os.path.join('assets', 'img', 'icon-512.png'))
copy_file(os.path.join('assets', 'img', 'favicon.svg'))

# Create GitHub Actions Workflow
workflow_dir = os.path.join(TARGET_DIR, '.github', 'workflows')
os.makedirs(workflow_dir, exist_ok=True)

workflow_content = """name: Deploy to iScrev Docs

on:
  push:
    tags:
      - 'v*.*.*'  # Trigger on version tags (e.g., v1.0.0)
  workflow_dispatch:  # Allow manual trigger

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
          repository: 'wsricardo/iscrev'  # Substitua se o repo for diferente
          token: ${{ secrets.DEPLOY_TOKEN }}
          path: 'site-repo'

      - name: Sync App Files to Docs
        run: |
          echo "Copying files to docs directory..."
          
          # Root files
          cp app-repo/diario.html site-repo/docs/
          cp app-repo/manifest.json site-repo/docs/
          cp app-repo/service-worker.js site-repo/docs/
          
          # CSS
          mkdir -p site-repo/docs/assets/css
          cp app-repo/assets/css/diario.css site-repo/docs/assets/css/
          
          # JS
          mkdir -p site-repo/docs/assets/js/diario
          cp app-repo/assets/js/diario.js site-repo/docs/assets/js/
          cp -r app-repo/assets/js/diario/* site-repo/docs/assets/js/diario/
          
          # Images
          mkdir -p site-repo/docs/assets/img
          cp app-repo/assets/img/icon-192.png site-repo/docs/assets/img/ || true
          cp app-repo/assets/img/icon-512.png site-repo/docs/assets/img/ || true
          cp app-repo/assets/img/favicon.svg site-repo/docs/assets/img/ || true

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
    
print("Export complete. Prepared GitHub Actions workflow.")
