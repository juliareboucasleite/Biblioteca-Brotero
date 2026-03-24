import { CardLivro } from '@/components/CardLivro';
import { bookApiRowToLivroCatalogo } from '@/lib/biblioteca-map';
import type { BookRecommendationApi } from '@/types';

import { BookSectionHeader } from './BookSectionHeader';

type BookRecommendationsRowProps = {
    title: string;
    recommendations: BookRecommendationApi[];
    /** Rótulo acessível para o carrossel (leitores de ecrã). */
    ariaLabel: string;
};

export function BookRecommendationsRow({ title, recommendations, ariaLabel }: BookRecommendationsRowProps) {
    if (recommendations.length === 0) {
        return null;
    }

    const livros = recommendations.map(bookApiRowToLivroCatalogo);

    return (
        <section className="mt-[32px]" aria-label={title}>
            <BookSectionHeader title={title} />
            <div
                className="flex gap-[16px] overflow-x-auto pb-[6px] snap-x snap-proximity"
                aria-label={ariaLabel}
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
