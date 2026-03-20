import { Head } from '@inertiajs/react';
import { BibliotecaFiltrosAvancados } from '@/components/biblioteca/BibliotecaFiltrosAvancados';
import { BibliotecaMainRow } from '@/components/biblioteca/BibliotecaMainRow';
import { BibliotecaPageShell } from '@/components/biblioteca/BibliotecaPageShell';
import { BookSectionHeader } from '@/components/biblioteca/BookSectionHeader';
import { CardLivro } from '@/components/CardLivro';
import CategorySidebar from '@/components/CategorySidebar';
import type { Category, LivroCatalogo } from '@/types';

type LibraryAllProps = {
    livros: LivroCatalogo[];
    categorias: Category[];
    categoriaSelecionada?: string | null;
    q?: string | null;
    lingua?: string | null;
};

export default function LibraryAll({
    livros,
    categorias,
    categoriaSelecionada,
    q,
    lingua,
}: LibraryAllProps) {
    const voltarHref = categoriaSelecionada
        ? `/biblioteca?categoria=${encodeURIComponent(categoriaSelecionada)}`
        : '/biblioteca';

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
                            todosLivros
                        />
                    }
                >
                    <BibliotecaFiltrosAvancados
                        formAction="/biblioteca/livros"
                        categoriaSelecionada={categoriaSelecionada}
                        q={q}
                        lingua={lingua}
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
                        <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-[16px] max-[768px]:grid-cols-[repeat(auto-fill,minmax(130px,1fr))] max-[768px]:gap-[12px]">
                            {livros.map((livro) => (
                                <CardLivro key={livro.id} livro={livro} />
                            ))}
                        </div>
                    </section>
                </BibliotecaMainRow>
            </BibliotecaPageShell>
        </>
    );
}
