import { useEffect, useMemo, useState } from 'react';
import type { BookApi } from '@/types/biblioteca';

export function useBookDetailApi(bookId: string, enabled: boolean): BookApi | null {
    const [bookApi, setBookApi] = useState<BookApi | null>(null);

    const isNumericId = useMemo(() => {
        const n = Number(bookId);

        return Number.isFinite(n) && n > 0;
    }, [bookId]);

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            if (!enabled || !isNumericId) {
                return;
            }

            try {
                const res = await fetch(`/books/${encodeURIComponent(bookId)}`, {
                    headers: { Accept: 'application/json' },
                });

                if (!res.ok) {
                    return;
                }

                const data = (await res.json()) as BookApi;

                if (!cancelled) {
                    setBookApi(data);
                }
            } catch {
                // Mantém layout base sem detalhes extra.
            }
        };

        load();

        return () => {
            cancelled = true;
        };
    }, [bookId, enabled, isNumericId]);

    return bookApi;
}
