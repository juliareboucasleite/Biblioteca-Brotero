import type { ReactNode } from 'react';
import type { RankingCatalogoEntrada } from '@/components/biblioteca/BibliotecaRankingCatalogo';

type CartaoPodioProps = {
    entrada: RankingCatalogoEntrada;
    place: 1 | 2 | 3;
};

function CartaoPodio({ entrada, place }: CartaoPodioProps) {
    const heights = {
        1: 'h-[900px]',
        2: 'h-[800px]',
        3: 'h-[750px]',
    } as const;
    const colors = {
        1: 'bg-(--brotero-primaria)',
        2: 'bg-(--brotero-primaria)/60',
        3: 'bg-(--brotero-primaria)/60',
    } as const;

    return (
        <div
            className={`w-[180px] ${heights[place]} ${colors[place]} flex flex-col items-center justify-between rounded-t-xl pb-6 pt-4 text-white shadow-[0_10px_30px_rgba(0,0,0,0.15)]`}
            aria-label={`${place}.º lugar, ${entrada.nome}, ${entrada.pontos} pontos`}
        >
            <div className="text-center">
                <div className="text-sm font-semibold">{place}.º lugar</div>
                <div className="font-bold">{entrada.nome}</div>
                <div className="font-semibold">{entrada.pontos} pts</div>
            </div>
            <div className="text-3xl font-bold opacity-80">
                {place}
            </div>
        </div>
    );
}

function LinhaRanking({ r }: { r: RankingCatalogoEntrada }) {
    return (
        <li className="flex min-h-[58px] items-center justify-between gap-[12px] rounded-[12px] bg-(--brotero-primaria)/70 px-[16px] py-[10px] text-white shadow-[0_6px_16px_rgba(42,38,48,0.12)]">
            <div className="min-w-0">
                <p className="m-0 truncate text-[14px] font-semibold">
                    {r.posicao}. {r.nome}
                </p>
                <p className="m-0 text-[11px] font-mono text-white/80">{r.cartao_mascarado}</p>
            </div>
            <span className="shrink-0 text-[14px] font-bold">{r.pontos} pts</span>
        </li>
    );
}

type Props = {
    ranking: RankingCatalogoEntrada[];
};

/** Conteúdo do ranking completo: top 3 em destaque + restantes em lista (só para /ranking). */
export function BibliotecaRankingPaginaCompleta({ ranking }: Props) {
    const first = ranking[0];
    const second = ranking[1];
    const third = ranking[2];
    const rest = ranking.slice(3);
    let podio: ReactNode = null;

    if (ranking.length === 1 && first) {
        podio = (
            <div className="flex items-end justify-center gap-6">
                <CartaoPodio entrada={first} place={1} />
            </div>
        );
    } else if (ranking.length === 2 && first && second) {
        podio = (
            <div className="relative flex items-end justify-center gap-0">
                <div className="translate-x-6 z-10">
                    <CartaoPodio entrada={second} place={2} />
                </div>
                <div className="z-20">
                    <CartaoPodio entrada={first} place={1} />
                </div>
            </div>
        );
    } else if (first && second && third) {
        podio = (
            <div className="relative flex items-end justify-center gap-0">
                <div className="translate-x-6 z-10">
                    <CartaoPodio entrada={second} place={2} />
                </div>
                <div className="z-20">
                    <CartaoPodio entrada={first} place={1} />
                </div>
                <div className="-translate-x-6 z-10">
                    <CartaoPodio entrada={third} place={3} />
                </div>
            </div>
        );
    }

    return (
        <div className="grid w-full gap-[10px] lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
            <div className="w-full min-h-[50vh] flex items-center justify-start">
                {podio}
            </div>
            {rest.length > 0 ? (
                <aside className="p-[8px] lg:-ml-[200px] lg:mt-[200px] lg:sticky lg:top-[90px]">
                    <ol className="m-0 flex list-none flex-col gap-[12px] p-0" aria-label="Posições seguintes do ranking">
                        {rest.map((r) => (
                            <LinhaRanking key={`${r.posicao}-${r.cartao_mascarado}`} r={r} />
                        ))}
                    </ol>
                </aside>
            ) : null}
        </div>
    );
}
