import ePub from 'epubjs';
import { useEffect, useRef, useState } from 'react';

type BookEpubReaderProps = {
    src: string;
    title: string;
};

/**
 * Leitor EPUB no browser (ficheiro obtido com sessão do leitor via `same-origin`).
 */
export function BookEpubReader({ src, title }: BookEpubReaderProps) {
    const hostRef = useRef<HTMLDivElement>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const host = hostRef.current;

        if (!host) {
            return;
        }

        let objectUrl: string | null = null;
        let book: ReturnType<typeof ePub> | null = null;
        let cancelled = false;

        const run = async () => {
            try {
                const res = await fetch(src, { credentials: 'same-origin' });

                if (!res.ok) {
                    throw new Error(`Falha ao carregar o e-book (${res.status}).`);
                }

                const blob = await res.blob();

                if (cancelled) {
                    return;
                }

                objectUrl = URL.createObjectURL(blob);
                book = ePub(objectUrl);

                const rendition = book.renderTo(host, {
                    width: '100%',
                    height: '100%',
                    flow: 'paginated',
                });

                await rendition.display();
            } catch (e) {
                if (!cancelled) {
                    setError(e instanceof Error ? e.message : 'Não foi possível abrir o EPUB.');
                }
            }
        };

        void run();

        return () => {
            cancelled = true;

            if (book !== null) {
                book.destroy();
            }

            if (objectUrl !== null) {
                URL.revokeObjectURL(objectUrl);
            }
        };
    }, [src]);

    if (error !== null) {
        return (
            <p className="m-0 rounded-[12px] border border-red-200 bg-red-50 px-[14px] py-[12px] text-[14px] text-red-900">
                {error}
            </p>
        );
    }

    return (
        <div className="flex min-h-[75vh] w-full flex-col">
            <p className="m-0 mb-[10px] text-[13px] text-(--brotero-texto-cinza)">
                <span className="font-semibold text-(--brotero-texto)">{title}</span> · livro digital (EPUB)
            </p>
            <div
                ref={hostRef}
                className="min-h-[70vh] flex-1 overflow-hidden rounded-[14px] border border-(--brotero-borda-suave) bg-(--brotero-branco) shadow-[inset_0_0_0_1px_rgba(0,0,0,0.03)]"
                aria-label={`Conteúdo do livro ${title}`}
            />
        </div>
    );
}
