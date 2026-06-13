import os
import subprocess
import shutil

PELICAN_DIR = r"c:\Users\wsric\iscrev\pelican"
src_dir = r"c:\Users\wsric\iscrev\src"
docs_dir = r"c:\Users\wsric\iscrev\docs"

subprocess.run(['pelican', 'content', '-s', 'pelicanconf.py'], cwd=PELICAN_DIR, check=True)

if os.path.exists(os.path.join(docs_dir, 'blog')):
    if os.path.exists(os.path.join(src_dir, 'blog')):
        shutil.rmtree(os.path.join(src_dir, 'blog'))
    shutil.copytree(os.path.join(docs_dir, 'blog'), os.path.join(src_dir, 'blog'))
    
if os.path.exists(os.path.join(docs_dir, 'pt', 'blog')):
    if not os.path.exists(os.path.join(src_dir, 'pt')):
        os.makedirs(os.path.join(src_dir, 'pt'))
    if os.path.exists(os.path.join(src_dir, 'pt', 'blog')):
        shutil.rmtree(os.path.join(src_dir, 'pt', 'blog'))
    shutil.copytree(os.path.join(docs_dir, 'pt', 'blog'), os.path.join(src_dir, 'pt', 'blog'))
    
if os.path.exists(os.path.join(docs_dir, 'images')):
    if os.path.exists(os.path.join(src_dir, 'images')):
        shutil.rmtree(os.path.join(src_dir, 'images'))
    shutil.copytree(os.path.join(docs_dir, 'images'), os.path.join(src_dir, 'images'))

print("Build and sync completed.")
