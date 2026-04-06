import { Head } from '@inertiajs/react';
import { useMemo } from 'react';
import { BibliotecaCatalogSearchBar } from '@/components/biblioteca/BibliotecaCatalogSearchBar';
import { BibliotecaCatalogShell } from '@/components/biblioteca/BibliotecaCatalogShell';
import { BibliotecaCategoryChips } from '@/components/biblioteca/BibliotecaCategoryChips';
import type { AutorFiltroOption } from '@/components/biblioteca/BibliotecaFiltrosAvancados';
import { BibliotecaFiltrosAvancados } from '@/components/biblioteca/BibliotecaFiltrosAvancados';
import { BookSectionHeader } from '@/components/biblioteca/BookSectionHeader';
import { CatalogoAlfabetoRail } from '@/components/biblioteca/CatalogoAlfabetoRail';
import { CardLivro } from '@/components/CardLivro';
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
}: LibraryAllProps) {
    const qs = buildQuery(
        categoriaSelecionada,
        q,
        lingua,
        authorSelecionado,
        ano,
    );
    const voltarHref = qs ? `/biblioteca?${qs}` : '/biblioteca';

    const gruposPorLetra = useMemo(
        () => ordenarEAgruparLivrosPorLetra(livros),
        [livros],
    );
    const letrasComLivros = useMemo(
        () => new Set(gruposPorLetra.map((g) => g.letter)),
        [gruposPorLetra],
    );

    const cardListaClass =
        'rounded-[18px] border-(--brotero-borda-suave) shadow-[0_8px_22px_rgba(42,38,48,0.06)]';

    return (
        <>
            <Head title="Biblioteca Brotero - Todos os livros" />
            <BibliotecaCatalogShell>
                <div className="mb-[22px] flex flex-col gap-[18px] pt-[14px] lg:pt-0">
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

                <section className="mb-[24px]">
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
                    <div className="flex items-start gap-[8px] min-[900px]:gap-[12px]">
                        <div className="min-w-0 flex-1 space-y-[28px]">
                            {gruposPorLetra.map(({ letter, livros: chunk }) => (
                                <div
                                    key={letter}
                                    id={catalogoSectionId(letter)}
                                    className="scroll-mt-[20px]"
                                >
                                    <h2 className="m-0 mb-[12px] border-b border-(--brotero-borda) pb-[6px] text-[15px] font-bold text-(--brotero-texto)">
                                        {letter === '#'
                                            ? '0–9 e outros'
                                            : letter}
                                    </h2>
                                    <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-[16px] max-[768px]:grid-cols-[repeat(auto-fill,minmax(130px,1fr))] max-[768px]:gap-[12px]">
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
            </BibliotecaCatalogShell>
        </>
    );
}
