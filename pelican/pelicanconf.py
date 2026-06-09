AUTHOR = 'WSRicardo'
SITENAME = 'iScrev Notes Blog'
SITEURL = 'https://www.iscrev.com'

PATH = 'content'
TIMEZONE = 'America/Sao_Paulo'
DEFAULT_LANG = 'pt-BR'

# --- Configurações do Tema ---
# Aponta para o nosso tema customizado que criaremos a seguir.
THEME = 'theme/iscrev-notes'

# --- Estrutura de URLs e Salvamento ---
# Configura o Pelican para salvar os arquivos dentro de um diretório /blog/
ARTICLE_URL = 'blog/{slug}.html'
ARTICLE_SAVE_AS = 'blog/{slug}.html'
INDEX_SAVE_AS = 'blog/index.html'

# Desabilitar a geração de páginas que não usaremos por enquanto
#PAGE_PATHS = ['pages']
PAGE_URL = 'blog/pages/{slug}.html'
PAGE_SAVE_AS = 'blog/pages/{slug}.html'
CATEGORY_URL = 'blog/category/{slug}.html'
CATEGORY_SAVE_AS = 'blog/category/{slug}.html'
TAG_URL = 'blog/tag/{slug}.html'
TAG_SAVE_AS = 'blog/tag/{slug}.html'
AUTHOR_URL = 'blog/author/{slug}.html'
AUTHOR_SAVE_AS = 'blog/author/{slug}.html'
ARCHIVES_SAVE_AS = 'blog/archives.html'
CATEGORIES_SAVE_AS = 'blog/categories.html'
TAGS_SAVE_AS = 'blog/tags.html'
AUTHORS_SAVE_AS = 'blog/authors.html'

# --- Configurações de Feed ---
FEED_ALL_ATOM = None
CATEGORY_FEED_ATOM = None
TRANSLATION_FEED_ATOM = None

# --- Diretório de Saída ---
# Gera o site na pasta `docs/` do diretório pai.
OUTPUT_PATH = '../docs/'

# --- Configurações de Arquivos Estáticos ---
STATIC_PATHS = ['blog/images']
EXTRA_PATH_METADATA = {
    'blog/images': {'path': 'blog/images'},
}



DEFAULT_PAGINATION = 10