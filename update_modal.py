import os
import re

files = [
    r'c:\Users\wsric\iscrev\src\index.html',
    r'c:\Users\wsric\iscrev\src\pt.html'
]

en_support_html = '''
            <div class="dialog-section support-section">
                <h4>Support the Project</h4>
                <p>Help keep iScrev Notes light, independent, and evolving. You can support the project securely via Stripe.</p>
                <a class="button-primary" style="background-color: #635bff; border-color: #635bff; margin-top: 10px;" href="https://donate.stripe.com/cNieV715daoJ55X8C47kc00" target="_blank" rel="noopener noreferrer">Donate securely via Stripe</a>
            </div>
'''

pt_support_html = '''
            <div class="dialog-section support-section">
                <h4>Apoie o Projeto</h4>
                <p>Ajude a manter o iScrev Notes leve, independente e em evolução. Você pode apoiar o projeto de forma segura via Stripe.</p>
                <a class="button-primary" style="background-color: #635bff; border-color: #635bff; margin-top: 10px;" href="https://donate.stripe.com/cNieV715daoJ55X8C47kc00" target="_blank" rel="noopener noreferrer">Doar com segurança via Stripe</a>
            </div>
'''

for filepath in files:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # remove inline style and add class dialog-section-author
    content = content.replace(
        '<div class="dialog-section" style="border-left: 1px solid rgba(139,58,31,0.1); padding-left: 20px;">',
        '<div class="dialog-section dialog-section-author">'
    )

    # Insert support block before the closing </div> of dialog-content
    # Find the end of dialog-content block.
    # The structure is:
    # <div class="dialog-content">
    #     <div class="dialog-section">...</div>
    #     <div class="dialog-section dialog-section-author">...</div>
    # </div>
    # </dialog>
    
    # We can inject right before </div>\s*</dialog>
    if 'support-section' not in content:
        support_block = pt_support_html if 'pt.html' in filepath else en_support_html
        content = re.sub(r'(</div>\s*</dialog>)', r'    ' + support_block.strip() + r'\n        \1', content)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
