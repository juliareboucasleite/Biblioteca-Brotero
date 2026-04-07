import { Link, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import type { LivroCatalogo } from '@/types/biblioteca';

type BookEbookAsideProps = {
    livro: LivroCatalogo;
    placeholder: boolean;
    ebookFormat: 'pdf' | 'epub';
    initialDownloadCount: number;
    isPatron: boolean;
};

function getCsrfTokenFromDom(): string | null {
    const meta = document.querySelector('meta[name="csrf-token"]');

    return meta?.getAttribute('content')?.trim() || null;
}

function getCsrfTokenFromCookie(): string | null {
    const match = document.cookie.match(/(?:^|;)\s*XSRF-TOKEN=([^;]+)/);

    return match ? match[1] : null;
}

export function BookEbookAside({
    livro,
    placeholder,
    ebookFormat,
    initialDownloadCount,
    isPatron,
}: BookEbookAsideProps) {
    const { csrf_token: csrfFromPage } = usePage<{ csrf_token: string }>().props;
    const [downloadCount, setDownloadCount] = useState(initialDownloadCount);

    useEffect(() => {
        setDownloadCount(initialDownloadCount);
    }, [initialDownloadCount]);

    const lerHref = `/biblioteca/livro/${encodeURIComponent(livro.id)}/ler`;
    const registarUrl = `/biblioteca/livro/${encodeURIComponent(livro.id)}/ebook/registar-download`;

    const csrf =
        (typeof csrfFromPage === 'string' && csrfFromPage !== '' ? csrfFromPage : null) ??
        getCsrfTokenFromDom() ??
        getCsrfTokenFromCookie();

    const labelFormat = ebookFormat === 'epub' ? 'EPUB' : 'PDF';

    const missingCsrf = isPatron && !csrf;

    return (
        <aside className="border border-(--brotero-borda) rounded-(--raio) p-[20px] bg-(--brotero-branco) shadow-[0_1px_3px_rgba(0,0,0,0.06)] max-[900px]:col-span-2 max-[600px]:col-span-1">
            <h2 className="m-0 mb-[10px] text-[1.05rem] font-bold text-(--brotero-texto)">E-book</h2>
            <p className="m-0 mb-[16px] text-[14px] leading-snug text-(--brotero-texto-cinza)">
                Este título está disponível em digital. Não é necessário requisitar exemplar físico.
            </p>

            <p className="m-0 mb-[16px] text-[13px] text-(--brotero-texto-cinza)">
                <span className="font-semibold text-(--brotero-texto)">{downloadCount}</span>{' '}
                {downloadCount === 1 ? 'transferência registada' : 'transferências registadas'}
            </p>

            {missingCsrf ? (
                <p className="m-0 mb-[12px] text-[14px] text-[#b42318] bg-[#fef3f2] border border-[#fecaca] p-[10px_12px] rounded-[6px]">
                    Token de sessão em falta. Recarregue a página e tente de novo.
                </p>
            ) : null}

            {isPatron && csrf && !placeholder ? (
                <div className="flex flex-col gap-[10px]">
                    <form method="post" action={registarUrl} target="_blank" className="m-0">
                        <input type="hidden" name="_token" value={csrf} />
                        <button
                            type="submit"
                            className="w-full px-[20px] py-[12px] border-0 rounded-(--raio) bg-(--brotero-primaria) text-white text-[15px] font-semibold cursor-pointer transition-opacity duration-150 ease-in-out hover:opacity-90"
                        >
                            Baixar {labelFormat}
                        </button>
                    </form>
                    <p className="m-0 text-[12px] text-(--brotero-texto-cinza)">
                        O ficheiro abre num novo separador.
                    </p>
                    <Link
                        href={lerHref}
                        className="w-full text-center px-[20px] py-[11px] rounded-(--raio) border border-(--brotero-borda) bg-(--brotero-branco) text-[14px] font-semibold text-(--brotero-texto) no-underline hover:bg-[#f8f8f8]"
                    >
                        Ler {labelFormat} no browser
                    </Link>
                </div>
            ) : null}

            {isPatron && csrf && placeholder ? (
                <p className="m-0 text-[14px] text-(--brotero-texto-cinza)">
                    Selecione um livro válido no catálogo.
                </p>
            ) : null}

            {!isPatron ? (
                <p className="m-0 text-[14px] text-(--brotero-texto-cinza)">
                    <a
                        href="/biblioteca/entrar"
                        className="font-semibold text-(--brotero-texto-link) hover:underline"
                    >
                        Entre com o cartão
                    </a>{' '}
                    para baixar ou ler online.
                </p>
            ) : null}
        </aside>
    );
}
