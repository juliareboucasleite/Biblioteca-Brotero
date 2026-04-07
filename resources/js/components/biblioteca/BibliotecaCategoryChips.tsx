import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCallback } from 'react';

import { useHorizontalDragScroll } from '@/hooks/useHorizontalDragScroll';
import { cn } from '@/lib/utils';
import type { Category } from '@/types';

const SCROLL_STEP_PX = 280;

/** Categoria «e-book» (PDF online) na BD; mostrada logo a seguir a «Todas». */
const CATEGORIA_EBOOK_ID = 64;

/** Categoria «audiobook» na BD: ícone dedicado. */
const CATEGORIA_AUDIOBOOK_ID = 65;

/** Categoria «livros novos» / entradas recentes; alinhado com `recent_books_category_id` na config. */
const CATEGORIA_LIVROS_NOVOS_ID = 84;

/** Categoria «bestsellers» na BD: ícone dedicado. */
const CATEGORIA_BESTSELLERS_ID = 67;

/** Categoria «manga» na BD: mesmo ícone que banda desenhada. */
const CATEGORIA_MANGA_ID = 68;

/** Alinhar com `config/biblioteca_canonical_categories.php` → `order` (índice = prioridade no carrossel). */
const ORDEM_SLUGS_CATALOGO = [
    'e-books',
    'livros-novos',
    'bestsellers',
    'audiobooks',
    'romance',
    'fantasia',
    'ficcao-cientifica',
    'terror',
    'misterio-suspense',
    'aventura',
    'drama',
    'biografia-autobiografia',
    'historia',
    'ciencia',
    'autoajuda',
    'educacao-didaticos',
    'negocios-financas',
    'poesia',
    'hq-banda-desenhada',
    'manga',
    'infantil-juvenil',
] as const;

/**
 * - pilha: «Todas»: catálogo completo
 * - livros-pdf: obras online em PDF (categoria e-book id 64 ou nome com pistas)
 * - livro-de-musica: categoria audiobook id 65
 * - new: categoria livros novos / recentes (id em config, ex. 84)
 * - livro-bestsellers: categoria bestsellers id 67
 * - livro-de-banda-desenhada: manga id 68; também BD / comics / manga (nome)
 * - romance: nome da categoria (romance.png)
 * - livro-azul: fantasia / fantasy (nome)
 * - livro-magico: categorias de ficção (nome com «ficção» / «fiction», exceto não-ficção)
 * - restantes categorias físicas: cor estável por id entre as variantes em `public/images/livro-*.png`
 */
const ICON_TODAS = '/images/pilha-de-livros.png';
const ICON_LIVROS_PDF_ONLINE = '/images/livros-pdf.png';
const ICON_AUDIOBOOK = '/images/livro-de-musica.png';
const ICON_LIVROS_NOVOS = '/images/new.png';
const ICON_BESTSELLERS = '/images/livro-bestsellers.png';
const ICON_ROMANCE = '/images/romance.png';
const ICON_FANTASIA = '/images/livro-azul.png';
const ICON_FICCAO = '/images/livro-magico.png';
const ICON_BANDA_DESENHADA = '/images/livro-de-banda-desenhada.png';

/** Ícones dedicados por slug canónico (quando o backend envia `slug`). */
const ICON_POR_SLUG: Partial<Record<(typeof ORDEM_SLUGS_CATALOGO)[number], string>> = {
    'e-books': ICON_LIVROS_PDF_ONLINE,
    audiobooks: ICON_AUDIOBOOK,
    'livros-novos': ICON_LIVROS_NOVOS,
    bestsellers: ICON_BESTSELLERS,
    manga: ICON_BANDA_DESENHADA,
    'hq-banda-desenhada': ICON_BANDA_DESENHADA,
    romance: ICON_ROMANCE,
    fantasia: ICON_FANTASIA,
    'ficcao-cientifica': ICON_FICCAO,
    terror: '/images/livro-vermelho.png',
    'misterio-suspense': '/images/livro-roxo.png',
    aventura: '/images/livro-verde.png',
    drama: '/images/livro-rosa.png',
    'biografia-autobiografia': '/images/livro-amarelo.png',
    historia: '/images/livro-amarelo.png',
    ciencia: '/images/livro-azul.png',
    autoajuda: '/images/livro-verde.png',
    'educacao-didaticos': '/images/livro-amarelo.png',
    'negocios-financas': '/images/livro-vermelho.png',
    poesia: '/images/livro-roxo.png',
    'infantil-juvenil': '/images/livro-rosa.png',
};

/** Livros físicos: variações de cor (ícones dedicados ficam fora desta lista). */
const ICON_LIVROS_COLORIDOS = [
    '/images/livro-roxo.png',
    '/images/livro-rosa.png',
    '/images/livro-verde.png',
    '/images/livro-amarelo.png',
    '/images/livro-vermelho.png',
] as const;

/** Índice estável pseudo-aleatório a partir do id (não muda a cada render). */
function indiceCorPorCategoriaId(id: string | number): number {
    const s = String(id);
    let h = 0;

    for (let i = 0; i < s.length; i += 1) {
        h = Math.imul(31, h) + s.charCodeAt(i);
    }

    return Math.abs(h) % ICON_LIVROS_COLORIDOS.length;
}

/** Palavras no nome da categoria (normalizado) que indicam PDF/online; ajuste se os nomes na BD forem outros. */
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

/** Nome normalizado sugere «não ficção»; não usar ícone de ficção. */
function pareceNaoFiccao(n: string): boolean {
    return (
        n.includes('nao ficcao') ||
        n.includes('nao-ficcao') ||
        n.includes('non-fiction') ||
        n.includes('nonfiction') ||
        n.includes('narrativa nao ficcao')
    );
}

/** Categoria de ficção: nomes com «ficção» / «fiction» (exceto não-ficção). */
function pareceFiccao(n: string): boolean {
    if (pareceNaoFiccao(n)) {
        return false;
    }

    return n.includes('ficcao') || n.includes('fiction');
}

/** Romance (género): nome da categoria. */
function pareceRomance(n: string): boolean {
    return n.includes('romance');
}

/** Fantasia / fantasy: nome da categoria (normalizado). */
function pareceFantasia(n: string): boolean {
    return (
        n.includes('fantasia') ||
        n.includes('fantasy') ||
        n.includes('fantastica') ||
        n.includes('fantastico')
    );
}

/** Banda desenhada, BD, comics, etc. */
function pareceBandaDesenhada(n: string): boolean {
    return (
        n.includes('banda desenhada') ||
        n.includes('banda-desenhada') ||
        n.includes('bandas desenhadas') ||
        n.includes('quadrinhos') ||
        n.includes('graphic novel') ||
        n.includes('comic') ||
        n.includes('comics') ||
        n.includes('manga') ||
        /\bbd\b/.test(n)
    );
}

/** Livros novos / novidades no catálogo (variantes de nome na BD). */
function pareceLivrosNovos(n: string): boolean {
    return (
        /\blivros?\s+nov[oa]s\b/u.test(n) ||
        (n.includes('novos adicionados') && n.includes('livro')) ||
        n.includes('novos livros adicionados') ||
        /\bnovos\s+livros\b/u.test(n)
    );
}

/** Policial / crime / thriller (nome da categoria). */
function pareceCrime(n: string): boolean {
    return (
        n.includes('crime') ||
        n.includes('policial') ||
        n.includes('thriller') ||
        n.includes('misterio') ||
        n.includes('suspense') ||
        n.includes('detective')
    );
}

function normalizeForMatch(s: string): string {
    return s
        .normalize('NFD')
        .replace(/\p{M}/gu, '')
        .toLowerCase();
}

type CategoryLike =
    | Category
    | {
          id: string | number;
          name?: string;
          nome?: string;
          slug?: string | null;
      };

function categorySlug(c: CategoryLike): string | null {
    if ('slug' in c && typeof c.slug === 'string' && c.slug !== '') {
        return c.slug;
    }

    return null;
}

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
    const slug = categorySlug(c);

    if (slug !== null && ICON_POR_SLUG[slug as keyof typeof ICON_POR_SLUG] !== undefined) {
        return ICON_POR_SLUG[slug as keyof typeof ICON_POR_SLUG] as string;
    }

    if (String(c.id) === String(CATEGORIA_EBOOK_ID)) {
        return ICON_LIVROS_PDF_ONLINE;
    }

    if (String(c.id) === String(CATEGORIA_AUDIOBOOK_ID)) {
        return ICON_AUDIOBOOK;
    }

    if (String(c.id) === String(CATEGORIA_LIVROS_NOVOS_ID)) {
        return ICON_LIVROS_NOVOS;
    }

    if (String(c.id) === String(CATEGORIA_BESTSELLERS_ID)) {
        return ICON_BESTSELLERS;
    }

    if (String(c.id) === String(CATEGORIA_MANGA_ID)) {
        return ICON_BANDA_DESENHADA;
    }

    const raw = categoryDisplayName(c);
    const n = normalizeForMatch(raw);

    if (pareceBandaDesenhada(n)) {
        return ICON_BANDA_DESENHADA;
    }

    if (pareceRomance(n)) {
        return ICON_ROMANCE;
    }

    if (pareceFantasia(n)) {
        return ICON_FANTASIA;
    }

    if (pareceFiccao(n)) {
        return ICON_FICCAO;
    }

    for (const hint of PDF_ONLINE_HINTS) {
        if (n.includes(hint)) {
            return ICON_LIVROS_PDF_ONLINE;
        }
    }

    if (pareceLivrosNovos(n)) {
        return ICON_LIVROS_NOVOS;
    }

    const idx = indiceCorPorCategoriaId(c.id);

    return ICON_LIVROS_COLORIDOS[idx];
}

/**
 * Ordem de referência (após «Todas»): e-books → novos → bestsellers → audiobooks →
 * ficção (genérica) → romance → fantasia → manga → crime → banda desenhada → restantes.
 */
function ordemCatalogoReferencia(c: CategoryLike): number {
    const slug = categorySlug(c);

    if (slug !== null) {
        const idx = ORDEM_SLUGS_CATALOGO.indexOf(
            slug as (typeof ORDEM_SLUGS_CATALOGO)[number],
        );

        if (idx >= 0) {
            return 10 + idx;
        }
    }

    const id = String(c.id);
    const n = normalizeForMatch(categoryDisplayName(c));

    if (id === String(CATEGORIA_EBOOK_ID)) {
        return 10;
    }

    if (id === String(CATEGORIA_LIVROS_NOVOS_ID)) {
        return 20;
    }

    if (pareceLivrosNovos(n)) {
        return 20;
    }

    if (id === String(CATEGORIA_BESTSELLERS_ID)) {
        return 30;
    }

    if (id === String(CATEGORIA_AUDIOBOOK_ID)) {
        return 40;
    }

    if (pareceRomance(n)) {
        return 60;
    }

    if (pareceFantasia(n)) {
        return 70;
    }

    if (id === String(CATEGORIA_MANGA_ID)) {
        return 80;
    }

    if (pareceCrime(n)) {
        return 90;
    }

    if (
        pareceFiccao(n) &&
        !pareceFantasia(n) &&
        !pareceCrime(n) &&
        !pareceBandaDesenhada(n)
    ) {
        return 50;
    }

    if (pareceBandaDesenhada(n)) {
        return 95;
    }

    return 100;
}

function compararIdCategoria(a: string | number, b: string | number): number {
    const na = Number(a);
    const nb = Number(b);

    if (!Number.isNaN(na) && !Number.isNaN(nb)) {
        return na - nb;
    }

    return String(a).localeCompare(String(b));
}

function ordenarCategoriasCatalogo(lista: CategoryLike[]): CategoryLike[] {
    return [...lista].sort((a, b) => {
        const oa = ordemCatalogoReferencia(a);
        const ob = ordemCatalogoReferencia(b);

        if (oa !== ob) {
            return oa - ob;
        }

        return compararIdCategoria(a.id, b.id);
    });
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
    const categoriasOrdenadas = ordenarCategoriasCatalogo(categorias);
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
                aria-label="Categorias: ícone e nome; arrastar ou setas para ver mais"
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
