<!DOCTYPE html>
<html lang="pt-pt">
<head>
   <?php include 'inc/header.php'; ?>
</head>

<body>
    <main class="container layout-main">
        <aside class="sidebar-categorias box-brotero">
            <h2 class="sidebar-titulo">Categorias</h2>
            <ul class="sidebar-lista">
                <?php include 'inc/categorias.php'; ?>
            </ul>
        </aside>

        <div class="conteudo-main">
            <section class="pesquisa-livros box-brotero">
                <h2 class="titulo-secao-brotero">Filtros e pesquisa avançada</h2>
                <p class="filtros-titulo">Filtrar por:</p>
                <div class="filtros-pesquisa">
                    <div class="filtro-item">
                        <label for="filtro-lingua">Língua</label>
                        <select id="filtro-lingua" name="lingua">
                            <?php include 'inc/idiomas.php'; ?>
                        </select>
                    </div>

                    <div class="filtro-item">
                        <label for="filtro-tipo">Tipo de documento</label>
                        <select id="filtro-tipo" name="tipo-documento">
                           <?php include 'inc/tipodocumento.php'; ?>
                        </select>
                    </div>

                    <div class="filtro-item">
                        <label for="filtro-escola">Base das escolas</label>
                        <select id="filtro-escola" name="escola">
                            <?php include 'inc/escolas.php'; ?>
                        </select>
                    </div>
                </div>
            </section>

            <section class="secao-livros secao-brotero">
                <div class="secao-head">
                    <h3 class="secao-titulo">Novos livros adicionados</h3>
                    <a href="#" class="link-ver-mais">Ver mais</a>
                </div>
                <div class="livros-grid">
                    <article class="card-livro box-brotero">
                        <a href="livro.php?id=01" class="card-livro-capa" aria-label="Ver livro e requisitar">
                            <span class="card-livro-take-btn">take it</span>
                        </a>
                    </article>
                </div>
            </section>
            <section class="secao-livros secao-brotero">
                <div class="secao-head">
                    <h3 class="secao-titulo">Recomendado para si</h3>
                    <a href="#" class="link-ver-mais">Ver mais</a>
                </div>
                <div class="livros-grid">
                    <p class="secao-aviso">Recomendações personalizadas.</p>
                </div>
            </section>
            <section class="secao-livros secao-brotero">
                <div class="secao-head">
                    <h3 class="secao-titulo">Os mais pedidos</h3>
                    <a href="#" class="link-ver-mais">Ver mais</a>
                </div>
                <div class="livros-grid">
                    <p class="secao-aviso">Livros mais requisitados.</p>
                </div>
            </section>
        </div>
        
    </main>

    <footer>
     <div class="container footer-inner">
        <?php include 'inc/footer.php'; ?>
     </div>
    </footer>
    <script src="js/take-book-modal.js"></script>
</body>
</html>