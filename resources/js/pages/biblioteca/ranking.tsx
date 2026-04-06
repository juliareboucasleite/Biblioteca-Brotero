import { Head, Link } from '@inertiajs/react';
import { BibliotecaCatalogShell } from '@/components/biblioteca/BibliotecaCatalogShell';

type Entrada = {
    posicao: number;
    nome: string;
    pontos: number;
    cartao_mascarado: string;
};

type Props = {
    ranking: Entrada[];
};

export default function BibliotecaRanking({ ranking }: Props) {
    return (
        <>
            <Head title="Ranking — Biblioteca Brotero" />
            <BibliotecaCatalogShell>
                <header className="mb-[22px] pt-[4px] lg:pt-0">
                    <h1 className="m-0 mb-[8px] text-[1.6rem] font-bold leading-tight text-(--brotero-texto)">
                        Ranking de leitores
                    </h1>
                    <p className="m-0 max-w-[54ch] text-[15px] leading-snug text-(--brotero-texto-cinza)">
                        Pontos por requisitar (+10) e por devolver no prazo (+20). Só aparecem leitores com
                        pontos &gt; 0.
                    </p>
                </header>

                <div className="mx-auto w-full max-w-[720px]">
                    {ranking.length === 0 ? (
                        <p
                            className="m-0 rounded-[14px] border border-dashed border-(--brotero-borda) bg-(--brotero-branco) p-[18px] text-[15px] text-(--brotero-texto-cinza)"
                            role="status"
                        >
                            Ainda não há pontos registados. Requisite um livro ou devolva dentro do prazo para
                            começar a acumular.
                        </p>
                    ) : (
                        <ol className="m-0 flex list-none flex-col gap-[12px] p-0">
                            {ranking.map((r) => (
                                <li
                                    key={`${r.posicao}-${r.cartao_mascarado}`}
                                    className="flex flex-wrap items-baseline justify-between gap-[12px] rounded-[18px] border border-(--brotero-borda-suave) bg-(--brotero-branco) p-[14px_18px] shadow-[0_8px_28px_rgba(42,38,48,0.06)]"
                                >
                                    <span className="text-[15px] font-bold text-(--brotero-texto)">
                                        {r.posicao}. {r.nome}
                                    </span>
                                    <span className="font-mono text-[14px] text-(--brotero-texto-cinza)">
                                        {r.cartao_mascarado}
                                    </span>
                                    <span className="ml-auto text-[16px] font-semibold text-(--brotero-primaria)">
                                        {r.pontos} pts
                                    </span>
                                </li>
                            ))}
                        </ol>
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
