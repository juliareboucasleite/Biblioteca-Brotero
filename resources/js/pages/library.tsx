import { Head } from '@inertiajs/react';
import { useEffect, useMemo, useRef, useState } from 'react';
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

type LibraryProps = {
    livros: Livro[];
    categorias: Categoria[];
    categoriaSelecionada?: string | null;
};

export default function Library({ livros, categorias, categoriaSelecionada }: LibraryProps) {
    const [lista, setLista] = useState<Livro[]>(livros);
    const lastServerSnapshot = useMemo(() => JSON.stringify(livros), [livros]);
    const snapshotRef = useRef(lastServerSnapshot);

    useEffect(() => {
        // Mantém o estado sincronizado quando o Inertia re-renderiza com novos props.
        if (snapshotRef.current !== lastServerSnapshot) {
            snapshotRef.current = lastServerSnapshot;
            setLista(livros);
        }
    }, [lastServerSnapshot, livros]);

    useEffect(() => {
        let cancelled = false;
        let timeoutId: number | undefined;

        const tick = async () => {
            try {
                const url = categoriaSelecionada
                    ? `/books?limit=10&categoria=${encodeURIComponent(categoriaSelecionada)}`
                    : '/books?limit=10';

                const res = await fetch(url, {
                    headers: { Accept: 'application/json' },
                });

                if (!res.ok) {
                    return;
                }

                const data = (await res.json()) as Array<{
                    id: number | string;
                    title?: string | null;
                    description?: string | null;
                    cover_image?: string | null;
                    authors?: Array<{ name?: string | null }> | null;
                }>;

                const mapped: Livro[] = (data ?? []).map((b) => ({
                    id: String(b.id),
                    titulo: b.title?.toString() ?? '',
                    autor: (b.authors ?? [])
                        .map((a) => a?.name?.toString()?.trim())
                        .filter((x): x is string => Boolean(x))
                        .join(', ') || 'Autor desconhecido',
                    desc: b.description?.toString() ?? '',
                    capa: b.cover_image?.toString() ?? null,
                }));

                if (!cancelled && mapped.length > 0) {
                    setLista(mapped);
                }
            } finally {
                if (!cancelled) {
                    timeoutId = window.setTimeout(tick, 5000);
                }
            }
        };

        timeoutId = window.setTimeout(tick, 1500);

        return () => {
            cancelled = true;

            if (timeoutId) {
                window.clearTimeout(timeoutId);
            }
        };
    }, [categoriaSelecionada]);

    return (
        <>
            <Head title="Biblioteca Brotero" />

            <div className="brotero-scope">
                <BroteroHeader />

                <main className="container layout-main">
                <aside className="sidebar-categorias box-brotero">
                    <h2 className="sidebar-titulo">Categorias</h2>
                    <ul className="sidebar-lista">
                        <li>
                            <a
                                href="/biblioteca"
                                className="sidebar-link"
                                aria-current={!categoriaSelecionada ? 'page' : undefined}
                            >
                                Todas
                            </a>
                        </li>
                        {categorias.map((c) => (
                            <li key={c.id}>
                                <a
                                    href={`/biblioteca?categoria=${encodeURIComponent(c.id)}`}
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
                            <h3 className="secao-titulo">Novos livros adicionados</h3>
                            <a
                                href={
                                    categoriaSelecionada
                                        ? `/biblioteca/livros?categoria=${encodeURIComponent(categoriaSelecionada)}`
                                        : '/biblioteca/livros'
                                }
                                className="link-ver-mais"
                            >
                                Ver mais
                            </a>
                        </div>
                        <div className="livros-row" aria-label="Lista de livros recentes">
                            {lista.slice(0, 10).map((livro) => (
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
