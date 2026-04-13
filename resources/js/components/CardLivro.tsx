import { router, usePage } from '@inertiajs/react';
import clsx from 'clsx';
import { useCallback, useState } from 'react';
import type { MouseEvent } from 'react';
import type { LivroCatalogo } from '@/types';
import type { Auth } from '@/types/auth';

type CardLivroProps = {
    livro: LivroCatalogo;
    className?: string;
};

type PageProps = { auth: Auth; favoriteBookIds?: string[] };

export function CardLivro({ livro, className }: CardLivroProps) {
    const { auth, favoriteBookIds = [] } = usePage<PageProps>().props;
    const [position, setPosition] = useState<{ x: number; y: number } | null>(null);

    const updatePosition = useCallback((e: MouseEvent<HTMLAnchorElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setPosition({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        });
    }, []);

    const href = `/biblioteca/livro/${encodeURIComponent(livro.id)}`;
    const hasCover = Boolean(livro.capa && livro.capa.trim().length > 0);
    const isFavorite = favoriteBookIds.includes(String(livro.id));

    const onToggleFavorite = (e: MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        e.stopPropagation();

        if (!auth.patron) {
            window.location.href = '/biblioteca/entrar';

            return;
        }

        const bookId = encodeURIComponent(livro.id);

        if (isFavorite) {
            router.delete(`/biblioteca/conta/favoritos/${bookId}`, { preserveScroll: true });
        } else {
            router.post(`/biblioteca/conta/favoritos/${bookId}`, {}, { preserveScroll: true });
        }
    };

    return (
        <article
            className={clsx(
                'card-livro group',
                className,
            )}
        >
            <div className="relative">
                <a
                    href={href}
                    className="group relative aspect-2/3 bg-linear-to-br from-[#f8f8f8] to-[#ededed] min-h-[200px] max-[768px]:min-h-[160px] block no-underline text-inherit overflow-hidden"
                    aria-label="Ver livro e requisitar"
                    onMouseEnter={updatePosition}
                    onMouseMove={updatePosition}
                >
                    {hasCover && (
                        <img
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            src={livro.capa as string}
                            alt={`Capa do livro ${livro.titulo}`}
                            loading="lazy"
                            referrerPolicy="no-referrer"
                        />
                    )}
                    <div
                        className="absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2 px-[20px] py-[10px] rounded-full bg-(--brotero-primaria) text-white text-[14px] font-bold shadow-2xl opacity-0 pointer-events-none transition-all duration-300 ease-out will-change-[left,top] group-hover:opacity-100 group-hover:pointer-events-auto"
                        style={
                            position !== null
                                ? { left: position.x, top: position.y }
                                : { left: '50%', top: '50%' }
                        }
                    >
                        take it
                    </div>
                </a>
                {livro.tem_ebook ? (
                    <span className="pointer-events-none absolute top-[12px] left-[12px] z-10 rounded-full bg-(--brotero-primaria)/90 backdrop-blur-md px-[10px] py-[4px] text-[10px] font-black uppercase tracking-wider text-white shadow-lg">
                        E-book
                    </span>
                ) : null}
                <button
                    type="button"
                    className={clsx(
                        'absolute top-[12px] right-[12px] z-10 w-[40px] h-[40px] rounded-full bg-white/80 backdrop-blur-md border border-white/20 text-[20px] leading-none flex items-center justify-center cursor-pointer shadow-xl transition-all duration-200 hover:scale-110 active:scale-95',
                        isFavorite ? 'text-red-500' : 'text-(--brotero-texto-cinza)',
                    )}
                    title={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                    aria-label={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                    onClick={onToggleFavorite}
                >
                    {isFavorite ? '❤' : '♡'}
                </button>
            </div>
            {(livro.requisicoes_count ?? 0) > 0 ? (
                <p className="m-0 px-[10px] py-[8px] text-[12px] font-semibold text-(--brotero-texto-cinza) border-t border-(--brotero-borda)">
                    {livro.requisicoes_count}{' '}
                    {livro.requisicoes_count === 1 ? 'requisição' : 'requisições'}
                </p>
            ) : null}
        </article>
    );
}
