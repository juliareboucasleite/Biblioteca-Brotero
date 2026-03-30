import { BibliotecaContaLayout } from '@/components/biblioteca/BibliotecaContaLayout';
import { formatDt } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { PedidoLeitor } from '@/types';

type Props = {
    historico: PedidoLeitor[];
};

type HistoricoStatus = 'returned' | 'expired' | 'cancelled' | 'rejected';

function estadoLabel(status: string): string {
    switch (status as HistoricoStatus) {
        case 'returned':
            return 'Devolvido';
        case 'expired':
            return 'Expirado / encerrado';
        case 'cancelled':
            return 'Cancelado por si';
        case 'rejected':
            return 'Recusado pela biblioteca';
        default: {
            return status;
        }
    }
}

function EstadoBadge({ status }: { status: string }) {
    const label = estadoLabel(status);

    const variantClass =
        status === 'returned'
            ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
            : status === 'expired'
              ? 'bg-amber-50 text-amber-900 border border-amber-200'
              : status === 'cancelled'
                ? 'bg-(--brotero-fundo) text-(--brotero-texto) border border-(--brotero-borda)'
                : status === 'rejected'
                  ? 'bg-red-50 text-red-900 border border-red-200'
                  : 'bg-neutral-100 text-neutral-800 border border-neutral-200';

    return (
        <span
            className={cn(
                'inline-flex shrink-0 items-center rounded-full px-[10px] py-[3px] text-[12px] font-semibold leading-tight',
                variantClass,
            )}
        >
            {label}
        </span>
    );
}

export default function BibliotecaContaHistorico({ historico }: Props) {
    return (
        <BibliotecaContaLayout title="Histórico de requisições" secao="historico">
            <h2 className="m-0 mb-[16px] text-[1.15rem] font-bold text-(--brotero-texto)">
                Histórico de requisições
            </h2>
            {historico.length === 0 ? (
                <p className="m-0 p-[16px] bg-(--brotero-branco) border border-dashed border-(--brotero-borda) rounded-(--raio) text-(--brotero-texto-cinza)">
                    Ainda não há pedidos concluídos, cancelados, recusados ou expirados associados ao seu cartão.
                </p>
            ) : (
                <ul className="m-0 p-0 list-none flex flex-col gap-[12px]">
                    {historico.map((p) => (
                        <li
                            key={p.id}
                            className="p-[16px] bg-(--brotero-branco) border border-(--brotero-borda) rounded-(--raio)"
                        >
                            <p className="m-0 mb-[8px] flex flex-wrap items-center gap-x-2 gap-y-1 text-[16px] font-bold text-(--brotero-texto)">
                                <span className="min-w-0">{p.book_title}</span>
                                <EstadoBadge status={p.status} />
                            </p>
                            <p className="m-0 text-[13px] text-(--brotero-texto-cinza)">
                                Pedido: {formatDt(p.created_at)}
                                {p.returned_at ? ` · Devolvido: ${formatDt(p.returned_at)}` : ''}
                            </p>
                            {p.status === 'rejected' && p.staff_rejection_reason ? (
                                <p className="m-0 mt-[8px] border-l-2 border-red-200 pl-[10px] text-[13px] text-(--brotero-texto)">
                                    <span className="font-semibold text-(--brotero-texto-cinza)">Motivo: </span>
                                    {p.staff_rejection_reason}
                                </p>
                            ) : null}
                        </li>
                    ))}
                </ul>
            )}
        </BibliotecaContaLayout>
    );
}
