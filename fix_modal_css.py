import os

filepath = r'c:\Users\wsric\iscrev\src\assets\css\style.css'

with open(filepath, 'r', encoding='utf-8') as f:
    css_content = f.read()

# Fix centering in .glass-dialog
old_dialog = '''.glass-dialog {
    border: 1px solid rgba(139, 58, 31, 0.2);
    border-radius: var(--radius-xl);
    background: rgba(251, 247, 239, 0.95);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
    padding: 0;
    width: 90%;
    max-width: 800px;
    color: var(--ink);
    margin: 20px auto;

    /* Centering and Responsiveness */
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    max-height: 85vh;
    overflow-y: auto;
}'''

new_dialog = '''.glass-dialog {
    border: 1px solid rgba(139, 58, 31, 0.2);
    border-radius: var(--radius-xl);
    background: rgba(251, 247, 239, 0.95);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
    padding: 0;
    width: 90%;
    max-width: 800px;
    color: var(--ink);
    
    /* Native centering */
    margin: auto;
    max-height: 85vh;
    overflow-y: auto;
}'''

css_content = css_content.replace(old_dialog, new_dialog)
# Try without spaces if it doesn't match
if old_dialog not in css_content:
    # use regex
    import re
    css_content = re.sub(r'\.glass-dialog\s*\{[^}]*\}', new_dialog, css_content)


# Add responsive image sizing
old_media = '''@media (max-width: 768px) {
    .dialog-content {
        grid-template-columns: 1fr;
        gap: 20px;
        padding: 20px;
    }
    .dialog-section-author {
        border-left: none;
        padding-left: 0;
        border-top: 1px solid rgba(139,58,31,0.1);
        padding-top: 20px;
    }
    .support-section {
        grid-column: 1;
    }
    .eco-card {
        flex: 0 0 calc(85%);
    }
}'''

new_media = '''@media (max-width: 768px) {
    .dialog-content {
        grid-template-columns: 1fr;
        gap: 20px;
        padding: 20px;
    }
    .dialog-section-author {
        border-left: none;
        padding-left: 0;
        border-top: 1px solid rgba(139,58,31,0.1);
        padding-top: 20px;
    }
    .support-section {
        grid-column: 1;
    }
    .dialog-section img {
        width: 80px !important;
        height: 80px !important;
        margin: 5px 0 10px 10px !important;
    }
    .eco-card {
        flex: 0 0 calc(85%);
    }
}'''

if old_media in css_content:
    css_content = css_content.replace(old_media, new_media)
else:
    # just inject
    css_content += '''
@media (max-width: 768px) {
    .dialog-section img {
        width: 80px !important;
        height: 80px !important;
        margin: 5px 0 10px 10px !important;
    }
}
'''

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(css_content)

print("Fixed CSS")
