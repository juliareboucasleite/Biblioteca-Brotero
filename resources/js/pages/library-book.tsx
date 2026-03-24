import { Head } from '@inertiajs/react';
import { isLivroPlaceholder } from '@/components/biblioteca/biblioteca-constants';
import { BibliotecaMainRow } from '@/components/biblioteca/BibliotecaMainRow';
import { BibliotecaPageShell } from '@/components/biblioteca/BibliotecaPageShell';
import { BookCover } from '@/components/biblioteca/BookCover';
import { BookDetailContent } from '@/components/biblioteca/BookDetailContent';
import { BookRecommendationsByAuthor } from '@/components/biblioteca/BookRecommendationsByAuthor';
import { BookRecommendationsByCategory } from '@/components/biblioteca/BookRecommendationsByCategory';
import { BookRecommendationsRow } from '@/components/biblioteca/BookRecommendationsRow';
import { BookRequestAside } from '@/components/biblioteca/BookRequestAside';
import { useBookDetailApi } from '@/hooks/useBookDetailApi';
import type { LivroCatalogo } from '@/types';

type LibraryBookProps = {
    livro: LivroCatalogo;
};

export default function LibraryBook({ livro }: LibraryBookProps) {
    const placeholder = isLivroPlaceholder(livro.titulo);
    const bookApi = useBookDetailApi(livro.id, !placeholder);

    const coverSrc = (bookApi?.cover_image ?? livro.capa) || null;
    const authorsFromApi = bookApi?.authors?.map((a) => a?.name?.trim()).filter(Boolean) ?? [];
    const authorsLabel = authorsFromApi.length > 0 ? authorsFromApi.join(', ') : livro.autor;

    const categoriesFromApi =
        bookApi?.categories
            ?.map((c) => c?.name?.trim())
            .filter((x): x is string => Boolean(x)) ?? [];
    const categoriesLabel = categoriesFromApi.join(', ');

    const pageTitle = placeholder ? 'Biblioteca Brotero — Livro' : `${livro.titulo} — Biblioteca Brotero`;

    return (
        <>
            <Head title={pageTitle} />

            <BibliotecaPageShell>
                <BibliotecaMainRow className="pt-[24px] pb-[48px]">
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

                    {bookApi?.category_recommendations?.length ? (
                        <BookRecommendationsByCategory
                            recommendations={bookApi.category_recommendations}
                            categoriesSummary={categoriesLabel}
                        />
                    ) : null}

                    {bookApi?.fallback_recommendations?.length ? (
                        <BookRecommendationsRow
                            title="Mais livros no catálogo"
                            recommendations={bookApi.fallback_recommendations}
                            ariaLabel="Outros livros no catálogo"
                        />
                    ) : null}
                </BibliotecaMainRow>
            </BibliotecaPageShell>
        </>
    );
}
