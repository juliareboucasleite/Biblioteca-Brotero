import clsx from 'clsx';
import { useCallback, useState } from 'react';
import type { MouseEvent } from 'react';
import type { LivroCatalogo } from '@/types';

type CardLivroProps = {
    livro: LivroCatalogo;
    className?: string;
};

export function CardLivro({ livro, className }: CardLivroProps) {
    const [position, setPosition] = useState<{ x: number; y: number } | null>(null);

    const updatePosition = useCallback((e: MouseEvent<HTMLAnchorElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setPosition({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        });
    }, []);

    const href = `/biblioteca/livro?id=${encodeURIComponent(livro.id)}&titulo=${encodeURIComponent(livro.titulo)}&autor=${encodeURIComponent(livro.autor)}&desc=${encodeURIComponent(livro.desc)}&capa=${encodeURIComponent(livro.capa ?? '')}`;
    const hasCover = Boolean(livro.capa && livro.capa.trim().length > 0);

    return (
        <article
            className={clsx(
                'bg-(--brotero-branco) border border-(--brotero-borda) rounded-(--raio) p-0 overflow-hidden flex flex-col transition-shadow duration-150 ease-in-out hover:shadow-[0_2px_8px_rgba(0,0,0,0.12)]',
                className,
            )}
        >
            <a
                href={href}
                className="group relative aspect-2/3 bg-linear-to-br from-[#e8e8e8] to-[#d0d0d0] min-h-[200px] max-[768px]:min-h-[160px] block no-underline text-inherit"
                aria-label="Ver livro e requisitar"
                onMouseEnter={updatePosition}
                onMouseMove={updatePosition}
            >
                {hasCover && (
                    <img
                        className="absolute inset-0 w-full h-full object-cover"
                        src={livro.capa as string}
                        alt={`Capa do livro ${livro.titulo}`}
                        loading="lazy"
                        referrerPolicy="no-referrer"
                    />
                )}
                <span
                    className="absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2 px-[16px] py-[8px] rounded-[16px] bg-black text-white text-[13px] font-semibold cursor-pointer opacity-0 pointer-events-none transition-opacity duration-200 ease-in-out will-change-[left,top] group-hover:opacity-100 group-hover:pointer-events-auto"
                    style={
                        position !== null
                            ? { left: position.x, top: position.y }
                            : { left: '50%', top: '50%' }
                    }
                >
                    take it
                </span>
            </a>
            {(livro.requisicoes_count ?? 0) > 0 ? (
                <p className="m-0 px-[10px] py-[8px] text-[12px] font-semibold text-(--brotero-texto-cinza) border-t border-(--brotero-borda)">
                    {livro.requisicoes_count}{' '}
                    {livro.requisicoes_count === 1 ? 'requisição' : 'requisições'}
                </p>
            ) : null}
        </article>
    );
}
