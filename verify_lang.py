for file in ['c:/Users/wsric/iscrev/src/index.html', 'c:/Users/wsric/iscrev/src/pt.html']:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
        print(f'=== {file} ===')
        print(f'lang={content[20:40]}')
        idx = content.find('class="lang-switcher"')
        print(content[idx:idx+250])
