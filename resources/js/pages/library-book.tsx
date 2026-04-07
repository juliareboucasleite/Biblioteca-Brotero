import { Head, usePage } from '@inertiajs/react';
import { isLivroPlaceholder } from '@/components/biblioteca/biblioteca-constants';
import { BibliotecaCatalogShell } from '@/components/biblioteca/BibliotecaCatalogShell';
import { BookCover } from '@/components/biblioteca/BookCover';
import { BookDetailContent } from '@/components/biblioteca/BookDetailContent';
import { BookPatronShareSection } from '@/components/biblioteca/BookPatronShareSection';
import { BookRecommendationsByAuthor } from '@/components/biblioteca/BookRecommendationsByAuthor';
import { BookRecommendationsByCategory } from '@/components/biblioteca/BookRecommendationsByCategory';
import { BookRecommendationsRow } from '@/components/biblioteca/BookRecommendationsRow';
import { BookEbookAside } from '@/components/biblioteca/BookEbookAside';
import { BookRequestAside } from '@/components/biblioteca/BookRequestAside';
import { useBookDetailApi } from '@/hooks/useBookDetailApi';
import type { LivroCatalogo } from '@/types';
import type { Auth } from '@/types/auth';

type PatronShareProp = {
    id: number;
    message: string | null;
};

type LibraryBookProps = {
    livro: LivroCatalogo;
    patron_share?: PatronShareProp | null;
};

export default function LibraryBook({ livro, patron_share = null }: LibraryBookProps) {
    const { flash, auth } = usePage<{ auth: Auth }>().props;
    const isPatron = Boolean(auth?.patron);
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

            <BibliotecaCatalogShell>
                <div className="pt-[4px] pb-[8px] lg:pt-0">
                    {flash?.success ? (
                        <p
                            className="m-0 mb-[16px] rounded-(--raio) border border-emerald-200/90 bg-emerald-50/95 px-[14px] py-[11px] text-[14px] text-emerald-900 shadow-[0_4px_14px_rgba(5,46,22,0.08)]"
                            role="status"
                        >
                            {flash.success}
                        </p>
                    ) : null}

                    <nav
                        aria-label="Navegação do catálogo"
                        className="m-0 mb-[22px] flex flex-wrap items-center gap-x-[14px] gap-y-[8px] text-[14px]"
                    >
                        <a
                            href="/biblioteca"
                            className="font-semibold text-(--brotero-texto-link) no-underline hover:text-(--brotero-texto-link-hover) hover:underline"
                        >
                            ← Início
                        </a>
                        <span aria-hidden className="text-(--brotero-borda)">
                            ·
                        </span>
                        <a
                            href="/biblioteca/livros"
                            className="text-(--brotero-texto-link) no-underline hover:text-(--brotero-texto-link-hover) hover:underline"
                        >
                            Todos os livros
                        </a>
                    </nav>
                    <div className="grid grid-cols-[280px_1fr_320px] gap-[32px] items-start max-[900px]:grid-cols-2 max-[600px]:grid-cols-1">
                        <BookCover coverSrc={coverSrc} titulo={livro.titulo} placeholder={placeholder} />
                        <BookDetailContent
                            livro={livro}
                            placeholder={placeholder}
                            bookApi={bookApi}
                            authorsLabel={authorsLabel}
                        />
                        {!placeholder && bookApi === null && livro.tem_ebook ? (
                            <aside className="border border-(--brotero-borda) rounded-(--raio) p-[20px] bg-(--brotero-branco) text-[14px] text-(--brotero-texto-cinza) shadow-[0_1px_3px_rgba(0,0,0,0.06)] max-[900px]:col-span-2 max-[600px]:col-span-1">
                                A carregar detalhes do e-book…
                            </aside>
                        ) : bookApi?.has_ebook ? (
                            <BookEbookAside
                                livro={livro}
                                placeholder={placeholder}
                                ebookFormat={bookApi.ebook_format === 'epub' ? 'epub' : 'pdf'}
                                initialDownloadCount={bookApi.ebook_downloads_count ?? 0}
                                isPatron={isPatron}
                            />
                        ) : (
                            <BookRequestAside livro={livro} placeholder={placeholder} />
                        )}
                    </div>

                    <BookPatronShareSection
                        bookId={livro.id}
                        patronShare={patron_share}
                        hidden={placeholder}
                    />

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
                </div>
            </BibliotecaCatalogShell>
        </>
    );
}
