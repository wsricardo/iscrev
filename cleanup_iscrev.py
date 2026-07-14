import os
import shutil

SRC_DIR = r'c:\Users\wsric\iscrev\src'

def delete_if_exists(rel_path):
    full_path = os.path.join(SRC_DIR, rel_path)
    if os.path.isfile(full_path):
        os.remove(full_path)
        print(f"Deleted file: {rel_path}")
    elif os.path.isdir(full_path):
        shutil.rmtree(full_path)
        print(f"Deleted directory: {rel_path}")
    else:
        print(f"Path not found: {rel_path}")

# Remove the app source files from the institutional repo
delete_if_exists('diario.html')
delete_if_exists('manifest.json')
delete_if_exists('service-worker.js')
delete_if_exists(os.path.join('assets', 'js', 'diario.js'))
delete_if_exists(os.path.join('assets', 'js', 'diario'))
delete_if_exists(os.path.join('assets', 'css', 'diario.css'))

# Do not delete assets/img/icon-192.png etc. because they might be used by the institutional site headers/favicons.

print("Cleanup complete in iscrev/src. The app is now fully separated.")
