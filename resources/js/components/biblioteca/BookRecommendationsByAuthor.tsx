import { CardLivro } from '@/components/CardLivro';
import { bookApiRowToLivroCatalogo } from '@/lib/biblioteca-map';
import type { BookRecommendationApi } from '@/types';

import { BookSectionHeader } from './BookSectionHeader';

type BookRecommendationsByAuthorProps = {
    recommendations: BookRecommendationApi[];
    /** Rótulo do(s) autor(es) do livro atual (para o título da secção). */
    authorsSummary: string;
};

export function BookRecommendationsByAuthor({
    recommendations,
    authorsSummary,
}: BookRecommendationsByAuthorProps) {
    if (recommendations.length === 0) {
        return null;
    }

    const livros = recommendations.map(bookApiRowToLivroCatalogo);

    const title = authorsSummary.trim()
        ? `Mais livros de ${authorsSummary}`
        : 'Recomendações do mesmo autor';

    return (
        <section className="mt-[32px]" aria-label={title}>
            <BookSectionHeader title={title} />
            <div
                className="flex gap-[16px] overflow-x-auto pb-[6px] snap-x snap-proximity"
                aria-label="Livros do mesmo autor"
            >
                {livros.map((livro) => (
                    <CardLivro
                        key={livro.id}
                        livro={livro}
                        className="w-[160px] flex-[0_0_160px] snap-start"
                    />
                ))}
            </div>
        </section>
    );
}
