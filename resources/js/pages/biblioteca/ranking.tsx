import { Head, Link } from '@inertiajs/react';

import { BibliotecaCatalogShell } from '@/components/biblioteca/BibliotecaCatalogShell';
import type { RankingCatalogoEntrada } from '@/components/biblioteca/BibliotecaRankingCatalogo';
import { BibliotecaRankingPaginaCompleta } from '@/components/biblioteca/BibliotecaRankingPaginaCompleta';

type Props = {
    ranking: RankingCatalogoEntrada[];
};

export default function BibliotecaRanking({ ranking }: Props) {
    return (
        <>
            <Head title="Ranking · Biblioteca Brotero" />
            <BibliotecaCatalogShell>
                <header className="mb-[22px] pt-[4px] lg:pt-0">
                    <h1 className="m-0 mb-[8px] text-[1.6rem] font-bold leading-tight text-(--brotero-texto)">
                        Ranking de leitores
                    </h1>
                    <p className="m-0 max-w-[54ch] text-[15px] leading-snug text-(--brotero-texto-cinza)">
                        Pontos por requisitar (+10) e por devolver no prazo (+20). O ranking destaca quem vai
                        acumulando pontos.
                    </p>
                </header>

                <div className="mx-auto w-full max-w-[860px]">
                    {ranking.length === 0 ? (
                        <p
                            className="m-0 rounded-[14px] border border-dashed border-(--brotero-borda) bg-(--brotero-branco) p-[18px] text-[15px] text-(--brotero-texto-cinza)"
                            role="status"
                        >
                            Soma pontos ao requisitar (+10) e ao devolver no prazo (+20). Acompanhe o ranking para ver a
                            comunidade em movimento.
                        </p>
                    ) : (
                        <BibliotecaRankingPaginaCompleta ranking={ranking} />
                    )}
                    <p className="mt-[24px] mb-0 text-[14px]">
                        <Link
                            href="/biblioteca"
                            className="font-semibold text-(--brotero-texto-link) no-underline hover:text-(--brotero-texto-link-hover) hover:underline"
                        >
                            ← Voltar ao catálogo
                        </Link>
                    </p>
                </div>
            </BibliotecaCatalogShell>
        </>
    );
}
