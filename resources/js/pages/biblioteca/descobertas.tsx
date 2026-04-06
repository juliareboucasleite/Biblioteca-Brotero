import { Form, Head, Link, usePage } from '@inertiajs/react';
import { BibliotecaCatalogShell } from '@/components/biblioteca/BibliotecaCatalogShell';
import type { Auth } from '@/types/auth';
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

    return d.toLocaleDateString('pt-PT', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export default function BibliotecaDescobertas({ descobertas }: Props) {
    const { auth } = usePage<{ auth: Auth }>().props;
    const patron = auth.patron;
    const items = descobertas.data ?? [];

    return (
        <>
            <Head title="Descobertas da comunidade" />

            <BibliotecaCatalogShell>
                <header className="mb-[22px] pt-[4px] lg:pt-0">
                    <h1 className="m-0 mb-[8px] text-[1.6rem] font-bold text-(--brotero-texto) leading-tight">
                        Descobertas
                    </h1>
                    <p className="m-0 max-w-[54ch] text-[15px] leading-snug text-(--brotero-texto-cinza)">
                        Recomendações de leitores da escola. Abra uma ficha para requisitar o livro na
                        biblioteca.
                    </p>
                </header>

                {items.length === 0 ? (
                    <p
                        className="m-0 rounded-[14px] border border-dashed border-(--brotero-borda) bg-(--brotero-branco) p-[20px] text-[15px] text-(--brotero-texto-cinza)"
                        role="status"
                    >
                        Ainda não há recomendações. Ao visitar um livro, utilize «Recomendar à comunidade»
                        na ficha para partilhar.
                    </p>
                ) : (
                    <ul className="m-0 flex list-none flex-col gap-[16px] p-0">
                        {items.map((item) => (
                            <li key={item.id}>
                                <article className="overflow-hidden rounded-[18px] border border-(--brotero-borda-suave) bg-(--brotero-branco) shadow-[0_8px_28px_rgba(42,38,48,0.06)]">
                                    <div className="flex flex-col gap-[12px] p-[16px_18px] sm:flex-row sm:items-stretch sm:gap-[16px]">
                                        <Link
                                            href={`/biblioteca/livro/${encodeURIComponent(item.livro.id)}`}
                                            className="group relative mx-auto shrink-0 overflow-hidden rounded-[12px] bg-linear-to-br from-[#e8e8e8] to-[#d0d0d0] sm:mx-0"
                                            aria-label={`Ver ficha: ${item.livro.titulo}`}
                                        >
                                            {item.livro.capa ? (
                                                <img
                                                    src={item.livro.capa}
                                                    alt=""
                                                    className="block size-[100px] object-cover transition-transform group-hover:scale-[1.03] sm:size-[110px]"
                                                    loading="lazy"
                                                    referrerPolicy="no-referrer"
                                                />
                                            ) : (
                                                <span className="flex size-[100px] items-center justify-center p-[8px] text-center text-[11px] font-semibold text-(--brotero-texto-cinza) sm:size-[110px]">
                                                    Sem capa
                                                </span>
                                            )}
                                        </Link>
                                        <div className="min-w-0 flex-1">
                                            <p className="m-0 mb-[4px] text-[12px] font-semibold uppercase tracking-[0.04em] text-(--brotero-primaria)">
                                                {item.patron_label}
                                                <span className="font-normal text-(--brotero-texto-cinza)">
                                                    {' '}
                                                    · {formatData(item.created_at)}
                                                </span>
                                            </p>
                                            <h2 className="m-0 mb-[6px] text-[1.1rem] font-bold leading-snug text-(--brotero-texto)">
                                                <Link
                                                    href={`/biblioteca/livro/${encodeURIComponent(item.livro.id)}`}
                                                    className="text-inherit no-underline hover:text-(--brotero-texto-link) hover:underline"
                                                >
                                                    {item.livro.titulo}
                                                </Link>
                                            </h2>
                                            <p className="m-0 mb-[10px] text-[14px] text-(--brotero-texto-cinza)">
                                                {item.livro.autor}
                                            </p>
                                            {item.message ? (
                                                <p className="m-0 rounded-[12px] bg-(--brotero-fundo) p-[10px_12px] text-[14px] leading-snug text-(--brotero-texto)">
                                                    {item.message}
                                                </p>
                                            ) : null}
                                            <div className="mt-[12px] flex flex-wrap items-center gap-x-[14px] gap-y-[6px]">
                                                {patron && patron.id !== item.patron_id ? (
                                                    <Form
                                                        action="/biblioteca/conta/mensagens/abrir"
                                                        method="post"
                                                        className="inline"
                                                        preserveScroll
                                                    >
                                                        <input
                                                            type="hidden"
                                                            name="library_patron_id"
                                                            value={item.patron_id}
                                                        />
                                                        <button
                                                            type="submit"
                                                            className="cursor-pointer border-0 bg-transparent p-0 text-[13px] font-semibold text-violet-700 no-underline hover:text-violet-900 hover:underline"
                                                        >
                                                            Mensagem privada →
                                                        </button>
                                                    </Form>
                                                ) : null}
                                                <Link
                                                    href={`/biblioteca/livro/${encodeURIComponent(item.livro.id)}`}
                                                    className="text-[13px] font-semibold text-(--brotero-texto-link) no-underline hover:text-(--brotero-texto-link-hover) hover:underline"
                                                >
                                                    Ver ficha e requisitar →
                                                </Link>
                                                {item.livro.tem_ebook ? (
                                                    <Link
                                                        href={`/biblioteca/livro/${encodeURIComponent(item.livro.id)}/ler`}
                                                        className="text-[13px] font-semibold text-violet-700 no-underline hover:text-violet-900 hover:underline"
                                                    >
                                                        Ler e-book (com sessão) →
                                                    </Link>
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
                        className="mt-[22px] flex flex-wrap justify-center gap-[6px]"
                        aria-label="Paginação"
                    >
                        {descobertas.links.map((link, index) =>
                            link.url ? (
                                <Link
                                    key={index}
                                    href={link.url}
                                    preserveScroll
                                    className={`min-w-[2.25rem] rounded-full px-[10px] py-[8px] text-center text-[13px] font-semibold no-underline ${
                                        link.active
                                            ? 'bg-(--brotero-primaria) text-white'
                                            : 'border border-(--brotero-borda) bg-(--brotero-branco) text-(--brotero-texto) hover:border-(--brotero-primaria-claro)'
                                    }`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ) : (
                                <span
                                    key={index}
                                    className="min-w-[2.25rem] px-[10px] py-[8px] text-center text-[13px] text-(--brotero-texto-cinza)"
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
