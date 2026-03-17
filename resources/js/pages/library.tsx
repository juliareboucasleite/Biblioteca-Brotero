import { Head } from '@inertiajs/react';
import { BroteroFooter } from '@/components/BroteroFooter';
import { BroteroHeader } from '@/components/BroteroHeader';
import { CardLivro } from '@/components/CardLivro';
import { LISTA_ESCOLAS } from '@/constants/escolas';

type Livro = {
    id: string;
    titulo: string;
    autor: string;
    desc: string; 
};

type LibraryProps = {
    livros: Livro[];
};

export default function Library({ livros }: LibraryProps) {
    return (
        <>
            <Head title="Biblioteca" />

            <div className="brotero-scope">
                <BroteroHeader />

                <main className="container layout-main">
                <aside className="sidebar-categorias box-brotero">
                    <h2 className="sidebar-titulo">Categorias</h2>
                    <ul className="sidebar-lista">
                        <li>
                            <button type="button" className="sidebar-link">
                                Artes e Fotografia
                            </button>
                        </li>
                        <li>
                            <button type="button" className="sidebar-link">
                                Biografias, Diários e Factos Reais
                            </button>
                        </li>
                        <li>
                            <button type="button" className="sidebar-link">
                                Calendários e Anuários
                            </button>
                        </li>
                        <li>
                            <button type="button" className="sidebar-link">
                                Ciências, Tecnologia e Medicina
                            </button>
                        </li>
                        <li>
                            <button type="button" className="sidebar-link">
                                Livros de Receitas, Comida e Vinho
                            </button>
                        </li>
                        <li>
                            <button type="button" className="sidebar-link">
                                Referência
                            </button>
                        </li>
                        <li>
                            <button type="button" className="sidebar-link">
                                Comics, Manga e Romances Gráficos
                            </button>
                        </li>
                        <li>
                            <button type="button" className="sidebar-link">
                                Desporto e Ar Livre
                            </button>
                        </li>
                        <li>
                            <button type="button" className="sidebar-link">
                                Direito
                            </button>
                        </li>
                        <li>
                            <button type="button" className="sidebar-link">
                                Negócios e Economia
                            </button>
                        </li>
                        <li>
                            <button type="button" className="sidebar-link">
                                Ficção Científica e Fantasia
                            </button>
                        </li>
                        <li>
                            <button type="button" className="sidebar-link">
                                História
                            </button>
                        </li>
                        <li>
                            <button type="button" className="sidebar-link">
                                Artesanato, Tempos Livres e Lar
                            </button>
                        </li>
                        <li>
                            <button type="button" className="sidebar-link">
                                Livros Infantis
                            </button>
                        </li>
                        <li>
                            <button type="button" className="sidebar-link">
                                Computadores e Internet
                            </button>
                        </li>
                        <li>
                            <button type="button" className="sidebar-link">
                                Adolescente e Jovem Adulto
                            </button>
                        </li>
                        <li>
                            <button type="button" className="sidebar-link">
                                Livros Escolares e Educação
                            </button>
                        </li>
                        <li>
                            <button type="button" className="sidebar-link">
                                Viagens e Turismo
                            </button>
                        </li>
                        <li>
                            <button type="button" className="sidebar-link">
                                Literatura e Ficção Policial, Noir e Suspense
                            </button>
                        </li>
                        <li>
                            <button type="button" className="sidebar-link">
                                Política e Governo
                            </button>
                        </li>
                        <li>
                            <button type="button" className="sidebar-link">
                                Religião e Espiritualidade
                            </button>
                        </li>
                        <li>
                            <button type="button" className="sidebar-link">
                                Romance
                            </button>
                        </li>
                        <li>
                            <button type="button" className="sidebar-link">
                                Ciências Sociais
                            </button>
                        </li>
                        <li>
                            <button type="button" className="sidebar-link">
                                Saúde e Desenvolvimento Pessoal
                            </button>
                        </li>
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
                            <h3 className="secao-titulo">Novos livros adicionados</h3>
                            <a href="#" className="link-ver-mais">
                                Ver mais
                            </a>
                        </div>
                        <div className="livros-grid">
                            {livros.map((livro) => (
                                <CardLivro key={livro.id} livro={livro} />
                            ))}
                        </div>
                    </section>

                    <section className="secao-livros secao-brotero">
                        <div className="secao-head">
                            <h3 className="secao-titulo">Recomendado para si</h3>
                            <a href="#" className="link-ver-mais">
                                Ver mais
                            </a>
                        </div>
                        <div className="livros-grid">
                            <p className="secao-aviso">Recomendações personalizadas.</p>
                        </div>
                    </section>

                    <section className="secao-livros secao-brotero">
                        <div className="secao-head">
                            <h3 className="secao-titulo">Os mais pedidos</h3>
                            <a href="#" className="link-ver-mais">
                                Ver mais
                            </a>
                        </div>
                        <div className="livros-grid">
                            <p className="secao-aviso">Livros mais requisitados.</p>
                        </div>
                    </section>
                </div>
            </main>

            <BroteroFooter />
            </div>
        </>
    );
}
