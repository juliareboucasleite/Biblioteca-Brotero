import { BookSectionHeader } from '@/components/biblioteca/BookSectionHeader';

export type RankingCatalogoEntrada = {
    posicao: number;
    nome: string;
    pontos: number;
    cartao_mascarado: string;
};

type BibliotecaRankingCatalogoProps = {
    ranking: RankingCatalogoEntrada[];
};

export function BibliotecaRankingCatalogo({ ranking }: BibliotecaRankingCatalogoProps) {
    return (
        <section className="mb-[24px]" aria-labelledby="secao-ranking-catalogo">
            <BookSectionHeader
                title="Ranking de leitores"
                action={
                    <a
                        href="/ranking"
                        className="text-[13px] text-(--brotero-texto-link) whitespace-nowrap hover:text-(--brotero-texto-link-hover) hover:underline"
                    >
                        Ver ranking completo
                    </a>
                }
            />
            {ranking.length === 0 ? (
                <p
                    id="secao-ranking-catalogo"
                    className="m-0 p-[16px] text-[14px] text-(--brotero-texto-cinza) border border-dashed border-(--brotero-borda) rounded-(--raio) bg-(--brotero-branco)"
                >
                    Ainda não há pontos registados. Requisite um livro ou devolva no prazo para aparecer aqui.
                </p>
            ) : (
                <ol
                    id="secao-ranking-catalogo"
                    className="m-0 p-0 list-none flex flex-col gap-[8px]"
                >
                    {ranking.map((r) => (
                        <li
                            key={`${r.posicao}-${r.cartao_mascarado}`}
                            className="flex flex-wrap items-baseline justify-between gap-[10px] px-[14px] py-[10px] bg-(--brotero-branco) border border-(--brotero-borda) rounded-(--raio)"
                        >
                            <span className="text-[14px] font-bold text-(--brotero-texto)">
                                {r.posicao}. {r.nome}
                            </span>
                            <span className="text-[13px] text-(--brotero-texto-cinza) font-mono">
                                {r.cartao_mascarado}
                            </span>
                            <span className="text-[14px] font-semibold text-(--brotero-primaria) ml-auto">
                                {r.pontos} pts
                            </span>
                        </li>
                    ))}
                </ol>
            )}
        </section>
    );
}
