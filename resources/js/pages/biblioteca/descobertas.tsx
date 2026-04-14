import { Form, Head, Link } from '@inertiajs/react';
import { BookOpen } from 'lucide-react';
import { BibliotecaCatalogShell } from '@/components/biblioteca/BibliotecaCatalogShell';
import type { DescobertaEntrada } from '@/types/biblioteca';

type PaginatorLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type DescobertasPaginator = {
    data: DescobertaEntrada[];
    links: PaginatorLink[];
    current_page: number;
    last_page: number;
    from: number | null;
    to: number | null;
    total: number;
};

type Props = {
    descobertas: DescobertasPaginator;
};

function formatData(iso: string): string {
    if (!iso) {
        return '';
    }

    const d = new Date(iso);

    if (Number.isNaN(d.getTime())) {
        return iso;
    }

    return d.toLocaleString('pt-PT', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export default function BibliotecaDescobertas({ descobertas }: Props) {
    const items = descobertas.data ?? [];
    const livroHref = (id: string) => `/biblioteca/livro/${encodeURIComponent(id)}`;

    return (
        <>
            <Head title="Descobertas" />

            <BibliotecaCatalogShell>
                <header className="mb-[22px]">
                    <h1 className="m-0 text-[1.6rem] font-semibold leading-tight tracking-tight text-(--brotero-texto)">
                        Descobertas
                    </h1>
                    <p className="m-0 mt-[10px] max-w-[52ch] text-[15px] leading-relaxed text-(--brotero-texto-cinza)">
                        Recomendações dos leitores. Na ficha, pode requisitar o exemplar ou abrir o e-book, se
                        existir.
                    </p>
                </header>

                {items.length === 0 ? (
                    <p
                        className="m-0 rounded-[14px] border border-dashed border-(--brotero-borda) bg-(--brotero-branco) px-[18px] py-[22px] text-[15px] leading-relaxed text-(--brotero-texto-cinza)"
                        role="status"
                    >
                        Partilhe o que está a ler: na ficha do livro, use «Recomendar à comunidade» para
                        aparecer nesta linha do tempo.
                    </p>
                ) : (
                    <ul className="m-0 flex list-none flex-col gap-[16px] p-0">
                        {items.map((item) => (
                            <li key={item.id}>
                                <article className="overflow-hidden rounded-[16px] border border-(--brotero-borda-suave) bg-(--brotero-branco) shadow-[0_1px_3px_rgba(42,38,48,0.06)]">
                                    <div className="flex flex-col gap-[16px] p-[16px] sm:flex-row sm:items-start sm:gap-[20px] sm:p-[20px]">
                                        <Link
                                            href={livroHref(item.livro.id)}
                                            className="relative mx-auto flex aspect-2/3 w-[min(108px,32vw)] shrink-0 overflow-hidden rounded-[10px] bg-(--brotero-fundo) ring-1 ring-black/6 sm:mx-0 sm:w-[120px]"
                                            aria-label={`Capa: ${item.livro.titulo}`}
                                        >
                                            {item.livro.capa ? (
                                                <img
                                                    src={item.livro.capa}
                                                    alt=""
                                                    className="h-full w-full object-contain object-center"
                                                    loading="lazy"
                                                    referrerPolicy="no-referrer"
                                                />
                                            ) : (
                                                <span className="flex h-full w-full items-center justify-center">
                                                    <BookOpen
                                                        className="size-[28px] text-(--brotero-texto-cinza) opacity-35"
                                                        aria-hidden
                                                    />
                                                </span>
                                            )}
                                        </Link>

                                        <div className="min-w-0 flex-1">
                                            <p className="m-0 text-[14px] leading-snug text-(--brotero-texto-cinza)">
                                                <span className="font-semibold text-(--brotero-texto)">
                                                    {item.patron_label}
                                                </span>
                                                <span aria-hidden> · </span>
                                                <time dateTime={item.created_at}>
                                                    {formatData(item.created_at)}
                                                </time>
                                            </p>

                                            <h2 className="m-0 mt-[10px] text-[1.125rem] font-semibold leading-snug tracking-tight text-(--brotero-texto) sm:text-[1.2rem]">
                                                <Link
                                                    href={livroHref(item.livro.id)}
                                                    className="text-inherit no-underline hover:text-(--brotero-texto-link) hover:underline"
                                                >
                                                    {item.livro.titulo}
                                                </Link>
                                            </h2>
                                            <p className="m-0 mt-[4px] text-[15px] text-(--brotero-texto-cinza)">
                                                {item.livro.autor}
                                            </p>

                                            {item.message ? (
                                                <p className="m-0 mt-[14px] rounded-[10px] bg-(--brotero-fundo) px-[14px] py-[12px] text-[15px] leading-relaxed text-(--brotero-texto)">
                                                    {item.message}
                                                </p>
                                            ) : null}

                                            <div className="mt-[14px] flex flex-wrap items-center gap-x-[10px] gap-y-[8px] border-t border-(--brotero-borda-suave) pt-[14px] text-[15px]">
                                                <Link
                                                    href={livroHref(item.livro.id)}
                                                    className="inline-flex min-h-[40px] items-center rounded-[10px] bg-(--brotero-primaria) px-[16px] text-[15px] font-semibold text-white no-underline transition-opacity hover:opacity-90"
                                                >
                                                    Ver ficha
                                                </Link>
                                                {item.livro.tem_ebook ? (
                                                    <Link
                                                        href={`${livroHref(item.livro.id)}/ler`}
                                                        className="inline-flex min-h-[40px] items-center rounded-[10px] border border-(--brotero-borda) bg-(--brotero-branco) px-[14px] text-[15px] font-medium text-(--brotero-texto) no-underline hover:border-(--brotero-primaria-claro) hover:bg-(--brotero-fundo)"
                                                    >
                                                        E-book
                                                    </Link>
                                                ) : null}
                                                {item.pode_contactar ? (
                                                    <Form
                                                        action="/biblioteca/conta/mensagens/abrir"
                                                        method="post"
                                                        className="inline"
                                                    >
                                                        <input
                                                            type="hidden"
                                                            name="library_patron_id"
                                                            value={item.patron_id}
                                                        />
                                                        <button
                                                            type="submit"
                                                            className="inline-flex min-h-[40px] cursor-pointer items-center rounded-[10px] border border-transparent px-[10px] text-[15px] font-medium text-(--brotero-texto-link) underline decoration-(--brotero-borda-suave) underline-offset-4 hover:decoration-(--brotero-texto-link)"
                                                        >
                                                            Mensagem ao leitor
                                                        </button>
                                                    </Form>
                                                ) : null}
                                            </div>
                                        </div>
                                    </div>
                                </article>
                            </li>
                        ))}
                    </ul>
                )}

                {descobertas.last_page > 1 ? (
                    <nav
                        className="mt-[22px] flex flex-wrap items-center gap-[6px]"
                        aria-label="Paginação"
                    >
                        {descobertas.links.map((link, index) =>
                            link.url ? (
                                <Link
                                    key={index}
                                    href={link.url}
                                    preserveScroll
                                    className={`inline-flex min-h-10 min-w-10 items-center justify-center rounded-[10px] px-[10px] text-[15px] no-underline ${
                                        link.active
                                            ? 'bg-(--brotero-primaria) font-semibold text-white'
                                            : 'border border-(--brotero-borda-suave) bg-(--brotero-branco) text-(--brotero-texto-link) hover:bg-(--brotero-fundo)'
                                    }`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ) : (
                                <span
                                    key={index}
                                    className="inline-flex min-h-10 min-w-10 items-center justify-center px-[10px] text-[15px] text-(--brotero-texto-cinza)"
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ),
                        )}
                    </nav>
                ) : null}
            </BibliotecaCatalogShell>
        </>
    );
}
