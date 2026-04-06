# Biblioteca Brotero

Este projeto é uma aplicação web para o catálogo e requisições da **Biblioteca Escolar**, desenvolvido no âmbito de estágio. Futuramente, caso a Escola Secundária Brotero tenha interesse em adquiri-lo oficialmente, pode entrar em contacto para mais informações.

Este projeto foi desenvolvido utilizando Laravel 12 e PHP 8.2 ou superior no backend. O frontend utiliza React 19 em conjunto com Inertia.js e Tailwind CSS. Para autenticação, são usados o Fortify para os utilizadores web e o guard `patron`, que permite acesso pelo quiosque através do número do cartão e a data de nascimento.

Entre as principais funcionalidades: catálogo público em `/biblioteca` com pesquisa e filtros; conta do leitor (pedidos, histórico, favoritos, perfil); **Descobertas** (recomendações entre leitores) e **mensagens** entre leitores quando a conversa é aceite; modo bibliotecário no quiosque (balcão, novos livros, edição); painel de staff para aprovação de pedidos e e-mails configuráveis.

Para executar a aplicação, é necessário ter PHP 8.2 ou superior com Composer para as dependências, Node.js com npm para compilar os assets, e uma base de dados compatível com Laravel, como MySQL ou SQLite.

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

## Interface

O visual é entregue por **Inertia + React** e **Tailwind**; muda ao longo do desenvolvimento. Este README **não inclui capturas de ecrã**, para não ficarem desactualizadas face ao produto actual.

## Licença

MIT (conforme indicado no projeto base Laravel).
