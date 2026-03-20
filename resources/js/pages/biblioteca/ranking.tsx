import { Head } from '@inertiajs/react';
import { BibliotecaPageShell } from '@/components/biblioteca/BibliotecaPageShell';

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
            <BibliotecaPageShell>
                <main className="w-full max-w-[720px] mx-auto px-[10px] pt-[24px] pb-[48px] flex-1">
                    <h1 className="m-0 mb-[8px] text-[1.75rem] font-bold text-(--brotero-texto)">
                        Ranking de leitores
                    </h1>
                    <p className="m-0 mb-[24px] text-[15px] text-(--brotero-texto-cinza)">
                        Pontos por requisitar (+10) e por devolver no prazo (+20). Só aparecem leitores com
                        pontos &gt; 0.
                    </p>
                    {ranking.length === 0 ? (
                        <p className="m-0 p-[16px] border border-dashed border-(--brotero-borda) rounded-(--raio) text-(--brotero-texto-cinza)">
                            Ainda não há pontos registados. Requisite um livro ou devolva dentro do prazo para
                            começar a acumular.
                        </p>
                    ) : (
                        <ol className="m-0 p-0 list-none flex flex-col gap-[10px]">
                            {ranking.map((r) => (
                                <li
                                    key={`${r.posicao}-${r.cartao_mascarado}`}
                                    className="flex flex-wrap items-baseline justify-between gap-[12px] p-[14px_16px] bg-(--brotero-branco) border border-(--brotero-borda) rounded-(--raio)"
                                >
                                    <span className="text-[15px] font-bold text-(--brotero-texto)">
                                        {r.posicao}. {r.nome}
                                    </span>
                                    <span className="text-[14px] text-(--brotero-texto-cinza) font-mono">
                                        {r.cartao_mascarado}
                                    </span>
                                    <span className="text-[16px] font-semibold text-(--brotero-primaria) ml-auto">
                                        {r.pontos} pts
                                    </span>
                                </li>
                            ))}
                        </ol>
                    )}
                    <p className="mt-[24px] mb-0 text-[14px]">
                        <a href="/biblioteca" className="text-(--brotero-texto-link) hover:underline">
                            ← Voltar ao catálogo
                        </a>
                    </p>
                </main>
            </BibliotecaPageShell>
        </>
    );
}
