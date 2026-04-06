import { Head, Link } from '@inertiajs/react';
import { BibliotecaCatalogShell } from '@/components/biblioteca/BibliotecaCatalogShell';
import { BookEpubReader } from '@/components/biblioteca/BookEpubReader';

type LivroLer = {
    id: string;
    titulo: string;
};

type Props = {
    livro: LivroLer;
    ebook_format: 'pdf' | 'epub';
    ebook_url: string;
};

export default function BibliotecaLivroLer({ livro, ebook_format, ebook_url }: Props) {
    return (
        <>
            <Head title={`Ler: ${livro.titulo}`} />

            <BibliotecaCatalogShell>
                <div className="pt-[4px] pb-[8px] lg:pt-0">
                    <nav
                        aria-label="Navegação"
                        className="m-0 mb-[16px] flex flex-wrap items-center gap-x-[14px] gap-y-[8px] text-[14px]"
                    >
                        <Link
                            href={`/biblioteca/livro/${encodeURIComponent(livro.id)}`}
                            className="font-semibold text-(--brotero-texto-link) no-underline hover:text-(--brotero-texto-link-hover) hover:underline"
                        >
                            ← Voltar à ficha
                        </Link>
                        <span aria-hidden className="text-(--brotero-borda)">
                            ·
                        </span>
                        <a
                            href="/biblioteca"
                            className="text-(--brotero-texto-link) no-underline hover:text-(--brotero-texto-link-hover) hover:underline"
                        >
                            Catálogo
                        </a>
                    </nav>

                    <h1 className="m-0 mb-[14px] text-[1.35rem] font-bold text-(--brotero-texto)">
                        {livro.titulo}
                    </h1>

                    {ebook_format === 'pdf' ? (
                        <iframe
                            title={livro.titulo}
                            src={ebook_url}
                            className="h-[min(85vh,900px)] w-full rounded-[14px] border border-(--brotero-borda-suave) bg-(--brotero-branco)"
                        />
                    ) : (
                        <BookEpubReader src={ebook_url} title={livro.titulo} />
                    )}
                </div>
            </BibliotecaCatalogShell>
        </>
    );
}
