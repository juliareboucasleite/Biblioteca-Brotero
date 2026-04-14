import { Head, Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';

import { BibliotecaCatalogShell } from '@/components/biblioteca/BibliotecaCatalogShell';
import type { RankingCatalogoEntrada } from '@/components/biblioteca/BibliotecaRankingCatalogo';
import { BibliotecaRankingPaginaCompleta } from '@/components/biblioteca/BibliotecaRankingPaginaCompleta';

type Props = {
    ranking: RankingCatalogoEntrada[];
};

export default function BibliotecaRanking({ ranking }: Props) {
    const [showConfetti, setShowConfetti] = useState(true);

    useEffect(() => {
        const timer = window.setTimeout(() => {
            setShowConfetti(false);
        }, 3500);

        return () => {
            window.clearTimeout(timer);
        };
    }, []);

    return (
        <>
            <Head title="Ranking · Biblioteca Brotero" />
            <BibliotecaCatalogShell>
                {showConfetti ? (
                    <div className="pointer-events-none fixed inset-0 z-60 overflow-hidden" aria-hidden>
                        <span className="absolute left-[6%] top-[-10%] h-[12px] w-[7px] animate-[brotero-confetti-fall_3.1s_linear_forwards] [animation-delay:-900ms] rounded-[2px] bg-amber-400" />
                        <span className="absolute left-[16%] top-[-12%] h-[10px] w-[10px] animate-[brotero-confetti-fall_2.8s_linear_forwards] [animation-delay:120ms] rounded-[2px] bg-rose-400" />
                        <span className="absolute left-[26%] top-[-8%] h-[12px] w-[8px] animate-[brotero-confetti-fall_3.2s_linear_forwards] [animation-delay:-350ms] rounded-[2px] bg-sky-400" />
                        <span className="absolute left-[36%] top-[-11%] h-[9px] w-[9px] animate-[brotero-confetti-fall_2.9s_linear_forwards] [animation-delay:260ms] rounded-[2px] bg-lime-400" />
                        <span className="absolute left-[46%] top-[-10%] h-[12px] w-[7px] animate-[brotero-confetti-fall_3.3s_linear_forwards] [animation-delay:-700ms] rounded-[2px] bg-fuchsia-400" />
                        <span className="absolute left-[56%] top-[-9%] h-[10px] w-[10px] animate-[brotero-confetti-fall_3.05s_linear_forwards] [animation-delay:540ms] rounded-[2px] bg-orange-400" />
                        <span className="absolute left-[66%] top-[-12%] h-[12px] w-[7px] animate-[brotero-confetti-fall_2.95s_linear_forwards] [animation-delay:-480ms] rounded-[2px] bg-emerald-400" />
                        <span className="absolute left-[76%] top-[-8%] h-[10px] w-[10px] animate-[brotero-confetti-fall_3.25s_linear_forwards] [animation-delay:310ms] rounded-[2px] bg-cyan-400" />
                        <span className="absolute left-[86%] top-[-11%] h-[12px] w-[8px] animate-[brotero-confetti-fall_2.85s_linear_forwards] [animation-delay:-820ms] rounded-[2px] bg-violet-400" />
                        <span className="absolute left-[94%] top-[-10%] h-[10px] w-[10px] animate-[brotero-confetti-fall_3.15s_linear_forwards] [animation-delay:180ms] rounded-[2px] bg-yellow-400" />
                        <span className="absolute left-[10%] top-[-14%] h-[8px] w-[14px] animate-[brotero-confetti-fall_2.7s_linear_forwards] [animation-delay:-620ms] rounded-[2px] bg-red-400" />
                        <span className="absolute left-[20%] top-[-9%] h-[12px] w-[6px] animate-[brotero-confetti-fall_3.35s_linear_forwards] [animation-delay:420ms] rounded-[2px] bg-indigo-400" />
                        <span className="absolute left-[30%] top-[-13%] h-[9px] w-[9px] animate-[brotero-confetti-fall_2.75s_linear_forwards] [animation-delay:-210ms] rounded-[2px] bg-teal-400" />
                        <span className="absolute left-[40%] top-[-7%] h-[11px] w-[7px] animate-[brotero-confetti-fall_3.4s_linear_forwards] [animation-delay:660ms] rounded-[2px] bg-pink-400" />
                        <span className="absolute left-[50%] top-[-12%] h-[10px] w-[12px] animate-[brotero-confetti-fall_2.9s_linear_forwards] [animation-delay:-760ms] rounded-[2px] bg-green-400" />
                        <span className="absolute left-[60%] top-[-8%] h-[8px] w-[8px] animate-[brotero-confetti-fall_3.5s_linear_forwards] [animation-delay:80ms] rounded-[2px] bg-blue-500" />
                        <span className="absolute left-[70%] top-[-15%] h-[12px] w-[7px] animate-[brotero-confetti-fall_2.65s_linear_forwards] [animation-delay:-540ms] rounded-[2px] bg-purple-500" />
                        <span className="absolute left-[80%] top-[-9%] h-[9px] w-[13px] animate-[brotero-confetti-fall_3.45s_linear_forwards] [animation-delay:500ms] rounded-[2px] bg-cyan-500" />
                        <span className="absolute left-[90%] top-[-13%] h-[11px] w-[6px] animate-[brotero-confetti-fall_2.8s_linear_forwards] [animation-delay:-300ms] rounded-[2px] bg-lime-500" />
                        <span className="absolute left-[14%] top-[-6%] h-[10px] w-[10px] animate-[brotero-confetti-fall_3.22s_linear_forwards] [animation-delay:240ms] rounded-[2px] bg-orange-300" />
                        <span className="absolute left-[34%] top-[-16%] h-[7px] w-[12px] animate-[brotero-confetti-fall_2.92s_linear_forwards] [animation-delay:-880ms] rounded-[2px] bg-emerald-300" />
                        <span className="absolute left-[54%] top-[-6%] h-[12px] w-[8px] animate-[brotero-confetti-fall_3.12s_linear_forwards] [animation-delay:350ms] rounded-[2px] bg-rose-300" />
                        <span className="absolute left-[74%] top-[-14%] h-[9px] w-[9px] animate-[brotero-confetti-fall_3.02s_linear_forwards] [animation-delay:-430ms] rounded-[2px] bg-amber-300" />
                        <span className="absolute left-[84%] top-[-7%] h-[11px] w-[7px] animate-[brotero-confetti-fall_3.28s_linear_forwards] [animation-delay:600ms] rounded-[2px] bg-fuchsia-300" />
                    </div>
                ) : null}
                <header className="mb-[22px] pt-[4px] lg:pt-0">
                    <p className="m-0 mb-[10px] text-[14px]">
                        <Link
                            href="/biblioteca"
                            className="font-semibold text-(--brotero-texto-link) no-underline hover:text-(--brotero-texto-link-hover) hover:underline"
                        >
                            ← Voltar ao catálogo
                        </Link>
                    </p>
                    <h1 className="m-0 mb-[8px] text-[1.6rem] font-bold leading-tight text-(--brotero-texto)">
                        Ranking de leitores
                    </h1>
                    <p className="m-0 max-w-[54ch] text-[15px] leading-snug text-(--brotero-texto-cinza)">
                        Pontos por requisitar (+10) e por devolver no prazo (+20). O ranking destaca quem vai
                        acumulando pontos.
                    </p>
                </header>

                <div className="w-full">
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
                </div>
            </BibliotecaCatalogShell>
        </>
    );
}
