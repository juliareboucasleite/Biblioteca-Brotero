import { BibliotecaContaLayout } from '@/components/biblioteca/BibliotecaContaLayout';
import type { PedidoLeitor } from '@/types';

type Props = {
    historico: PedidoLeitor[];
};

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

function estadoLabel(status: string): string {
    switch (status) {
        case 'returned':
            return 'Devolvido';
        case 'expired':
            return 'Expirado / encerrado';
        default:
            return status;
    }
}

export default function BibliotecaContaHistorico({ historico }: Props) {
    return (
        <BibliotecaContaLayout title="Histórico de requisições" secao="historico">
            <h2 className="m-0 mb-[16px] text-[1.15rem] font-bold text-(--brotero-texto)">
                Histórico de requisições
            </h2>
            {historico.length === 0 ? (
                <p className="m-0 p-[16px] bg-(--brotero-branco) border border-dashed border-(--brotero-borda) rounded-(--raio) text-(--brotero-texto-cinza)">
                    Ainda não há pedidos concluídos ou expirados associados ao seu cartão.
                </p>
            ) : (
                <ul className="m-0 p-0 list-none flex flex-col gap-[12px]">
                    {historico.map((p) => (
                        <li
                            key={p.id}
                            className="p-[16px] bg-(--brotero-branco) border border-(--brotero-borda) rounded-(--raio)"
                        >
                            <p className="m-0 mb-[6px] text-[16px] font-bold text-(--brotero-texto)">
                                {p.book_title}{' '}
                                <span className="text-[13px] font-semibold text-(--brotero-texto-cinza)">
                                    ({estadoLabel(p.status)})
                                </span>
                            </p>
                            <p className="m-0 text-[13px] text-(--brotero-texto-cinza)">
                                Pedido: {formatDt(p.created_at)}
                                {p.returned_at ? ` · Devolvido: ${formatDt(p.returned_at)}` : ''}
                            </p>
                        </li>
                    ))}
                </ul>
            )}
        </BibliotecaContaLayout>
    );
}
