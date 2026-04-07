import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCallback, useRef, type MouseEvent as ReactMouseEvent } from 'react';
import { cn } from '@/lib/utils';

const SCROLL_STEP_PX = 280;
import type { Category } from '@/types';

const DRAG_THRESHOLD_PX = 6;

type CategoryLike =
    | Category
    | { id: string | number; name?: string; nome?: string };

function categoryDisplayName(c: CategoryLike): string {
    if (typeof c.name === 'string' && c.name !== '') {
        return c.name;
    }

    if ('nome' in c && typeof c.nome === 'string') {
        return c.nome;
    }

    return '';
}

type BibliotecaCategoryChipsProps = {
    categorias: CategoryLike[];
    categoriaSelecionada?: string | null;
    q?: string | null;
    lingua?: string | null;
    authorId?: string | null;
    ano?: string | null;
    /** Destino base: `/biblioteca` ou `/biblioteca/livros`. */
    basePath: '/biblioteca' | '/biblioteca/livros';
    className?: string;
};

function buildUrl(
    basePath: string,
    params: Record<string, string | number | null | undefined>,
): string {
    const filtered = Object.fromEntries(
        Object.entries(params).filter(
            ([, v]) => v !== undefined && v !== null && v !== '',
        ),
    );
    const query = new URLSearchParams(
        filtered as Record<string, string>,
    ).toString();

    return query ? `${basePath}?${query}` : basePath;
}

export function BibliotecaCategoryChips({
    categorias,
    categoriaSelecionada,
    q,
    lingua,
    authorId,
    ano,
    basePath,
    className,
}: BibliotecaCategoryChipsProps) {
    const allHref = buildUrl(basePath, { q, lingua, author_id: authorId, ano });

    const scrollerRef = useRef<HTMLDivElement | null>(null);
    const suppressClickRef = useRef(false);

    const onMouseDown = useCallback((e: ReactMouseEvent<HTMLDivElement>) => {
        if (e.button !== 0) {
            return;
        }

        const el = scrollerRef.current;
        if (!el || !el.contains(e.target as Node)) {
            return;
        }

        const originX = e.clientX;
        let lastClientX = e.clientX;
        let dragging = false;

        const onMove = (ev: globalThis.MouseEvent) => {
            if (!dragging) {
                if (Math.abs(ev.clientX - originX) < DRAG_THRESHOLD_PX) {
                    return;
                }

                dragging = true;
            }

            const dx = ev.clientX - lastClientX;

            ev.preventDefault();
            el.scrollLeft -= dx;
            lastClientX = ev.clientX;
        };

        const onUp = () => {
            document.removeEventListener('mousemove', onMove);
            document.removeEventListener('mouseup', onUp);

            if (dragging) {
                suppressClickRef.current = true;
            }
        };

        document.addEventListener('mousemove', onMove, { passive: false });
        document.addEventListener('mouseup', onUp);
    }, []);

    const onClickCapture = useCallback((e: ReactMouseEvent<HTMLDivElement>) => {
        if (!suppressClickRef.current) {
            return;
        }

        if ((e.target as HTMLElement).closest('a[href]')) {
            e.preventDefault();
            e.stopPropagation();
        }

        suppressClickRef.current = false;
    }, []);

    const scrollCategorias = useCallback((delta: number) => {
        scrollerRef.current?.scrollBy({ left: delta, behavior: 'smooth' });
    }, []);

    return (
        <div className={cn('w-full min-w-0', className)}>
            <div className="mb-[10px] flex items-center justify-between gap-[10px]">
                <p className="m-0 min-w-0 text-[12px] font-bold tracking-[0.06em] text-(--brotero-texto-cinza) uppercase">
                    Categorias
                </p>
                <div className="hidden shrink-0 items-center gap-[4px] sm:flex">
                    <button
                        type="button"
                        onClick={() => scrollCategorias(-SCROLL_STEP_PX)}
                        className={cn(
                            'inline-flex size-[36px] items-center justify-center rounded-full border border-(--brotero-borda) bg-(--brotero-branco) text-(--brotero-texto) shadow-sm transition-colors',
                            'hover:border-(--brotero-primaria-claro) hover:text-(--brotero-primaria)',
                            'focus-visible:outline-2 focus-visible:outline-(--brotero-primaria)',
                        )}
                        aria-label="Deslocar categorias para a esquerda"
                    >
                        <ChevronLeft className="size-[20px]" aria-hidden />
                    </button>
                    <button
                        type="button"
                        onClick={() => scrollCategorias(SCROLL_STEP_PX)}
                        className={cn(
                            'inline-flex size-[36px] items-center justify-center rounded-full border border-(--brotero-borda) bg-(--brotero-branco) text-(--brotero-texto) shadow-sm transition-colors',
                            'hover:border-(--brotero-primaria-claro) hover:text-(--brotero-primaria)',
                            'focus-visible:outline-2 focus-visible:outline-(--brotero-primaria)',
                        )}
                        aria-label="Deslocar categorias para a direita"
                    >
                        <ChevronRight className="size-[20px]" aria-hidden />
                    </button>
                </div>
            </div>
            <div
                ref={scrollerRef}
                className="flex cursor-grab snap-x snap-proximity gap-[8px] overflow-x-auto pb-[6px] select-none [-ms-overflow-style:none] [scrollbar-width:none] active:cursor-grabbing [&::-webkit-scrollbar]:hidden"
                role="list"
                onMouseDown={onMouseDown}
                onClickCapture={onClickCapture}
                onDragStart={(e) => e.preventDefault()}
                aria-label="Lista de categorias — setas acima em ecrã largo, arrastar com o rato ou roda"
            >
                <a
                    role="listitem"
                    draggable={false}
                    href={allHref}
                    className={cn(
                        'shrink-0 snap-start rounded-full border px-[16px] py-[9px] text-[13px] font-semibold no-underline transition-colors',
                        !categoriaSelecionada
                            ? 'border-transparent bg-(--brotero-primaria) text-white shadow-[0_6px_16px_rgba(77,107,122,0.28)]'
                            : 'border-(--brotero-borda) bg-(--brotero-branco) text-(--brotero-texto) hover:border-(--brotero-primaria-claro)',
                    )}
                    aria-current={!categoriaSelecionada ? 'page' : undefined}
                >
                    Todas
                </a>
                {categorias.map((c) => {
                    const id = String(c.id);

                    const href = buildUrl(basePath, {
                        categoria: c.id,
                        q,
                        lingua,
                        author_id: authorId,
                        ano,
                    });

                    const selected = categoriaSelecionada === id;

                    return (
                        <a
                            key={id}
                            role="listitem"
                            draggable={false}
                            href={href}
                            className={cn(
                                'shrink-0 snap-start rounded-full border px-[16px] py-[9px] text-[13px] font-semibold whitespace-nowrap no-underline transition-colors',
                                selected
                                    ? 'border-transparent bg-(--brotero-primaria) text-white shadow-[0_6px_16px_rgba(77,107,122,0.28)]'
                                    : 'border-(--brotero-borda) bg-(--brotero-branco) text-(--brotero-texto) hover:border-(--brotero-primaria-claro)',
                            )}
                            aria-current={selected ? 'page' : undefined}
                        >
                            {categoryDisplayName(c)}
                        </a>
                    );
                })}
            </div>
        </div>
    );
}
