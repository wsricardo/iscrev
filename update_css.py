import os

filepath = r'c:\Users\wsric\iscrev\src\assets\css\style.css'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Add the new classes
classes_to_add = '''
.dialog-section-author {
    border-left: 1px solid rgba(139,58,31,0.1);
    padding-left: 20px;
}

.support-section {
    grid-column: 1 / -1;
    border-top: 1px solid rgba(139,58,31,0.1);
    padding-top: 20px;
    text-align: center;
}

'''

content = content.replace('.social-link:hover {', classes_to_add + '.social-link:hover {')

# Replace the media query block
old_media = '''@media (max-width: 768px) {
    .dialog-content {
        grid-template-columns: 1fr;
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
    .eco-card {
        flex: 0 0 calc(85%);
    }
}'''

content = content.replace(old_media, new_media)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
