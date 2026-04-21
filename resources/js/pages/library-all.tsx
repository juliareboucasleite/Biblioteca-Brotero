import { Head } from '@inertiajs/react';
import { useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { BibliotecaCatalogSearchBar } from '@/components/biblioteca/BibliotecaCatalogSearchBar';
import { BibliotecaCatalogShell } from '@/components/biblioteca/BibliotecaCatalogShell';
import { BibliotecaCategoryChips } from '@/components/biblioteca/BibliotecaCategoryChips';
import type { AutorFiltroOption } from '@/components/biblioteca/BibliotecaFiltrosAvancados';
import { BibliotecaFiltrosAvancados } from '@/components/biblioteca/BibliotecaFiltrosAvancados';
import { BookSectionHeader } from '@/components/biblioteca/BookSectionHeader';
import { BibliotecaSectionPlaceholder } from '@/components/biblioteca/BibliotecaSectionPlaceholder';
import { CatalogoAlfabetoRail } from '@/components/biblioteca/CatalogoAlfabetoRail';
import { CardLivro } from '@/components/CardLivro';
import { useHorizontalDragScroll } from '@/hooks/useHorizontalDragScroll';
import {
    catalogoSectionId,
    ordenarEAgruparLivrosPorLetra,
} from '@/lib/catalogo-alfabeto';
import type { Category, LivroCatalogo } from '@/types';

type LibraryAllProps = {
    livros: LivroCatalogo[];
    categorias: Category[];
    categoriaSelecionada?: string | null;
    q?: string | null;
    lingua?: string | null;
    autores?: AutorFiltroOption[];
    authorSelecionado?: string | null;
    ano?: string | null;
    livrosRecentesCategoria?: LivroCatalogo[];
    livrosMaisPedidosCategoria?: LivroCatalogo[];
    livrosRecomendadosCategoria?: LivroCatalogo[];
};

function buildQuery(
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

export default function LibraryAll({
    livros,
    categorias,
    categoriaSelecionada,
    q,
    lingua,
    autores = [],
    authorSelecionado,
    ano,
    livrosRecentesCategoria = [],
    livrosMaisPedidosCategoria = [],
    livrosRecomendadosCategoria = [],
}: LibraryAllProps) {
    const {
        scrollRef: categoriaScrollRef,
        onMouseDown: categoriaOnMouseDown,
        onClickCapture: categoriaOnClickCapture,
    } = useHorizontalDragScroll();
    const {
        scrollRef: bestsellersScrollRef,
        onMouseDown: bestsellersOnMouseDown,
        onClickCapture: bestsellersOnClickCapture,
    } = useHorizontalDragScroll();
    const {
        scrollRef: recentesScrollRef,
        onMouseDown: recentesOnMouseDown,
        onClickCapture: recentesOnClickCapture,
    } = useHorizontalDragScroll();
    const {
        scrollRef: recomendadosScrollRef,
        onMouseDown: recomendadosOnMouseDown,
        onClickCapture: recomendadosOnClickCapture,
    } = useHorizontalDragScroll();
    const qs = buildQuery(
        categoriaSelecionada,
        q,
        lingua,
        authorSelecionado,
        ano,
    );
    const voltarHref = qs ? `/biblioteca?${qs}` : '/biblioteca';
    const isCategoriaSelecionada = Boolean(categoriaSelecionada);
    const categoriaAtual = categorias.find(
        (c) => String(c.id) === String(categoriaSelecionada ?? ''),
    );
    const tituloCategoria = categoriaAtual?.name ?? 'Categoria';
    const mostrarBestsellersCategoria = String(categoriaSelecionada ?? '') === '67';

    const gruposPorLetra = useMemo(
        () => ordenarEAgruparLivrosPorLetra(livros),
        [livros],
    );
    const letrasComLivros = useMemo(
        () => new Set(gruposPorLetra.map((g) => g.letter)),
        [gruposPorLetra],
    );

    const carrosselCardClass =
        'w-[160px] flex-[0_0_160px] snap-start rounded-[18px] border-(--brotero-borda-suave) shadow-[0_8px_22px_rgba(42,38,48,0.06)]';
    const cardListaClass =
        'rounded-[18px] border-(--brotero-borda-suave) shadow-[0_8px_22px_rgba(42,38,48,0.06)]';
    const carrosselArrowBtnClass = 'btn-brotero btn-brotero-icon btn-sm';
    const scrollCategoria = (delta: number) => {
        categoriaScrollRef.current?.scrollBy({ left: delta, behavior: 'smooth' });
    };
    const scrollBestsellers = (delta: number) => {
        bestsellersScrollRef.current?.scrollBy({ left: delta, behavior: 'smooth' });
    };
    const scrollRecentes = (delta: number) => {
        recentesScrollRef.current?.scrollBy({ left: delta, behavior: 'smooth' });
    };
    const scrollRecomendados = (delta: number) => {
        recomendadosScrollRef.current?.scrollBy({ left: delta, behavior: 'smooth' });
    };

    return (
        <>
            <Head title="Biblioteca Brotero - Todos os livros" />
            <BibliotecaCatalogShell>
                <div className="mb-5.5 flex flex-col gap-4.5 pt-3.5 lg:pt-0">
                    <BibliotecaCatalogSearchBar
                        formAction="/biblioteca/livros"
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
                    formAction="/biblioteca/livros"
                    categoriaSelecionada={categoriaSelecionada}
                    q={q}
                    lingua={lingua}
                    autores={autores}
                    authorSelecionado={authorSelecionado}
                    ano={ano}
                    autoSubmitLingua
                />

                {isCategoriaSelecionada ? (
                    <>
                        {!mostrarBestsellersCategoria ? (
                            <section className="mb-6">
                                <BookSectionHeader
                                    title={tituloCategoria}
                                    action={
                                        <div className="flex items-center gap-2.5">
                                            <div className="hidden items-center gap-1 sm:flex">
                                                <button
                                                    type="button"
                                                    onClick={() => scrollCategoria(-280)}
                                                    className={carrosselArrowBtnClass}
                                                    aria-label="Deslocar lista para a esquerda"
                                                >
                                                    <ChevronLeft className="size-5" aria-hidden />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => scrollCategoria(280)}
                                                    className={carrosselArrowBtnClass}
                                                    aria-label="Deslocar lista para a direita"
                                                >
                                                    <ChevronRight className="size-5" aria-hidden />
                                                </button>
                                            </div>
                                            <a
                                                href={voltarHref}
                                                className="text-[13px] whitespace-nowrap text-(--brotero-texto-link) hover:text-(--brotero-texto-link-hover) hover:underline"
                                            >
                                                Voltar
                                            </a>
                                        </div>
                                    }
                                />
                                <div
                                    ref={categoriaScrollRef}
                                    className="flex cursor-grab snap-x snap-proximity gap-4 overflow-x-auto pb-2 select-none [-ms-overflow-style:none] [scrollbar-width:none] active:cursor-grabbing [&::-webkit-scrollbar]:hidden"
                                    aria-label={`Livros da categoria ${tituloCategoria}`}
                                    onMouseDown={categoriaOnMouseDown}
                                    onClickCapture={categoriaOnClickCapture}
                                    onDragStart={(e) => e.preventDefault()}
                                >
                                    {livros.map((livro) => (
                                        <CardLivro
                                            key={livro.id}
                                            livro={livro}
                                            className={carrosselCardClass}
                                        />
                                    ))}
                                </div>
                            </section>
                        ) : null}

                        {mostrarBestsellersCategoria ? (
                            <section className="mb-6">
                                {livrosMaisPedidosCategoria.length > 0 ? (
                                    <>
                                        <BookSectionHeader title="Bestsellers" />
                                        <div className="flex items-center gap-2.5 mb-3">
                                            <div className="hidden items-center gap-1 sm:flex">
                                                <button
                                                    type="button"
                                                    onClick={() => scrollBestsellers(-280)}
                                                    className={carrosselArrowBtnClass}
                                                    aria-label="Deslocar lista para a esquerda"
                                                >
                                                    <ChevronLeft className="size-5" aria-hidden />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => scrollBestsellers(280)}
                                                    className={carrosselArrowBtnClass}
                                                    aria-label="Deslocar lista para a direita"
                                                >
                                                    <ChevronRight className="size-5" aria-hidden />
                                                </button>
                                            </div>
                                        </div>
                                        <div
                                            ref={bestsellersScrollRef}
                                            className="flex cursor-grab snap-x snap-proximity gap-4 overflow-x-auto pb-2 select-none [-ms-overflow-style:none] [scrollbar-width:none] active:cursor-grabbing [&::-webkit-scrollbar]:hidden"
                                            aria-label="Bestsellers da categoria"
                                            onMouseDown={bestsellersOnMouseDown}
                                            onClickCapture={bestsellersOnClickCapture}
                                            onDragStart={(e) => e.preventDefault()}
                                        >
                                            {livrosMaisPedidosCategoria.map((livro) => (
                                                <CardLivro
                                                    key={livro.id}
                                                    livro={livro}
                                                    className={carrosselCardClass}
                                                />
                                            ))}
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <BookSectionHeader title="Bestsellers" />
                                        <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-4 max-[768px]:grid-cols-[repeat(auto-fill,minmax(130px,1fr))] max-[768px]:gap-3">
                                            <BibliotecaSectionPlaceholder>
                                                Ainda não há bestsellers suficientes nesta categoria.
                                            </BibliotecaSectionPlaceholder>
                                        </div>
                                    </>
                                )}
                            </section>
                        ) : null}

                        <section className="mb-6">
                        {livrosRecomendadosCategoria.length > 0 ? (
                            <>
                                <BookSectionHeader title="Recomendados por estilo" />
                                <div className="flex items-center gap-2.5 mb-3">
                                    <div className="hidden items-center gap-1 sm:flex">
                                        <button
                                            type="button"
                                            onClick={() => scrollRecomendados(-280)}
                                            className={carrosselArrowBtnClass}
                                            aria-label="Deslocar lista para a esquerda"
                                        >
                                            <ChevronLeft className="size-5" aria-hidden />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => scrollRecomendados(280)}
                                            className={carrosselArrowBtnClass}
                                            aria-label="Deslocar lista para a direita"
                                        >
                                            <ChevronRight className="size-5" aria-hidden />
                                        </button>
                                    </div>
                                </div>
                                <div
                                    ref={recomendadosScrollRef}
                                    className="flex cursor-grab snap-x snap-proximity gap-4 overflow-x-auto pb-2 select-none [-ms-overflow-style:none] [scrollbar-width:none] active:cursor-grabbing [&::-webkit-scrollbar]:hidden"
                                    aria-label="Recomendados por estilo"
                                    onMouseDown={recomendadosOnMouseDown}
                                    onClickCapture={recomendadosOnClickCapture}
                                    onDragStart={(e) => e.preventDefault()}
                                >
                                    {livrosRecomendadosCategoria.map((livro) => (
                                        <CardLivro
                                            key={livro.id}
                                            livro={livro}
                                            className={carrosselCardClass}
                                        />
                                    ))}
                                </div>
                            </>
                        ) : (
                            <>
                                <BookSectionHeader title="Recomendados por estilo" />
                                <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-4 max-[768px]:grid-cols-[repeat(auto-fill,minmax(130px,1fr))] max-[768px]:gap-3">
                                    <BibliotecaSectionPlaceholder>
                                        Não há recomendações suficientes para esta categoria.
                                    </BibliotecaSectionPlaceholder>
                                </div>
                            </>
                        )}
                        </section>
                    </>
                ) : (
                    <section className="mb-6">
                        <BookSectionHeader
                            title="Todos os livros"
                            action={
                                <a
                                    href={voltarHref}
                                    className="text-[13px] whitespace-nowrap text-(--brotero-texto-link) hover:text-(--brotero-texto-link-hover) hover:underline"
                                >
                                    Voltar
                                </a>
                            }
                        />
                        <div className="flex items-start gap-2 min-[900px]:gap-3">
                            <div className="min-w-0 flex-1 space-y-7">
                                {gruposPorLetra.map(({ letter, livros: chunk }) => (
                                    <div
                                        key={letter}
                                        id={catalogoSectionId(letter)}
                                        className="scroll-mt-5"
                                    >
                                        <h2 className="m-0 mb-3 border-b border-(--brotero-borda) pb-1.5 text-[15px] font-bold text-(--brotero-texto)">
                                            {letter === '#'
                                                ? '0–9 e outros'
                                                : letter}
                                        </h2>
                                        <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-4 max-[768px]:grid-cols-[repeat(auto-fill,minmax(130px,1fr))] max-[768px]:gap-3">
                                            {chunk.map((livro) => (
                                                <CardLivro
                                                    key={livro.id}
                                                    livro={livro}
                                                    className={cardListaClass}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <CatalogoAlfabetoRail
                                letrasComLivros={letrasComLivros}
                            />
                        </div>
                    </section>
                )}
            </BibliotecaCatalogShell>
        </>
    );
}
