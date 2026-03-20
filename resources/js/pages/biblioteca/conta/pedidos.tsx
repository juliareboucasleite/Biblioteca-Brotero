import { BibliotecaContaLayout } from '@/components/biblioteca/BibliotecaContaLayout';
import type { PedidoLeitor } from '@/types';

type Props = {
    pedidos: PedidoLeitor[];
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
                            className="p-[16px] bg-(--brotero-branco) border border-(--brotero-borda) rounded-(--raio)"
                        >
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
                        </li>
                    ))}
                </ul>
            )}
        </BibliotecaContaLayout>
    );
}
