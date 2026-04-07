import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCallback } from 'react';

import { useHorizontalDragScroll } from '@/hooks/useHorizontalDragScroll';
import { cn } from '@/lib/utils';
import type { Category } from '@/types';

const SCROLL_STEP_PX = 280;

/** Categoria «e-book» na BD — mostrada logo a seguir a «Todas». */
const CATEGORIA_EBOOK_ID = 64;

/**
 * Cada ficheiro tem um significado fixo (não é rotação por posição):
 * - pilha: «Todas» — catálogo completo
 * - livr3o: livros físicos / para requisitar na biblioteca
 * - livros-pdf: categoria de obras online em PDF (não confundir com EPUB ou e-reader genérico)
 */
const ICON_TODAS = '/images/pilha-de-livros.png';
const ICON_LIVROS_REQUISITAR = '/images/livr3o.png';
const ICON_LIVROS_PDF_ONLINE = '/images/livros-pdf.png';

/** Palavras no nome da categoria (normalizado) que indicam PDF/online — ajuste se os nomes na BD forem outros. */
const PDF_ONLINE_HINTS = [
    'pdf',
    'online',
    'digital',
    'e-book',
    'ebook',
    'eletronic',
    'eletron',
    'em pdf',
] as const;

function normalizeForMatch(s: string): string {
    return s
        .normalize('NFD')
        .replace(/\p{M}/gu, '')
        .toLowerCase();
}

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

function iconSrcForCategory(c: CategoryLike): string {
    if (String(c.id) === String(CATEGORIA_EBOOK_ID)) {
        return ICON_LIVROS_PDF_ONLINE;
    }

    const raw = categoryDisplayName(c);
    const n = normalizeForMatch(raw);

    for (const hint of PDF_ONLINE_HINTS) {
        if (n.includes(hint)) {
            return ICON_LIVROS_PDF_ONLINE;
        }
    }

    return ICON_LIVROS_REQUISITAR;
}

/** Coloca a categoria e-book (id {@link CATEGORIA_EBOOK_ID}) imediatamente após «Todas». */
function categoriasComEbookAposTodas(lista: CategoryLike[]): CategoryLike[] {
    const idAlvo = String(CATEGORIA_EBOOK_ID);
    const i = lista.findIndex((c) => String(c.id) === idAlvo);

    if (i <= 0) {
        return lista;
    }

    const ebook = lista[i];
    const resto = lista.filter((_, idx) => idx !== i);

    return [ebook, ...resto];
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

const arrowBtnClass = cn(
    'inline-flex size-[36px] items-center justify-center rounded-full border border-(--brotero-borda) bg-(--brotero-branco) text-(--brotero-texto) shadow-sm transition-colors',
    'hover:border-(--brotero-primaria-claro) hover:text-(--brotero-primaria)',
    'focus-visible:outline-2 focus-visible:outline-(--brotero-primaria)',
);

type IconSlotProps = {
    src: string;
    label: string;
    href: string;
    selected: boolean;
};

function CategoriaIconSlot({ src, label, href, selected }: IconSlotProps) {
    return (
        <a
            href={href}
            draggable={false}
            className={cn(
                'group flex w-[76px] shrink-0 snap-start flex-col items-center gap-[8px] no-underline sm:w-[88px]',
                'transition-[transform,opacity] duration-150 motion-reduce:transition-none',
                'active:scale-[0.98]',
            )}
            aria-current={selected ? 'page' : undefined}
        >
            <div className="relative flex h-[76px] w-full flex-col items-center justify-end sm:h-[84px]">
                {/* Sombra oval no «chão» (sem caixa branca por trás do ícone) */}
                <div
                    className={cn(
                        'pointer-events-none absolute bottom-[2px] left-1/2 z-0 h-[12px] w-[78%] max-w-[76px] -translate-x-1/2 rounded-[100%]',
                        'bg-(--brotero-texto) opacity-[0.11] blur-[7px]',
                        'sm:bottom-[3px] sm:h-[13px]',
                        selected && 'opacity-[0.16]',
                    )}
                    aria-hidden
                />
                <img
                    src={src}
                    alt=""
                    width={72}
                    height={72}
                    loading="lazy"
                    draggable={false}
                    className={cn(
                        'relative z-1 h-[64px] w-[64px] object-contain sm:h-[72px] sm:w-[72px]',
                        'drop-shadow-[0_3px_10px_rgba(42,38,48,0.14)]',
                        'motion-reduce:transition-none',
                        selected && 'drop-shadow-[0_4px_14px_rgba(77,107,122,0.22)]',
                    )}
                />
            </div>
            <span
                className={cn(
                    'max-w-full text-center text-[11px] leading-tight sm:text-[12px]',
                    selected
                        ? 'font-bold text-(--brotero-texto)'
                        : 'font-medium text-(--brotero-texto-cinza) group-hover:text-(--brotero-texto)',
                )}
            >
                {label}
            </span>
        </a>
    );
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
    const categoriasOrdenadas = categoriasComEbookAposTodas(categorias);
    const { scrollRef, onMouseDown, onClickCapture } = useHorizontalDragScroll();

    const scrollCategorias = useCallback(
        (delta: number) => {
            scrollRef.current?.scrollBy({ left: delta, behavior: 'smooth' });
        },
        [scrollRef],
    );

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
                        className={arrowBtnClass}
                        aria-label="Deslocar categorias para a esquerda"
                    >
                        <ChevronLeft className="size-[20px]" aria-hidden />
                    </button>
                    <button
                        type="button"
                        onClick={() => scrollCategorias(SCROLL_STEP_PX)}
                        className={arrowBtnClass}
                        aria-label="Deslocar categorias para a direita"
                    >
                        <ChevronRight className="size-[20px]" aria-hidden />
                    </button>
                </div>
            </div>
            <div
                ref={scrollRef}
                className="flex cursor-grab snap-x snap-proximity gap-[12px] overflow-x-auto pb-[10px] pl-[2px] pr-[2px] select-none [-ms-overflow-style:none] [scrollbar-width:none] active:cursor-grabbing sm:gap-[16px] [&::-webkit-scrollbar]:hidden"
                role="list"
                onMouseDown={onMouseDown}
                onClickCapture={onClickCapture}
                onDragStart={(e) => e.preventDefault()}
                aria-label="Categorias — ícone e nome; arrastar ou setas para ver mais"
            >
                <div role="listitem" className="shrink-0">
                    <CategoriaIconSlot
                        src={ICON_TODAS}
                        label="Todas"
                        href={allHref}
                        selected={!categoriaSelecionada}
                    />
                </div>
                {categoriasOrdenadas.map((c) => {
                    const id = String(c.id);
                    const href = buildUrl(basePath, {
                        categoria: c.id,
                        q,
                        lingua,
                        author_id: authorId,
                        ano,
                    });
                    const selected = categoriaSelecionada === id;
                    const name = categoryDisplayName(c);

                    return (
                        <div key={id} role="listitem" className="shrink-0">
                            <CategoriaIconSlot
                                src={iconSrcForCategory(c)}
                                label={name}
                                href={href}
                                selected={selected}
                            />
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
