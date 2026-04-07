import type { BookRecommendationApi } from '@/types';

import { BookRecommendationsRow } from './BookRecommendationsRow';

type BookRecommendationsByCategoryProps = {
    recommendations: BookRecommendationApi[];
    /** Nomes das categorias do livro atual (ex.: "Ficção, História"). */
    categoriesSummary: string;
};

export function BookRecommendationsByCategory({
    recommendations,
    categoriesSummary,
}: BookRecommendationsByCategoryProps) {
    const trimmed = categoriesSummary.trim();
    const title = trimmed
        ? `Mais livros na mesma categoria · ${trimmed}`
        : 'Mais livros na mesma categoria';

    return (
        <BookRecommendationsRow
            title={title}
            recommendations={recommendations}
            ariaLabel="Livros da mesma categoria"
        />
    );
}
