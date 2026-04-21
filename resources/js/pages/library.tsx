import { Head } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { BibliotecaCatalogSearchBar } from '@/components/biblioteca/BibliotecaCatalogSearchBar';
import { BibliotecaCatalogShell } from '@/components/biblioteca/BibliotecaCatalogShell';
import { BibliotecaCategoryChips } from '@/components/biblioteca/BibliotecaCategoryChips';
import type { AutorFiltroOption } from '@/components/biblioteca/BibliotecaFiltrosAvancados';
import { BibliotecaFiltrosAvancados } from '@/components/biblioteca/BibliotecaFiltrosAvancados';
import type { RankingCatalogoEntrada } from '@/components/biblioteca/BibliotecaRankingCatalogo';
import { BibliotecaRankingCatalogo } from '@/components/biblioteca/BibliotecaRankingCatalogo';
import { BibliotecaSectionPlaceholder } from '@/components/biblioteca/BibliotecaSectionPlaceholder';
import { BookSectionHeader } from '@/components/biblioteca/BookSectionHeader';
import { CardLivro } from '@/components/CardLivro';
import { useBibliotecaLivrosPolling } from '@/hooks/useBibliotecaLivrosPolling';
import { useHorizontalDragScroll } from '@/hooks/useHorizontalDragScroll';
import { cn } from '@/lib/utils';
import type { Category, LivroCatalogo } from '@/types';

type LibraryProps = {
    livros: LivroCatalogo[];
    /** Sugestões de obras do mesmo autor em sintonia com as novidades em destaque. */
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
    const {
        scrollRef: novosScrollRef,
        onMouseDown: novosOnMouseDown,
        onClickCapture: novosOnClickCapture,
    } = useHorizontalDragScroll();
    const {
        scrollRef: maisPedidosScrollRef,
        onMouseDown: maisPedidosOnMouseDown,
        onClickCapture: maisPedidosOnClickCapture,
    } = useHorizontalDragScroll();
    const lista = useBibliotecaLivrosPolling(livros, {
        categoriaSelecionada,
        q,
        lingua,
        authorSelecionado,
        ano,
    });
    const query = buildBibliotecaQuery(
        categoriaSelecionada,
        q,
        lingua,
        authorSelecionado,
        ano,
    );
    const temRecomendados = livrosRecomendados.length > 0;
    const qParaAutor =
        q !== null && q !== undefined && String(q).trim() !== ''
            ? q
            : recomendadoAutorNome !== null &&
                recomendadoAutorNome !== undefined &&
                recomendadoAutorNome.trim() !== ''
              ? recomendadoAutorNome.trim()
              : null;
    const queryRecomendados = buildBibliotecaQuery(
        categoriaSelecionada,
        qParaAutor,
        lingua,
    );
    const tituloRecomendados = recomendadoAutorNome?.trim()
        ? `Recomendado para si · ${recomendadoAutorNome.trim()}`
        : 'Recomendado para si';

    const temMaisPedidos = livrosMaisPedidos.length > 0;
    const scrollNovos = (delta: number) => {
        novosScrollRef.current?.scrollBy({ left: delta, behavior: 'smooth' });
    };
    const scrollMaisPedidos = (delta: number) => {
        maisPedidosScrollRef.current?.scrollBy({ left: delta, behavior: 'smooth' });
    };
    const carrosselArrowBtnClass = 'btn-brotero btn-brotero-icon btn-sm';
    const carrosselCardClass =
        'w-[160px] flex-[0_0_160px] snap-start rounded-[18px] border-(--brotero-borda-suave) shadow-[0_8px_22px_rgba(42,38,48,0.06)]';

    return (
        <>
            <Head title="Biblioteca Brotero" />

            <BibliotecaCatalogShell>
                <div className="mb-[22px] flex flex-col gap-[18px] pt-[14px] lg:pt-0">
                    <BibliotecaCatalogSearchBar
                        formAction="/biblioteca"
                        defaultQuery={q}
                        categoriaSelecionada={categoriaSelecionada}
                        lingua={lingua}
                        authorSelecionado={authorSelecionado}
                        ano={ano}
                    />
                    <BibliotecaCategoryChips
                        categorias={categorias}
                        categoriaSelecionada={categoriaSelecionada}
                        q={q}
                        lingua={lingua}
                        authorId={authorSelecionado}
                        ano={ano}
                        basePath="/biblioteca"
                    />
                </div>

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

                <section className="mb-[28px]">
                    <BookSectionHeader
                        title="Novos livros adicionados"
                        action={
                            <div className="flex items-center gap-[10px]">
                                <div className="hidden items-center gap-[4px] sm:flex">
                                    <button
                                        type="button"
                                        onClick={() => scrollNovos(-280)}
                                        className={carrosselArrowBtnClass}
                                        aria-label="Deslocar lista para a esquerda"
                                    >
                                        <ChevronLeft
                                            className="size-[20px]"
                                            aria-hidden
                                        />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => scrollNovos(280)}
                                        className={carrosselArrowBtnClass}
                                        aria-label="Deslocar lista para a direita"
                                    >
                                        <ChevronRight
                                            className="size-[20px]"
                                            aria-hidden
                                        />
                                    </button>
                                </div>
                                <a
                                    href={`/biblioteca/livros?${query}`}
                                    className="text-[13px] whitespace-nowrap text-(--brotero-texto-link) hover:text-(--brotero-texto-link-hover) hover:underline"
                                >
                                    Ver mais
                                </a>
                            </div>
                        }
                    />
                    <div
                        ref={novosScrollRef}
                        className="flex cursor-grab snap-x snap-proximity gap-[16px] overflow-x-auto pb-[8px] select-none [-ms-overflow-style:none] [scrollbar-width:none] active:cursor-grabbing [&::-webkit-scrollbar]:hidden"
                        aria-label="Lista de livros recentes"
                        onMouseDown={novosOnMouseDown}
                        onClickCapture={novosOnClickCapture}
                        onDragStart={(e) => e.preventDefault()}
                    >
                        {lista.slice(0, 10).map((livro) => (
                            <CardLivro
                                key={livro.id}
                                livro={livro}
                                className={carrosselCardClass}
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
                                className="text-[13px] whitespace-nowrap text-(--brotero-texto-link) hover:text-(--brotero-texto-link-hover) hover:underline"
                            >
                                Ver mais
                            </a>
                        }
                    />
                    {temRecomendados ? (
                        <div
                            className="flex snap-x snap-proximity gap-[16px] overflow-x-auto pb-[6px]"
                            aria-label="Livros recomendados por autor em destaque"
                        >
                            {livrosRecomendados.map((livro) => (
                                <CardLivro
                                    key={livro.id}
                                    livro={livro}
                                    className={carrosselCardClass}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-[16px] max-[768px]:grid-cols-[repeat(auto-fill,minmax(130px,1fr))] max-[768px]:gap-[12px]">
                            <BibliotecaSectionPlaceholder>
                                Liga novidades a mais obras do mesmo autor: explora o catálogo em «Ver mais».
                            </BibliotecaSectionPlaceholder>
                        </div>
                    )}
                </section>

                <section className="mb-[24px]">
                    <BookSectionHeader
                        title="Os mais pedidos"
                        action={
                            <div className="flex items-center gap-[10px]">
                                <div className="hidden items-center gap-[4px] sm:flex">
                                    <button
                                        type="button"
                                        onClick={() => scrollMaisPedidos(-280)}
                                        className={carrosselArrowBtnClass}
                                        aria-label="Deslocar mais pedidos para a esquerda"
                                    >
                                        <ChevronLeft
                                            className="size-[20px]"
                                            aria-hidden
                                        />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => scrollMaisPedidos(280)}
                                        className={carrosselArrowBtnClass}
                                        aria-label="Deslocar mais pedidos para a direita"
                                    >
                                        <ChevronRight
                                            className="size-[20px]"
                                            aria-hidden
                                        />
                                    </button>
                                </div>
                                <a
                                    href={`/biblioteca/livros?${query}`}
                                    className="text-[13px] whitespace-nowrap text-(--brotero-texto-link) hover:text-(--brotero-texto-link-hover) hover:underline"
                                >
                                    Ver mais
                                </a>
                            </div>
                        }
                    />
                    {temMaisPedidos ? (
                        <div
                            ref={maisPedidosScrollRef}
                            className="flex cursor-grab snap-x snap-proximity gap-[16px] overflow-x-auto pb-[6px] select-none [-ms-overflow-style:none] [scrollbar-width:none] active:cursor-grabbing [&::-webkit-scrollbar]:hidden"
                            aria-label="Livros mais requisitados"
                            onMouseDown={maisPedidosOnMouseDown}
                            onClickCapture={maisPedidosOnClickCapture}
                            onDragStart={(e) => e.preventDefault()}
                        >
                            {livrosMaisPedidos.map((livro) => (
                                <CardLivro
                                    key={livro.id}
                                    livro={livro}
                                    className={carrosselCardClass}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-[16px] max-[768px]:grid-cols-[repeat(auto-fill,minmax(130px,1fr))] max-[768px]:gap-[12px]">
                            <BibliotecaSectionPlaceholder>
                                Veja o que mais circula entre leitores: abra
                                «Ver mais» ou o ranking para descobrir títulos
                                em destaque na comunidade.
                            </BibliotecaSectionPlaceholder>
                        </div>
                    )}
                </section>

                <BibliotecaRankingCatalogo ranking={rankingCatalogo} />
            </BibliotecaCatalogShell>
        </>
    );
}
