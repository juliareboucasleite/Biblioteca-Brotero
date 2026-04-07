import { useEffect, useMemo, useRef, useState } from 'react';
import type { LivroCatalogo } from '@/types/biblioteca';

type BooksJsonRow = {
    id: number | string;
    title?: string | null;
    description?: string | null;
    cover_image?: string | null;
    authors?: Array<{ name?: string | null }> | null;
    /** Igual a `Book::ebookFormat()` no backend (PDF/EPUB legível). */
    ebook_mime?: string | null;
};

/** Alinhado com `App\Models\Book::ebookFormat()`. */
function temEbookLegivel(mime: string | null | undefined): boolean {
    const m = (mime ?? '').trim().toLowerCase();

    return (
        m === 'application/pdf' ||
        m === 'application/x-pdf' ||
        m === 'application/epub+zip' ||
        m === 'application/epub' ||
        m === 'application/x-epub+zip'
    );
}

function mapBooksResponse(data: BooksJsonRow[] | null | undefined): LivroCatalogo[] {
    return (data ?? []).map((b) => ({
        id: String(b.id),
        titulo: b.title?.toString() ?? '',
        autor:
            (b.authors ?? [])
                .map((a) => a?.name?.toString()?.trim())
                .filter((x): x is string => Boolean(x))
                .join(', ') || 'Autor desconhecido',
        desc: b.description?.toString() ?? '',
        capa: b.cover_image?.toString() ?? null,
        tem_ebook: temEbookLegivel(b.ebook_mime),
    }));
}

type Filters = {
    categoriaSelecionada?: string | null;
    q?: string | null;
    lingua?: string | null;
    authorSelecionado?: string | null;
    ano?: string | null;
};

/**
 * Mantém a lista de livros alinhada com o servidor e atualiza via `GET /books` (mesmos parâmetros que a página).
 */
export function useBibliotecaLivrosPolling(
    livros: LivroCatalogo[],
    { categoriaSelecionada, q, lingua, authorSelecionado, ano }: Filters,
): LivroCatalogo[] {
    const [lista, setLista] = useState<LivroCatalogo[]>(livros);
    const lastServerSnapshot = useMemo(() => JSON.stringify(livros), [livros]);
    const snapshotRef = useRef(lastServerSnapshot);

    useEffect(() => {
        if (snapshotRef.current !== lastServerSnapshot) {
            snapshotRef.current = lastServerSnapshot;
            setLista(livros);
        }
    }, [lastServerSnapshot, livros]);

    useEffect(() => {
        let cancelled = false;
        let timeoutId: number | undefined;

        const tick = async () => {
            try {
                const url = `/books?${new URLSearchParams({
                    limit: '10',
                    ...(categoriaSelecionada ? { categoria: categoriaSelecionada } : {}),
                    ...(q ? { q } : {}),
                    ...(lingua ? { lingua } : {}),
                    ...(authorSelecionado ? { author_id: authorSelecionado } : {}),
                    ...(ano ? { ano } : {}),
                }).toString()}`;

                const res = await fetch(url, {
                    headers: { Accept: 'application/json' },
                });

                if (!res.ok) {
                    return;
                }

                const data = (await res.json()) as BooksJsonRow[];
                const mapped = mapBooksResponse(data);

                if (!cancelled) {
                    setLista(mapped);
                }
            } finally {
                if (!cancelled) {
                    timeoutId = window.setTimeout(tick, 5000);
                }
            }
        };

        timeoutId = window.setTimeout(tick, 1500);

        return () => {
            cancelled = true;

            if (timeoutId) {
                window.clearTimeout(timeoutId);
            }
        };
    }, [ano, authorSelecionado, categoriaSelecionada, lingua, q]);

    return lista;
}
