import { Head } from '@inertiajs/react';
import { useMemo } from 'react';
import { BibliotecaFiltrosAvancados } from '@/components/biblioteca/BibliotecaFiltrosAvancados';
import type { AutorFiltroOption } from '@/components/biblioteca/BibliotecaFiltrosAvancados';
import { BibliotecaMainRow } from '@/components/biblioteca/BibliotecaMainRow';
import { BibliotecaPageShell } from '@/components/biblioteca/BibliotecaPageShell';
import { BookSectionHeader } from '@/components/biblioteca/BookSectionHeader';
import { CatalogoAlfabetoRail } from '@/components/biblioteca/CatalogoAlfabetoRail';
import { CardLivro } from '@/components/CardLivro';
import CategorySidebar from '@/components/CategorySidebar';
import { catalogoSectionId, ordenarEAgruparLivrosPorLetra } from '@/lib/catalogo-alfabeto';
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
    const qs = buildQuery(categoriaSelecionada, q, lingua, authorSelecionado, ano);
    const voltarHref = qs ? `/biblioteca?${qs}` : '/biblioteca';

    const gruposPorLetra = useMemo(() => ordenarEAgruparLivrosPorLetra(livros), [livros]);
    const letrasComLivros = useMemo(
        () => new Set(gruposPorLetra.map((g) => g.letter)),
        [gruposPorLetra],
    );

    return (
        <>
            <Head title="Biblioteca Brotero - Todos os livros" />
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
                            todosLivros
                        />
                    }
                >
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
                                    className="text-[13px] text-(--brotero-texto-link) whitespace-nowrap hover:text-(--brotero-texto-link-hover) hover:underline"
                                >
                                    Voltar
                                </a>
                            }
                        />
                        <div className="flex gap-[8px] items-start min-[900px]:gap-[12px]">
                            <div className="min-w-0 flex-1 space-y-[28px]">
                                {gruposPorLetra.map(({ letter, livros: chunk }) => (
                                    <div
                                        key={letter}
                                        id={catalogoSectionId(letter)}
                                        className="scroll-mt-[20px]"
                                    >
                                        <h2 className="m-0 mb-[12px] text-[15px] font-bold text-(--brotero-texto) border-b border-(--brotero-borda) pb-[6px]">
                                            {letter === '#' ? '0–9 e outros' : letter}
                                        </h2>
                                        <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-[16px] max-[768px]:grid-cols-[repeat(auto-fill,minmax(130px,1fr))] max-[768px]:gap-[12px]">
                                            {chunk.map((livro) => (
                                                <CardLivro key={livro.id} livro={livro} />
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <CatalogoAlfabetoRail letrasComLivros={letrasComLivros} />
                        </div>
                    </section>
                </BibliotecaMainRow>
            </BibliotecaPageShell>
        </>
    );
}
