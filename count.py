with open('c:/Users/wsric/iscrev/src/pt.html', 'r', encoding='utf-8') as f:
    pt = f.read()
with open('c:/Users/wsric/iscrev/src/index.html', 'r', encoding='utf-8') as f:
    en = f.read()
print(f'pt.html sections: {pt.count("</section>")}')
print(f'index.html sections: {en.count("</section>")}')
