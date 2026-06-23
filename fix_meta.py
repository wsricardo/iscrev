import re

filepath = r'c:\Users\wsric\iscrev\src\support.html'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

content = re.sub(r'<title>.*?</title>', '<title>Support iScrev Notes | Independent writing and study project</title>', content)
content = re.sub(r'content="Apoie o iScrev Notes \| Projeto independente de escrita e estudo"', 'content="Support iScrev Notes | Independent writing and study project"', content)
content = re.sub(r'content="Apoie o iScrev Notes via PIX e ajude a manter o projeto independente.*?"', 'content="Support iScrev Notes via PIX or Stripe and help maintain the independent project. Choose PIX for Brazil or Stripe for global contributions."', content)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
