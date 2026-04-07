import type { ReactNode } from 'react';
import type { RankingCatalogoEntrada } from '@/components/biblioteca/BibliotecaRankingCatalogo';

type PodiumPlace = 1 | 2 | 3;

function destaqueClasses(place: PodiumPlace) {
    switch (place) {
        case 1:
            return {
                wrap: 'border-amber-300/90 bg-linear-to-br from-amber-50/80 to-(--brotero-branco) shadow-[0_10px_28px_rgba(180,83,9,0.12)]',
                badge: 'bg-amber-100 text-amber-900 ring-2 ring-amber-200/90',
            };
        case 2:
            return {
                wrap: 'border-slate-300/90 bg-linear-to-br from-slate-50 to-(--brotero-branco) shadow-[0_8px_22px_rgba(100,116,139,0.1)]',
                badge: 'bg-slate-200 text-slate-800 ring-2 ring-slate-300/80',
            };
        case 3:
            return {
                wrap: 'border-orange-300/80 bg-linear-to-br from-orange-50/70 to-(--brotero-branco) shadow-[0_8px_22px_rgba(234,88,12,0.1)]',
                badge: 'bg-orange-100 text-orange-950 ring-2 ring-orange-200/90',
            };
    }
}

type CartaoPodioProps = {
    entrada: RankingCatalogoEntrada;
    place: PodiumPlace;
    emphasis: 'lead' | 'side';
};

function CartaoPodio({ entrada, place, emphasis }: CartaoPodioProps) {
    const { wrap, badge } = destaqueClasses(place);
    const lead = emphasis === 'lead';

    return (
        <article
            className={`flex min-w-0 flex-1 flex-col gap-[12px] rounded-[18px] border-2 p-[16px] sm:flex-row sm:items-center sm:gap-[16px] ${wrap} ${
                lead ? 'sm:scale-[1.03] sm:py-[18px]' : 'sm:max-w-[220px] sm:py-[14px]'
            }`}
            aria-label={`${place}.º lugar, ${entrada.nome}, ${entrada.pontos} pontos`}
        >
            <div
                className={`flex size-[44px] shrink-0 items-center justify-center rounded-full text-[1.1rem] font-black tabular-nums ${badge} sm:size-[48px]`}
                aria-hidden
            >
                {place}
            </div>
            <div className="min-w-0 flex-1">
                <p className={`m-0 font-bold text-(--brotero-texto) ${lead ? 'text-[1.05rem]' : 'text-[15px]'}`}>
                    {entrada.nome}
                </p>
                <p className="mt-[2px] m-0 font-mono text-[13px] text-(--brotero-texto-cinza)">
                    {entrada.cartao_mascarado}
                </p>
                <p className="mt-[8px] m-0 text-[16px] font-semibold tabular-nums text-(--brotero-primaria)">
                    {entrada.pontos} pts
                </p>
            </div>
        </article>
    );
}

function LinhaRanking({ r }: { r: RankingCatalogoEntrada }) {
    return (
        <li className="flex flex-wrap items-baseline justify-between gap-[12px] rounded-[18px] border border-(--brotero-borda-suave) bg-(--brotero-branco) p-[14px_18px] shadow-[0_8px_28px_rgba(42,38,48,0.06)]">
            <span className="text-[15px] font-bold text-(--brotero-texto)">
                {r.posicao}. {r.nome}
            </span>
            <span className="font-mono text-[14px] text-(--brotero-texto-cinza)">{r.cartao_mascarado}</span>
            <span className="ml-auto text-[16px] font-semibold text-(--brotero-primaria)">{r.pontos} pts</span>
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
    const gapPodio = 'gap-[12px] sm:gap-[14px]';

    let podio: ReactNode = null;

    if (ranking.length === 1 && first) {
        podio = (
            <div className="mx-auto flex max-w-[400px] justify-center">
                <CartaoPodio entrada={first} place={1} emphasis="lead" />
            </div>
        );
    } else if (ranking.length === 2 && first && second) {
        podio = (
            <div
                className={`mx-auto flex max-w-[560px] flex-col items-stretch sm:flex-row ${gapPodio} sm:items-end`}
            >
                <div className="flex flex-1 justify-center sm:justify-end sm:pb-[8px]">
                    <CartaoPodio entrada={second} place={2} emphasis="side" />
                </div>
                <div className="flex flex-[1.08] justify-center">
                    <CartaoPodio entrada={first} place={1} emphasis="lead" />
                </div>
            </div>
        );
    } else if (first && second && third) {
        podio = (
            <div
                className={`mx-auto flex max-w-[820px] flex-col items-stretch sm:flex-row ${gapPodio} sm:items-end`}
            >
                <div className="order-2 flex flex-1 justify-center sm:order-1 sm:justify-end sm:pb-[10px]">
                    <CartaoPodio entrada={second} place={2} emphasis="side" />
                </div>
                <div className="order-1 flex flex-[1.12] justify-center sm:order-2">
                    <CartaoPodio entrada={first} place={1} emphasis="lead" />
                </div>
                <div className="order-3 flex flex-1 justify-center sm:pb-[10px]">
                    <CartaoPodio entrada={third} place={3} emphasis="side" />
                </div>
            </div>
        );
    }

    return (
        <div className="w-full">
            {podio}
            {rest.length > 0 ? (
                <>
                    <h2
                        id="ranking-outras-posicoes"
                        className="mb-[12px] mt-[28px] text-[14px] font-semibold text-(--brotero-texto-cinza)"
                    >
                        Outras posições
                    </h2>
                    <ol className="m-0 flex list-none flex-col gap-[12px] p-0" aria-labelledby="ranking-outras-posicoes">
                        {rest.map((r) => (
                            <LinhaRanking key={`${r.posicao}-${r.cartao_mascarado}`} r={r} />
                        ))}
                    </ol>
                </>
            ) : null}
        </div>
    );
}
