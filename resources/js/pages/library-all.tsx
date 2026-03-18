import { Head } from '@inertiajs/react';
import { BroteroFooter } from '@/components/BroteroFooter';
import { BroteroHeader } from '@/components/BroteroHeader';
import { CardLivro } from '@/components/CardLivro';
import { LISTA_ESCOLAS } from '@/constants/escolas';

type Categoria = {
    id: string;
    nome: string;
};

type Livro = {
    id: string;
    titulo: string;
    autor: string;
    desc: string;
    capa?: string | null;
};

type LibraryAllProps = {
    livros: Livro[];
    categorias: Categoria[];
    categoriaSelecionada?: string | null;
};

export default function LibraryAll({ livros, categorias, categoriaSelecionada }: LibraryAllProps) {
    return (
        <>
            <Head title="Biblioteca Brotero - Todos os livros" />
            <div className="brotero-scope">
                <BroteroHeader />
                <main className="container layout-main">
                    <aside className="sidebar-categorias box-brotero">
                        <h2 className="sidebar-titulo">Categorias</h2>
                        <ul className="sidebar-lista">
                            <li>
                                <a
                                    href="/biblioteca/livros"
                                    className="sidebar-link"
                                    aria-current={!categoriaSelecionada ? 'page' : undefined}
                                >
                                    Todas
                                </a>
                            </li>
                            {categorias.map((c) => (
                                <li key={c.id}>
                                    <a
                                        href={`/biblioteca/livros?categoria=${encodeURIComponent(c.id)}`}
                                        className="sidebar-link"
                                        aria-current={categoriaSelecionada === c.id ? 'page' : undefined}
                                    >
                                        {c.nome}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </aside>

                    <div className="conteudo-main">
                        <section className="pesquisa-livros box-brotero">
                            <h2 className="titulo-secao-brotero">Filtros e pesquisa avançada</h2>
                            <p className="filtros-titulo">Filtrar por:</p>
                            <div className="filtros-pesquisa">
                                <div className="filtro-item">
                                    <label htmlFor="filtro-lingua">Língua</label>
                                    <select id="filtro-lingua" name="lingua">
                                        <option>Todas as línguas</option>
                                        <option>Português</option>
                                        <option>Inglês</option>
                                        <option>Francês</option>
                                        <option>Espanhol</option>
                                        <option>Alemão</option>
                                        <option>Italiano</option>
                                        <option>Holandês</option>
                                    </select>
                                </div>
                                <div className="filtro-item">
                                    <label htmlFor="filtro-tipo">Tipo de documento</label>
                                    <select id="filtro-tipo" name="tipo-documento">
                                        <option>Tudo</option>
                                        <option>Monografia (Texto Impresso)</option>
                                        <option>Publicação Periódica</option>
                                        <option>Registos Sonoros Musicais</option>
                                        <option>Analítico</option>
                                        <option>Multimédia</option>
                                    </select>
                                </div>
                                <div className="filtro-item">
                                    <label htmlFor="filtro-escola">Base das escolas</label>
                                    <select id="filtro-escola" name="escola">
                                        <option>Todas as escolas</option>
                                        {LISTA_ESCOLAS.map((escola) => (
                                            <option key={escola}>{escola}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </section>

                        <section className="secao-livros secao-brotero">
                            <div className="secao-head">
                                <h3 className="secao-titulo">Todos os livros</h3>
                                <a
                                    href={
                                        categoriaSelecionada
                                            ? `/biblioteca?categoria=${encodeURIComponent(categoriaSelecionada)}`
                                            : '/biblioteca'
                                    }
                                    className="link-ver-mais"
                                >
                                    Voltar
                                </a>
                            </div>
                            <div className="livros-grid">
                                {livros.map((livro) => (
                                    <CardLivro key={livro.id} livro={livro} />
                                ))}
                            </div>
                        </section>
                    </div>
                </main>
            <BroteroFooter />
            </div>
        </>
    );
}

