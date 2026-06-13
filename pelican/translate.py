import os
import re
from googletrans import Translator

translator = Translator()
content_dir = r"c:\Users\wsric\iscrev\pelican\content"

for filename in os.listdir(content_dir):
    if filename.endswith(".md") and not filename.endswith("-pt.md") and not filename.endswith("-en.md"):
        filepath = os.path.join(content_dir, filename)
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()
            
        parts = content.split("\n\n", 1)
        if len(parts) == 2:
            frontmatter, body = parts
        else:
            frontmatter, body = content, ""
            
        if "Lang:" not in frontmatter:
            frontmatter += "\nLang: pt"
        
        try:
            print(f"Translating {filename} body...")
            translated_body = translator.translate(body, src='pt', dest='en').text
        except Exception as e:
            print(f"Failed body for {filename}: {e}")
            translated_body = body
            
        title_match = re.search(r"^Title:\s*(.*)", frontmatter, re.MULTILINE)
        if title_match:
            try:
                print(f"Translating {filename} title...")
                translated_title = translator.translate(title_match.group(1), src='pt', dest='en').text
                frontmatter_en = frontmatter.replace(title_match.group(0), f"Title: {translated_title}")
            except Exception as e:
                print(f"Failed title for {filename}: {e}")
                frontmatter_en = frontmatter
        else:
            frontmatter_en = frontmatter
            
        frontmatter_en = frontmatter_en.replace("Lang: pt", "Lang: en")
        
        en_filepath = filepath
        pt_filepath = filepath.replace(".md", "-pt.md")
        
        # We save PT as -pt.md
        with open(pt_filepath, "w", encoding="utf-8") as f:
            f.write(frontmatter + "\n\n" + body)
            
        # We save EN as original
        with open(en_filepath, "w", encoding="utf-8") as f:
            f.write(frontmatter_en + "\n\n" + translated_body)
            
print("Done translating!")
