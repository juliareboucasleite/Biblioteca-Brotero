import type { BookRecommendationApi } from '@/types';

import { BookRecommendationsRow } from './BookRecommendationsRow';

type BookRecommendationsByAuthorProps = {
    recommendations: BookRecommendationApi[];
    /** Rótulo do(s) autor(es) do livro atual (para o título da secção). */
    authorsSummary: string;
};

export function BookRecommendationsByAuthor({
    recommendations,
    authorsSummary,
}: BookRecommendationsByAuthorProps) {
    const title = authorsSummary.trim()
        ? `Mais livros de ${authorsSummary}`
        : 'Recomendações do mesmo autor';

    return (
        <BookRecommendationsRow
            title={title}
            recommendations={recommendations}
            ariaLabel="Livros do mesmo autor"
        />
    );
}
