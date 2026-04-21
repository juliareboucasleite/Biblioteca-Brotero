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
import type { Category, LivroCatalogo } from '@/types';

type LibraryProps = {
    livros: LivroCatalogo[];
    /** Sugestões de obras do mesmo autor em sintonia com as novidades em destaque. */
    livrosRecomendados?: LivroCatalogo[];
    /** Nome do autor usado nas recomendações (para título e pesquisa «Ver mais»). */
    recomendadoAutorNome?: string | null;
    /** Ordenados por número de requisições (desc). */
    livrosMaisPedidos?: LivroCatalogo[];
    /** Livros com progresso para retomar leitura. */
    livrosEmLeitura?: LivroCatalogo[];
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
    livrosEmLeitura = [],
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
    const {
        scrollRef: emLeituraScrollRef,
        onMouseDown: emLeituraOnMouseDown,
        onClickCapture: emLeituraOnClickCapture,
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

    const showMaisPedidosHome = !categoriaSelecionada || categoriaSelecionada.trim() === '';
    const temEmLeitura = livrosEmLeitura.length > 0;
    const temMaisPedidos = livrosMaisPedidos.length > 0;
    const scrollNovos = (delta: number) => {
        novosScrollRef.current?.scrollBy({ left: delta, behavior: 'smooth' });
    };
    const scrollMaisPedidos = (delta: number) => {
        maisPedidosScrollRef.current?.scrollBy({ left: delta, behavior: 'smooth' });
    };
    const scrollEmLeitura = (delta: number) => {
        emLeituraScrollRef.current?.scrollBy({ left: delta, behavior: 'smooth' });
    };
    const carrosselArrowBtnClass = 'btn-brotero btn-brotero-icon btn-sm';
    const carrosselCardClass =
        'w-[160px] flex-[0_0_160px] snap-start rounded-[18px] border-(--brotero-borda-suave) shadow-[0_8px_22px_rgba(42,38,48,0.06)]';

    return (
        <>
            <Head title="Biblioteca Brotero" />

            <BibliotecaCatalogShell>
                <div className="mb-5.5 flex flex-col gap-4.5 pt-3.5 lg:pt-0">
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
                        basePath="/biblioteca/livros"
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

                {showMaisPedidosHome ? (
                    <section className="mb-6">
                        <BookSectionHeader
                            title="Mais pedidos na comunidade"
                            action={
                                <div className="flex items-center gap-2.5">
                                    <div className="hidden items-center gap-1 sm:flex">
                                        <button
                                            type="button"
                                            onClick={() => scrollMaisPedidos(-280)}
                                            className={carrosselArrowBtnClass}
                                            aria-label="Deslocar mais pedidos para a esquerda"
                                        >
                                            <ChevronLeft
                                                className="size-5"
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
                                                className="size-5"
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
                                className="flex cursor-grab snap-x snap-proximity gap-4 overflow-x-auto pb-1.5 select-none [-ms-overflow-style:none] [scrollbar-width:none] active:cursor-grabbing [&::-webkit-scrollbar]:hidden"
                                aria-label="Mais pedidos na comunidade"
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
                            <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-4 max-[768px]:grid-cols-[repeat(auto-fill,minmax(130px,1fr))] max-[768px]:gap-3">
                                <BibliotecaSectionPlaceholder>
                                    Veja os livros mais pedidos da comunidade
                                    em «Ver mais» ou no ranking.
                                </BibliotecaSectionPlaceholder>
                            </div>
                        )}
                    </section>
                ) : null}

                <section className="mb-7">
                    <BookSectionHeader
                        title="Novos livros adicionados"
                        action={
                            <div className="flex items-center gap-2.5">
                                <div className="hidden items-center gap-1 sm:flex">
                                    <button
                                        type="button"
                                        onClick={() => scrollNovos(-280)}
                                        className={carrosselArrowBtnClass}
                                        aria-label="Deslocar lista para a esquerda"
                                    >
                                        <ChevronLeft
                                            className="size-5"
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
                                            className="size-5"
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
                        className="flex cursor-grab snap-x snap-proximity gap-4 overflow-x-auto pb-2 select-none [-ms-overflow-style:none] [scrollbar-width:none] active:cursor-grabbing [&::-webkit-scrollbar]:hidden"
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

                <section className="mb-6">
                    <BookSectionHeader
                        title="A ler agora (retomar)"
                        action={
                            <div className="flex items-center gap-2.5">
                                <div className="hidden items-center gap-1 sm:flex">
                                    <button
                                        type="button"
                                        onClick={() => scrollEmLeitura(-280)}
                                        className={carrosselArrowBtnClass}
                                        aria-label="Deslocar leitura atual para a esquerda"
                                    >
                                        <ChevronLeft className="size-5" aria-hidden />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => scrollEmLeitura(280)}
                                        className={carrosselArrowBtnClass}
                                        aria-label="Deslocar leitura atual para a direita"
                                    >
                                        <ChevronRight className="size-5" aria-hidden />
                                    </button>
                                </div>
                                <a
                                    href="/biblioteca/conta/favoritos"
                                    className="text-[13px] whitespace-nowrap text-(--brotero-texto-link) hover:text-(--brotero-texto-link-hover) hover:underline"
                                >
                                    Ver listas
                                </a>
                            </div>
                        }
                    />
                    {temEmLeitura ? (
                        <div
                            ref={emLeituraScrollRef}
                            className="flex cursor-grab snap-x snap-proximity gap-4 overflow-x-auto pb-1.5 select-none [-ms-overflow-style:none] [scrollbar-width:none] active:cursor-grabbing [&::-webkit-scrollbar]:hidden"
                            aria-label="Livros para retomar leitura"
                            onMouseDown={emLeituraOnMouseDown}
                            onClickCapture={emLeituraOnClickCapture}
                            onDragStart={(e) => e.preventDefault()}
                        >
                            {livrosEmLeitura.map((livro) => (
                                <CardLivro
                                    key={livro.id}
                                    livro={livro}
                                    className={carrosselCardClass}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-4 max-[768px]:grid-cols-[repeat(auto-fill,minmax(130px,1fr))] max-[768px]:gap-3">
                            <BibliotecaSectionPlaceholder>
                                Quando começar livros nas suas listas, eles aparecem aqui para retomar leitura.
                            </BibliotecaSectionPlaceholder>
                        </div>
                    )}
                </section>

                <section className="mb-6">
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
                            className="flex snap-x snap-proximity gap-4 overflow-x-auto pb-1.5"
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
                        <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-4 max-[768px]:grid-cols-[repeat(auto-fill,minmax(130px,1fr))] max-[768px]:gap-3">
                            <BibliotecaSectionPlaceholder>
                                Liga novidades a mais obras do mesmo autor: explora o catálogo em «Ver mais».
                            </BibliotecaSectionPlaceholder>
                        </div>
                    )}
                </section>

                <BibliotecaRankingCatalogo ranking={rankingCatalogo} />
            </BibliotecaCatalogShell>
        </>
    );
}
