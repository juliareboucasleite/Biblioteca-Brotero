import { router } from '@inertiajs/react';
import { BibliotecaContaLayout } from '@/components/biblioteca/BibliotecaContaLayout';
import type { PedidoLeitor } from '@/types';

type Props = {
    pedidos: PedidoLeitor[];
};

function formatEur(val: string | undefined): string {
    if (val === undefined || val === null) {
        return '—';
    }

    const n = Number(val);

    if (!Number.isFinite(n) || n <= 0) {
        return '0,00 €';
    }

    return new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(n);
}

function formatDt(iso: string | null): string {
    if (!iso) {
        return '—';
    }

    try {
        return new Intl.DateTimeFormat('pt-PT', {
            dateStyle: 'short',
            timeStyle: 'short',
        }).format(new Date(iso));
    } catch {
        return iso;
    }
}

export default function BibliotecaContaPedidos({ pedidos }: Props) {
    return (
        <BibliotecaContaLayout title="Os meus pedidos" secao="pedidos">
            <h2 className="m-0 mb-[16px] text-[1.15rem] font-bold text-(--brotero-texto)">Pedidos ativos</h2>
            {pedidos.length === 0 ? (
                <p className="m-0 p-[16px] bg-(--brotero-branco) border border-dashed border-(--brotero-borda) rounded-(--raio) text-(--brotero-texto-cinza)">
                    Não tem requisições em curso. Explore o{' '}
                    <a href="/biblioteca" className="text-(--brotero-texto-link) hover:underline">
                        catálogo
                    </a>
                    .
                </p>
            ) : (
                <ul className="m-0 p-0 list-none flex flex-col gap-[12px]">
                    {pedidos.map((p) => (
                        <li
                            key={p.id}
                            className="flex flex-col gap-[12px] p-[16px] bg-(--brotero-branco) border border-(--brotero-borda) rounded-(--raio) sm:flex-row sm:items-center sm:gap-[16px]"
                        >
                            <div className="min-w-0 flex-1">
                                <p className="m-0 mb-[6px] text-[16px] font-bold text-(--brotero-texto)">
                                    {p.book_title}
                                </p>
                                <p className="m-0 mb-[4px] text-[13px] text-(--brotero-texto-cinza)">
                                    Tipo: {p.request_type === 'escola' ? 'Retirada na escola' : 'Cacifo'}
                                    {p.school_location ? ` · ${p.school_location}` : ''}
                                    {p.cacifo_code ? ` · Código ${p.cacifo_code}` : ''}
                                </p>
                                <p className="m-0 text-[13px] text-(--brotero-texto-cinza)">
                                    Levantar até: {formatDt(p.pickup_deadline)} · Devolução:{' '}
                                    {formatDt(p.return_deadline)}
                                </p>
                                <p className="m-0 mt-[8px] text-[13px] font-semibold text-(--brotero-texto)">
                                    Multa estimada: {formatEur(p.fine_amount)}
                                </p>
                            </div>
                            <div className="flex shrink-0 justify-center sm:justify-end sm:self-center">
                                <button
                                    type="button"
                                    className="px-[12px] py-[6px] text-[13px] font-semibold rounded-(--raio) border border-(--brotero-borda) bg-(--brotero-branco) text-(--brotero-texto) cursor-pointer hover:bg-[#f5f5f5] whitespace-nowrap"
                                    onClick={() => {
                                        if (
                                            !window.confirm(
                                                `Cancelar o pedido de «${p.book_title}»? O livro voltará a ficar disponível no catálogo.`,
                                            )
                                        ) {
                                            return;
                                        }

                                        router.delete(`/biblioteca/conta/pedidos/${p.id}`, {
                                            preserveScroll: true,
                                        });
                                    }}
                                >
                                    Cancelar pedido
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </BibliotecaContaLayout>
    );
}
