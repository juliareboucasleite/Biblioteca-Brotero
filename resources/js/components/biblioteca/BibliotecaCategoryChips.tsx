import { cn } from '@/lib/utils';
import type { Category } from '@/types';

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

    return (
        <div className={cn('w-full min-w-0', className)}>
            <p className="m-0 mb-[10px] text-[12px] font-bold tracking-[0.06em] text-(--brotero-texto-cinza) uppercase">
                Categorias
            </p>
            <div
                className="flex snap-x snap-proximity gap-[8px] overflow-x-auto pb-[6px] [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                role="list"
            >
                <a
                    role="listitem"
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
