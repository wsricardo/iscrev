import os
import subprocess
import shutil

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PELICAN_DIR = os.path.join(BASE_DIR, "pelican")
src_dir = os.path.join(BASE_DIR, "src")
docs_dir = os.path.join(BASE_DIR, "docs")

subprocess.run(['pelican', 'content', '-s', 'pelicanconf.py'], cwd=PELICAN_DIR, check=True)

if os.path.exists(os.path.join(docs_dir, 'blog')):
    shutil.copytree(os.path.join(docs_dir, 'blog'), os.path.join(src_dir, 'blog'), dirs_exist_ok=True)
    
if os.path.exists(os.path.join(docs_dir, 'pt', 'blog')):
    if not os.path.exists(os.path.join(src_dir, 'pt')):
        os.makedirs(os.path.join(src_dir, 'pt'))
    if os.path.exists(os.path.join(docs_dir, 'pt', 'blog')):
        shutil.copytree(os.path.join(docs_dir, 'pt', 'blog'), os.path.join(src_dir, 'pt', 'blog'), dirs_exist_ok=True)
    
if os.path.exists(os.path.join(docs_dir, 'images')):
    shutil.copytree(os.path.join(docs_dir, 'images'), os.path.join(src_dir, 'images'), dirs_exist_ok=True)

print("Build and sync completed.")
