import os

def unmojibake(filepath):
    try:
        with open(filepath, 'rb') as f:
            raw = f.read()
            
        byte_replacements = {
            b'\xc3\x83\xc2\xa1': b'\xc3\xa1', # á
            b'\xc3\x83\xc2\xa2': b'\xc3\xa2', # â
            b'\xc3\x83\xc2\xa3': b'\xc3\xa3', # ã
            b'\xc3\x83\xc2\xa7': b'\xc3\xa7', # ç
            b'\xc3\x83\xc2\xa9': b'\xc3\xa9', # é
            b'\xc3\x83\xc2\xaa': b'\xc3\xaa', # ê
            b'\xc3\x83\xc2\xad': b'\xc3\xad', # í
            b'\xc3\x83\xc2\xb3': b'\xc3\xb3', # ó
            b'\xc3\x83\xc2\xb4': b'\xc3\xb4', # ô
            b'\xc3\x83\xc2\xb5': b'\xc3\xb5', # õ
            b'\xc3\x83\xc2\xba': b'\xc3\xba', # ú
            b'\xc3\x83\xc2\xa0': b'\xc3\xa0', # à
            b'\xc3\x83\xc2\x89': b'\xc3\x89', # É
            b'\xc3\x83\xc2\x81': b'\xc3\x81', # Á
            b'\xc3\x83\xc2\x82': b'\xc3\x82', # Â
            b'\xc3\x83\xc2\x83': b'\xc3\x83', # Ã
            b'\xc3\x83\xc2\x87': b'\xc3\x87', # Ç
            b'\xc3\x83\xc2\x8a': b'\xc3\x8a', # Ê
            b'\xc3\x83\xc2\x93': b'\xc3\x93', # Ó
            b'\xc3\x83\xc2\x94': b'\xc3\x94', # Ô
            b'\xc3\x83\xc2\x95': b'\xc3\x95', # Õ
            b'\xc3\x83\xc2\x9a': b'\xc3\x9a', # Ú
            b'\xc3\x83\xc2\x80': b'\xc3\x80', # À
        }
        
        original_raw = raw
        for k, v in byte_replacements.items():
            raw = raw.replace(k, v)
            
        if raw != original_raw:
            print(f'Unmojibaked {filepath}')
            with open(filepath, 'wb') as f:
                f.write(raw)
    except Exception as e:
        print(f'Error {filepath}: {e}')

src_dir = 'c:/Users/wsric/iscrev/src'
for f in os.listdir(src_dir):
    if f.endswith('.html'):
        unmojibake(os.path.join(src_dir, f))
