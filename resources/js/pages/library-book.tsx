import { Head } from '@inertiajs/react';
import { isLivroPlaceholder } from '@/components/biblioteca/biblioteca-constants';
import { BibliotecaMainRow } from '@/components/biblioteca/BibliotecaMainRow';
import { BibliotecaPageShell } from '@/components/biblioteca/BibliotecaPageShell';
import { BookCover } from '@/components/biblioteca/BookCover';
import { BookDetailContent } from '@/components/biblioteca/BookDetailContent';
import { BookRecommendationsByAuthor } from '@/components/biblioteca/BookRecommendationsByAuthor';
import { BookRequestAside } from '@/components/biblioteca/BookRequestAside';
import CategorySidebar from '@/components/CategorySidebar';
import { useBookDetailApi } from '@/hooks/useBookDetailApi';
import type { Category, LivroCatalogo } from '@/types';

type LibraryBookProps = {
    livro: LivroCatalogo;
    categorias: Category[];
};

export default function LibraryBook({ livro, categorias }: LibraryBookProps) {
    const placeholder = isLivroPlaceholder(livro.titulo);
    const bookApi = useBookDetailApi(livro.id, !placeholder);

    const coverSrc = (bookApi?.cover_image ?? livro.capa) || null;
    const authorsFromApi = bookApi?.authors?.map((a) => a?.name?.trim()).filter(Boolean) ?? [];
    const authorsLabel = authorsFromApi.length > 0 ? authorsFromApi.join(', ') : livro.autor;

    const pageTitle = placeholder ? 'Biblioteca Brotero — Livro' : `${livro.titulo} — Biblioteca Brotero`;

    return (
        <>
            <Head title={pageTitle} />

            <BibliotecaPageShell>
                <BibliotecaMainRow
                    className="pt-[24px] pb-[48px]"
                    sidebar={<CategorySidebar categorias={categorias} todosLivros />}
                >
                    <p className="m-0 mb-[24px]">
                        <a
                            href="/biblioteca/livros"
                            className="text-[14px] text-(--brotero-texto-link) hover:underline"
                        >
                            ← Voltar ao catálogo
                        </a>
                    </p>
                    <div className="grid grid-cols-[280px_1fr_320px] gap-[32px] items-start max-[900px]:grid-cols-2 max-[600px]:grid-cols-1">
                        <BookCover coverSrc={coverSrc} titulo={livro.titulo} placeholder={placeholder} />
                        <BookDetailContent
                            livro={livro}
                            placeholder={placeholder}
                            bookApi={bookApi}
                            authorsLabel={authorsLabel}
                        />
                        <BookRequestAside livro={livro} placeholder={placeholder} />
                    </div>

                    {bookApi?.recommendations?.length ? (
                        <BookRecommendationsByAuthor
                            recommendations={bookApi.recommendations}
                            authorsSummary={authorsLabel}
                        />
                    ) : null}
                </BibliotecaMainRow>
            </BibliotecaPageShell>
        </>
    );
}
