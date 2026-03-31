# Biblioteca Brotero

Este projeto é uma aplicação web para o catálogo e requisições da **Biblioteca Escolar**, desenvolvido no âmbito de estágio. Futuramente, caso a Escola Secundária Brotero tenha interesse em adquiri-lo oficialmente, pode entrar em contacto para mais informações.

Este projeto foi desenvolvido utilizando Laravel 12 e PHP 8.2 ou superior no backend. O frontend utiliza React 19 em conjunto com Inertia.js e Tailwind CSS, proporcionando uma experiência moderna ao utilizador. Para autenticação, são usados o Fortify para os utilizadores web e o guard `patron`, que permite acesso pelo quiosque através do número do cartão e a data de nascimento.

Entre as principais funcionalidades, destaca-se o catálogo público disponível na rota `/biblioteca`, onde é possível consultar livros e aplicar filtros. Os utilizadores têm acesso à sua conta, onde gerem pedidos, histórico, favoritos e perfil. Existe também um modo bibliotecário no quiosque, que facilita a gestão de requisições, a adição de novos livros e a edição de registos. Para o staff, está disponível um painel de aprovação de pedidos e envio de e-mails configuráveis.

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

## Capturas de ecrã

Imagens em [`docs/images/`](docs/images/).

### Catálogo e descoberta

**Página inicial** — pesquisa, categorias, novidades, recomendações e «os mais pedidos».

![Página inicial do catálogo](docs/images/Pagina-Inicial.png)

**Ranking de leitores** — gamificação por pontos.

![Ranking de leitores](docs/images/Ranking-leitores.png)

**Todos os livros** — listagem completa com índice alfabético.

![Todos os livros](docs/images/Todos-os-livros.png)

### Conta do leitor

**Pedidos activos** — requisições em curso e prazos.

![Pedidos activos](docs/images/Pedidos-ativos.png)

**Histórico** — pedidos concluídos ou recusados.

![Histórico](docs/images/Historico.png)

**Favoritos** — livros marcados com o coração.

![Favoritos](docs/images/Favoritos-onde-aparece-livros-marcados.png)

**Perfil** — dados do cartão (ex.: utilizadora bibliotecária no quiosque).

![Perfil do utilizador](docs/images/Perfil-usuario-bibliotecario.png)

### Requisitar um livro

**Informação na ficha do livro** — zona de requisição e escolha de local.

![Informação ao requisitar](docs/images/Informacao-ao.requisitar.png)

**Modo aluno** — fluxo de requisição no catálogo.

![Requisição como aluno](docs/images/modo-aluno-requisisitando.png)

**Após pedir (cacifo)** — confirmação do tipo de levantamento.

![Após pedir cacifo](docs/images/apos-pedir-um-cacifo.png)

### Modo bibliotecário (balcão)

**Adicionar livros** — entrada manual no catálogo.

![Adicionar livros](docs/images/Modo-Bibliotecario-Adicionar-livros.png)

**Balcão** — gestão de pedidos de todos os cartões.

![Livros e pedidos no balcão](docs/images/Os-livros-do-balcao.png)

**Aprovação no balcão** — pedidos *pendentes* (Aprovar / Recusar / Cancelar) e requisições *activas* (multa, devolução, nota ao aluno).

![Aprovação de pedidos no balcão](docs/images/aprovacao-pedido.png)

## Licença

MIT (conforme indicado no projeto base Laravel).
