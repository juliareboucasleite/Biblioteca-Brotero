import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type BibliotecaMainRowProps = {
    /** Sidebar opcional (ex.: categorias no catálogo; omitir na ficha do livro). */
    sidebar?: ReactNode;
    children: ReactNode;
    className?: string;
};

/**
 * Linha principal: sidebar opcional + coluna de conteúdo (max-width Brotero).
 */
export function BibliotecaMainRow({ sidebar, children, className }: BibliotecaMainRowProps) {
    return (
        <main
            className={cn(
                'w-full max-w-(--max-largura) mx-auto px-[10px] flex gap-[18px] items-start flex-1 max-[768px]:flex-col max-[768px]:items-stretch',
                className,
            )}
        >
            {sidebar}
            <div className="flex-1 min-w-0">{children}</div>
        </main>
    );
}
