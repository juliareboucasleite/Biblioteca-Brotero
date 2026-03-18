import { useCallback, useState } from 'react';

type Livro = {
    id: string;
    titulo: string;
    autor: string;
    desc: string;
    capa?: string | null;
};

type CardLivroProps = {
    livro: Livro;
};

export function CardLivro({ livro }: CardLivroProps) {
    const [position, setPosition] = useState<{ x: number; y: number } | null>(null);

    const updatePosition = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setPosition({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        });
    }, []);

    const href = `/biblioteca/livro?id=${encodeURIComponent(livro.id)}&titulo=${encodeURIComponent(livro.titulo)}&autor=${encodeURIComponent(livro.autor)}&desc=${encodeURIComponent(livro.desc)}&capa=${encodeURIComponent(livro.capa ?? '')}`;
    const hasCover = Boolean(livro.capa && livro.capa.trim().length > 0);

    return (
        <article className="card-livro box-brotero">
            <a
                href={href}
                className="card-livro-capa"
                aria-label="Ver livro e requisitar"
                onMouseEnter={updatePosition}
                onMouseMove={updatePosition}
            >
                {hasCover && (
                    <img
                        className="card-livro-img"
                        src={livro.capa as string}
                        alt={`Capa do livro ${livro.titulo}`}
                        loading="lazy"
                        referrerPolicy="no-referrer"
                    />
                )}
                <span
                    className="card-livro-take-btn"
                    style={
                        position !== null
                            ? { left: position.x, top: position.y }
                            : { left: '50%', top: '50%' }
                    }
                >
                    take it
                </span>
            </a>
        </article>
    );
}
