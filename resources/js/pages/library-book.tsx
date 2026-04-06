import { Head, Link, usePage } from '@inertiajs/react';
import { isLivroPlaceholder } from '@/components/biblioteca/biblioteca-constants';
import { BibliotecaCatalogShell } from '@/components/biblioteca/BibliotecaCatalogShell';
import { BookCover } from '@/components/biblioteca/BookCover';
import { BookDetailContent } from '@/components/biblioteca/BookDetailContent';
import { BookPatronShareSection } from '@/components/biblioteca/BookPatronShareSection';
import { BookRecommendationsByAuthor } from '@/components/biblioteca/BookRecommendationsByAuthor';
import { BookRecommendationsByCategory } from '@/components/biblioteca/BookRecommendationsByCategory';
import { BookRecommendationsRow } from '@/components/biblioteca/BookRecommendationsRow';
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

                    {bookApi?.has_ebook && !placeholder ? (
                        <div className="m-0 mb-[18px] flex flex-wrap items-center gap-[12px] rounded-[14px] border border-violet-200/80 bg-linear-to-r from-violet-50/95 to-fuchsia-50/80 px-[16px] py-[12px] text-[14px] text-(--brotero-texto) shadow-[0_6px_20px_rgba(124,58,237,0.12)]">
                            <span className="font-semibold text-violet-900">E-book disponível</span>
                            {auth.patron ? (
                                <Link
                                    href={`/biblioteca/livro/${encodeURIComponent(livro.id)}/ler`}
                                    className="inline-flex items-center rounded-full bg-violet-600 px-[16px] py-[8px] text-[13px] font-semibold text-white no-underline shadow-[0_4px_14px_rgba(124,58,237,0.35)] hover:bg-violet-700"
                                >
                                    {bookApi?.ebook_format === 'epub' ? 'Ler EPUB' : 'Ler PDF'} no browser
                                </Link>
                            ) : (
                                <span className="text-[14px] text-(--brotero-texto-cinza)">
                                    <a
                                        href="/biblioteca/entrar"
                                        className="font-semibold text-(--brotero-texto-link) hover:underline"
                                    >
                                        Entre com o cartão
                                    </a>{' '}
                                    para ler online.
                                </span>
                            )}
                        </div>
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
                        <BookRequestAside livro={livro} placeholder={placeholder} />
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
