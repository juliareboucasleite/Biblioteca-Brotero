import { useCallback, useState } from 'react';

type Livro = {
    id: string;
    titulo: string;
    autor: string;
    desc: string;
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

    const href = `/biblioteca/livro?id=${encodeURIComponent(livro.id)}&titulo=${encodeURIComponent(livro.titulo)}&autor=${encodeURIComponent(livro.autor)}&desc=${encodeURIComponent(livro.desc)}`;

    return (
        <article className="card-livro box-brotero">
            <a
                href={href}
                className="card-livro-capa"
                aria-label="Ver livro e requisitar"
                onMouseEnter={updatePosition}
                onMouseMove={updatePosition}
            >
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
