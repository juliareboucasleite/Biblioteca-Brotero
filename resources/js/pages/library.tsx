import { Head } from '@inertiajs/react';
import type { AutorFiltroOption } from '@/components/biblioteca/BibliotecaFiltrosAvancados';
import { BibliotecaFiltrosAvancados } from '@/components/biblioteca/BibliotecaFiltrosAvancados';
import { BibliotecaMainRow } from '@/components/biblioteca/BibliotecaMainRow';
import { BibliotecaPageShell } from '@/components/biblioteca/BibliotecaPageShell';
import type { RankingCatalogoEntrada } from '@/components/biblioteca/BibliotecaRankingCatalogo';
import { BibliotecaRankingCatalogo } from '@/components/biblioteca/BibliotecaRankingCatalogo';
import { BibliotecaSectionPlaceholder } from '@/components/biblioteca/BibliotecaSectionPlaceholder';
import { BookSectionHeader } from '@/components/biblioteca/BookSectionHeader';
import { CardLivro } from '@/components/CardLivro';
import CategorySidebar from '@/components/CategorySidebar';
import { useBibliotecaLivrosPolling } from '@/hooks/useBibliotecaLivrosPolling';
import type { Category, LivroCatalogo } from '@/types';

type LibraryProps = {
    livros: LivroCatalogo[];
    /** Outras obras do autor mais frequente entre os «novos» (servidor). */
    livrosRecomendados?: LivroCatalogo[];
    /** Nome do autor usado nas recomendações (para título e pesquisa «Ver mais»). */
    recomendadoAutorNome?: string | null;
    /** Ordenados por número de requisições (desc). */
    livrosMaisPedidos?: LivroCatalogo[];
    categorias: Category[];
    categoriaSelecionada?: string | null;
    q?: string | null;
    lingua?: string | null;
    autores?: AutorFiltroOption[];
    authorSelecionado?: string | null;
    ano?: string | null;
    rankingCatalogo?: RankingCatalogoEntrada[];
};

function buildBibliotecaQuery(
    categoriaSelecionada?: string | null,
    q?: string | null,
    lingua?: string | null,
    authorSelecionado?: string | null,
    ano?: string | null,
): string {
    return new URLSearchParams({
        ...(categoriaSelecionada ? { categoria: categoriaSelecionada } : {}),
        ...(q ? { q } : {}),
        ...(lingua ? { lingua } : {}),
        ...(authorSelecionado ? { author_id: authorSelecionado } : {}),
        ...(ano ? { ano } : {}),
    }).toString();
}

export default function Library({
    livros,
    livrosRecomendados = [],
    recomendadoAutorNome,
    livrosMaisPedidos = [],
    categorias,
    categoriaSelecionada,
    q,
    lingua,
    autores = [],
    authorSelecionado,
    ano,
    rankingCatalogo = [],
}: LibraryProps) {
    const lista = useBibliotecaLivrosPolling(livros, { categoriaSelecionada, q, lingua, authorSelecionado, ano });
    const query = buildBibliotecaQuery(categoriaSelecionada, q, lingua, authorSelecionado, ano);
    const temRecomendados = livrosRecomendados.length > 0;
    const qParaAutor =
        q !== null && q !== undefined && String(q).trim() !== ''
            ? q
            : recomendadoAutorNome !== null &&
                recomendadoAutorNome !== undefined &&
                recomendadoAutorNome.trim() !== ''
              ? recomendadoAutorNome.trim()
              : null;
    const queryRecomendados = buildBibliotecaQuery(categoriaSelecionada, qParaAutor, lingua);
    const tituloRecomendados = recomendadoAutorNome?.trim()
        ? `Recomendado para si — ${recomendadoAutorNome.trim()}`
        : 'Recomendado para si';

    const temMaisPedidos = livrosMaisPedidos.length > 0;

    return (
        <>
            <Head title="Biblioteca Brotero" />

            <BibliotecaPageShell>
                <BibliotecaMainRow
                    className="pt-[26px] pb-[32px]"
                    sidebar={
                        <CategorySidebar
                            categorias={categorias}
                            categoriaSelecionada={categoriaSelecionada ?? undefined}
                            q={q ?? undefined}
                            lingua={lingua ?? undefined}
                            authorId={authorSelecionado ?? undefined}
                            ano={ano ?? undefined}
                        />
                    }
                >
                    <BibliotecaFiltrosAvancados
                        formAction="/biblioteca"
                        categoriaSelecionada={categoriaSelecionada}
                        q={q}
                        lingua={lingua}
                        autores={autores}
                        authorSelecionado={authorSelecionado}
                        ano={ano}
                        autoSubmitLingua
                    />

                    <section className="mb-[24px]">
                        <BookSectionHeader
                            title="Novos livros adicionados"
                            action={
                                <a
                                    href={`/biblioteca/livros?${query}`}
                                    className="text-[13px] text-(--brotero-texto-link) whitespace-nowrap hover:text-(--brotero-texto-link-hover) hover:underline"
                                >
                                    Ver mais
                                </a>
                            }
                        />
                        <div
                            className="flex gap-[16px] overflow-x-auto pb-[6px] snap-x snap-proximity"
                            aria-label="Lista de livros recentes"
                        >
                            {lista.slice(0, 10).map((livro) => (
                                <CardLivro
                                    key={livro.id}
                                    livro={livro}
                                    className="w-[160px] flex-[0_0_160px] snap-start"
                                />
                            ))}
                        </div>
                    </section>

                    <section className="mb-[24px]">
                        <BookSectionHeader
                            title={tituloRecomendados}
                            action={
                                <a
                                    href={
                                        temRecomendados
                                            ? `/biblioteca/livros?${queryRecomendados}`
                                            : `/biblioteca/livros?${query}`
                                    }
                                    className="text-[13px] text-(--brotero-texto-link) whitespace-nowrap hover:text-(--brotero-texto-link-hover) hover:underline"
                                >
                                    Ver mais
                                </a>
                            }
                        />
                        {temRecomendados ? (
                            <div
                                className="flex gap-[16px] overflow-x-auto pb-[6px] snap-x snap-proximity"
                                aria-label="Livros recomendados por autor em destaque"
                            >
                                {livrosRecomendados.map((livro) => (
                                    <CardLivro
                                        key={livro.id}
                                        livro={livro}
                                        className="w-[160px] flex-[0_0_160px] snap-start"
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-[16px] max-[768px]:grid-cols-[repeat(auto-fill,minmax(130px,1fr))] max-[768px]:gap-[12px]">
                                <BibliotecaSectionPlaceholder>
                                    Quando houver livros com autores na base de dados, sugerimos aqui outras
                                    obras do autor mais presente nos novos títulos.
                                </BibliotecaSectionPlaceholder>
                            </div>
                        )}
                    </section>

                    <section className="mb-[24px]">
                        <BookSectionHeader
                            title="Os mais pedidos"
                            action={
                                <a
                                    href={`/biblioteca/livros?${query}`}
                                    className="text-[13px] text-(--brotero-texto-link) whitespace-nowrap hover:text-(--brotero-texto-link-hover) hover:underline"
                                >
                                    Ver mais
                                </a>
                            }
                        />
                        {temMaisPedidos ? (
                            <div
                                className="flex gap-[16px] overflow-x-auto pb-[6px] snap-x snap-proximity"
                                aria-label="Livros mais requisitados"
                            >
                                {livrosMaisPedidos.map((livro) => (
                                    <CardLivro
                                        key={livro.id}
                                        livro={livro}
                                        className="w-[160px] flex-[0_0_160px] snap-start"
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-[16px] max-[768px]:grid-cols-[repeat(auto-fill,minmax(130px,1fr))] max-[768px]:gap-[12px]">
                                <BibliotecaSectionPlaceholder>
                                    Ainda não há requisições registadas por livro. Quando os leitores requisitarem
                                    obras, as mais pedidas aparecerão aqui (por número de pedidos).
                                </BibliotecaSectionPlaceholder>
                            </div>
                        )}
                    </section>

                    <BibliotecaRankingCatalogo ranking={rankingCatalogo} />
                </BibliotecaMainRow>
            </BibliotecaPageShell>
        </>
    );
}
