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
                    className="m-0 rounded-(--raio) border border-dashed border-(--brotero-borda) bg-(--brotero-branco) p-[16px] text-[14px] text-(--brotero-texto-cinza)"
                >
                    Abre o ranking completo para acompanhar leitores. Os pontos refletem requisições e
                    devoluções a tempo.
                </p>
            ) : (
                <ol
                    id="secao-ranking-catalogo"
                    className="m-0 flex list-none flex-col gap-[8px] p-0"
                >
                    {ranking.map((r) => (
                        <li
                            key={`${r.posicao}-${r.cartao_mascarado}`}
                            className="flex flex-wrap items-baseline justify-between gap-[10px] rounded-[14px] border border-(--brotero-borda-suave) bg-(--brotero-branco) px-[14px] py-[11px] shadow-[0_4px_16px_rgba(42,38,48,0.05)] transition-shadow hover:shadow-[0_6px_20px_rgba(42,38,48,0.08)] motion-reduce:transition-none"
                        >
                            <span className="text-[14px] font-bold text-(--brotero-texto)">
                                {r.posicao}. {r.nome}
                            </span>
                            <span className="font-mono text-[13px] text-(--brotero-texto-cinza)">
                                {r.cartao_mascarado}
                            </span>
                            <span className="ml-auto text-[14px] font-semibold text-(--brotero-primaria)">
                                {r.pontos} pts
                            </span>
                        </li>
                    ))}
                </ol>
            )}
        </section>
    );
}
