import type { LivroCatalogo } from '@/types';

export type BookApiRowLike = {
    id: number | string;
    title?: string | null;
    description?: string | null;
    cover_image?: string | null;
    authors?: Array<{ name?: string | null }> | null;
};

/** Converte uma linha da API `/books` ou recomendações para o formato do card Inertia. */
export function bookApiRowToLivroCatalogo(b: BookApiRowLike): LivroCatalogo {
    return {
        id: String(b.id),
        titulo: b.title?.toString() ?? '',
        autor:
            (b.authors ?? [])
                .map((a) => a?.name?.toString()?.trim())
                .filter((x): x is string => Boolean(x))
                .join(', ') || 'Autor desconhecido',
        desc: b.description?.toString() ?? '',
        capa: b.cover_image?.toString() ?? null,
    };
}
