# Biblioteca Brotero

Aplicação web do catálogo e requisições da **Biblioteca Escolar** (fluxo de leitores por cartão, balcão de bibliotecários e painel de staff).

## Stack

- **Backend:** Laravel 12, PHP 8.2+
- **Frontend:** React 19, Inertia.js, Tailwind CSS
- **Auth:** Fortify (utilizadores web), guard `patron` (cartão + data de nascimento no quiosque)

## Funcionalidades (visão geral)

- Catálogo público (`/biblioteca`), página de livro e filtros
- Conta do leitor: pedidos, histórico, favoritos, perfil
- Modo **bibliotecário** no quiosque: balcão de requisições, novos livros, edição de fichas
- Painel **staff** (e-mails configuráveis) para aprovar pedidos

## Requisitos

- PHP 8.2+, Composer
- Node.js + npm (build dos assets)
- Base de dados suportada pelo Laravel (MySQL, SQLite, etc.)

## Arranque rápido

```bash
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan storage:link   # capas de livros em público

npm install
npm run build   # ou npm run dev
php artisan serve
```

Configure variáveis em `.env` (base de dados, `APP_URL`, opções em `config/biblioteca.php` quando aplicável).

## Capturas de ecrã (prints)

Coloque os ficheiros de imagem na pasta **`docs/images/`** (PNG, JPG ou WebP). No `README`, use caminhos relativos à raiz do repositório.

Exemplos de nomes sugeridos (crie os ficheiros à medida que for guardando os prints):

| Ficheiro sugerido        | Sugestão de conteúdo        |
|--------------------------|-----------------------------|
| `catalogo.png`           | Página inicial do catálogo |
| `livro-detalhe.png`      | Ficha de um livro          |
| `todos-livros.png`       | Listagem com índice A–Z    |
| `quiosque-login.png`     | Entrada com cartão         |
| `conta-pedidos.png`      | Os meus pedidos            |
| `balcao.png`             | Balcão — pedidos           |

Depois de adicionar imagens, descomente ou copie blocos como:

```markdown
### Catálogo

![Catálogo](docs/images/catalogo.png)

### Ficha do livro

![Detalhe do livro](docs/images/livro-detalhe.png)
```

## Licença

MIT (conforme indicado no projeto base Laravel).
