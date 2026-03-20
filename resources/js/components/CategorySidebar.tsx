import React from 'react';
import type { Category } from '@/types';

type CategoryLike = Category | { id: string | number; name?: string; nome?: string };

function categoryDisplayName(c: CategoryLike): string {
    if (typeof c.name === 'string' && c.name !== '') {
        return c.name;
    }

    if ('nome' in c && typeof c.nome === 'string') {
        return c.nome;
    }

    return '';
}

type Props = {
    categorias: CategoryLike[];
    categoriaSelecionada?: string | null;
    q?: string;
    lingua?: string;
    authorId?: string;
    ano?: string;
    /** Se true, os links vão para `/biblioteca/livros` (lista completa). */
    todosLivros?: boolean;
};

const linkClass =
    'block w-full py-[6px] px-[14px] text-left bg-transparent text-[13px] text-(--brotero-texto) cursor-pointer transition-colors duration-150 ease-in-out hover:bg-[#f3f3f3] focus-visible:outline focus-visible:outline-2 focus-visible:outline-(--brotero-primaria) focus-visible:-outline-offset-2';

const CategorySidebar: React.FC<Props> = ({
    categorias,
    categoriaSelecionada,
    q,
    lingua,
    authorId,
    ano,
    todosLivros = false,
}) => {
    const basePath = todosLivros ? '/biblioteca/livros' : '/biblioteca';

    const buildUrl = (params: Record<string, string | number | undefined>) => {
        const filtered = Object.fromEntries(
            Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== ''),
        );

        const query = new URLSearchParams(filtered as Record<string, string>).toString();

        return query ? `${basePath}?${query}` : basePath;
    };

    return (
        <aside className="w-[220px] shrink-0 max-[768px]:w-full bg-(--brotero-branco) border border-(--brotero-borda) rounded-(--raio) p-[16px_18px]">
            <h2 className="m-0 mx-[14px] mb-[10px] text-[1rem] font-bold text-(--brotero-texto)">
                Categorias
            </h2>

            <ul className="list-none m-0 max-h-[min(70vh,calc(100svh-12rem))] overflow-y-auto overscroll-contain border-t border-(--brotero-borda) py-[6px] pb-[10px] pr-1">
                <li>
                    <a
                        href={buildUrl({ q, lingua, author_id: authorId, ano })}
                        className={linkClass}
                        aria-current={!categoriaSelecionada ? 'page' : undefined}
                    >
                        Todas
                    </a>
                </li>

                {categorias.map((c) => (
                    <li key={String(c.id)}>
                        <a
                            href={buildUrl({
                                categoria: c.id,
                                q,
                                lingua,
                                author_id: authorId,
                                ano,
                            })}
                            className={linkClass}
                            aria-current={
                                categoriaSelecionada === String(c.id) ? 'page' : undefined
                            }
                        >
                            {categoryDisplayName(c)}
                        </a>
                    </li>
                ))}
            </ul>
        </aside>
    );
};

export default CategorySidebar;
