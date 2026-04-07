import { Link, router, usePage } from '@inertiajs/react';
import type { ReactElement } from 'react';
import { useMemo, useState } from 'react';
import { BibliotecaContaLayout } from '@/components/biblioteca/BibliotecaContaLayout';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Spinner } from '@/components/ui/spinner';
import { formatDt, formatEur } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { PedidoLeitor } from '@/types';

type Props = {
    pedidos: PedidoLeitor[];
};

function EstadoPedidoBadge({ status }: { status: string }) {
    const isPending = status === 'pending';

    return (
        <span
            className={cn(
                'inline-flex shrink-0 rounded-full px-[10px] py-[3px] text-[12px] font-semibold leading-tight',
                isPending
                    ? 'border border-amber-200 bg-amber-50 text-amber-950'
                    : 'border border-emerald-200 bg-emerald-50 text-emerald-900',
            )}
        >
            {isPending ? 'À aguardar aprovação' : 'Aprovado, em curso'}
        </span>
    );
}

export default function BibliotecaContaPedidos({ pedidos }: Props) {
    const { flash } = usePage().props;
    const [confirmPedido, setConfirmPedido] = useState<PedidoLeitor | null>(null);
    const [pendingId, setPendingId] = useState<number | null>(null);

    const isBusy = pendingId !== null;

    const { pendentes, ativos } = useMemo(() => {
        const p: PedidoLeitor[] = [];
        const a: PedidoLeitor[] = [];

        for (const item of pedidos) {
            if (item.status === 'pending') {
                p.push(item);
            } else if (item.status === 'created') {
                a.push(item);
            }
        }

        return { pendentes: p, ativos: a };
    }, [pedidos]);

    function handleConfirmCancel(): void {
        if (!confirmPedido) {
            return;
        }

        const id = confirmPedido.id;

        setPendingId(id);

        router.delete(`/biblioteca/conta/pedidos/${id}`, {
            preserveScroll: true,
            onFinish: () => {
                setPendingId(null);
                setConfirmPedido(null);
            },
        });
    }

    function renderPedidoCard(p: PedidoLeitor): ReactElement {
        const isPending = p.status === 'pending';

        return (
            <li
                key={p.id}
                className="flex flex-col gap-[12px] p-[16px] bg-(--brotero-branco) border border-(--brotero-borda) rounded-(--raio) sm:flex-row sm:items-center sm:gap-[16px]"
            >
                <div className="min-w-0 flex-1">
                    <p className="m-0 mb-[8px] flex flex-wrap items-center gap-2 text-[16px] font-bold text-(--brotero-texto)">
                        <span className="min-w-0">{p.book_title}</span>
                        <EstadoPedidoBadge status={p.status} />
                    </p>
                    <p className="m-0 mb-[4px] text-[13px] text-(--brotero-texto-cinza)">
                        Tipo: {p.request_type === 'escola' ? 'Retirada na escola' : 'Cacifo'}
                        {p.school_location ? ` · ${p.school_location}` : ''}
                        {!isPending && p.cacifo_code ? ` · Código ${p.cacifo_code}` : ''}
                    </p>
                    {p.patron_visible_note ? (
                        <p className="m-0 mt-[8px] border-l-2 border-(--brotero-primaria) pl-[10px] text-[13px] text-(--brotero-texto)">
                            <span className="font-semibold text-(--brotero-texto-cinza)">
                                Mensagem da biblioteca:{' '}
                            </span>
                            {p.patron_visible_note}
                        </p>
                    ) : null}
                    {isPending ? (
                        <p className="m-0 text-[13px] text-(--brotero-texto-cinza)">
                            A biblioteca irá validar o pedido. Assim que for aprovado, verá aqui o prazo de levantamento,
                            a devolução e eventuais instruções do cacifo.
                        </p>
                    ) : (
                        <>
                            <p className="m-0 text-[13px] text-(--brotero-texto-cinza)">
                                Levantar até: {formatDt(p.pickup_deadline)} · Devolução:{' '}
                                {formatDt(p.return_deadline)}
                            </p>
                            <p className="m-0 mt-[8px] text-[13px] font-semibold text-(--brotero-texto)">
                                Multa estimada: {formatEur(p.fine_amount)}
                            </p>
                        </>
                    )}
                </div>
                <div className="flex shrink-0 justify-center sm:justify-end sm:self-center">
                    <button
                        type="button"
                        className="px-[12px] py-[6px] text-[13px] font-semibold rounded-(--raio) border border-(--brotero-borda) bg-(--brotero-branco) text-(--brotero-texto) cursor-pointer hover:bg-(--brotero-laranja-hover) whitespace-nowrap disabled:cursor-not-allowed disabled:opacity-60"
                        disabled={isBusy}
                        onClick={() => setConfirmPedido(p)}
                    >
                        Cancelar pedido
                    </button>
                </div>
            </li>
        );
    }

    return (
        <BibliotecaContaLayout title="Os meus pedidos" secao="pedidos">
            {flash?.success ? (
                <p
                    className="m-0 mb-[12px] rounded-(--raio) border border-emerald-200 bg-emerald-50 px-[14px] py-[10px] text-[13px] text-emerald-900"
                    role="status"
                >
                    {flash.success}
                </p>
            ) : null}
            {flash?.error ? (
                <p
                    className="m-0 mb-[12px] rounded-(--raio) border border-red-200 bg-red-50 px-[14px] py-[10px] text-[13px] text-red-900"
                    role="alert"
                >
                    {flash.error}
                </p>
            ) : null}

            <h2 className="m-0 mb-[16px] text-[1.15rem] font-bold text-(--brotero-texto)">
                À aguardar aprovação
            </h2>
            {pendentes.length === 0 ? (
                <p className="m-0 mb-[28px] rounded-(--raio) border border-dashed border-(--brotero-borda) bg-(--brotero-branco) p-[16px] text-(--brotero-texto-cinza)">
                    Não tem pedidos pendentes de validação.
                </p>
            ) : (
                <ul className="m-0 mb-[28px] flex list-none flex-col gap-[12px] p-0">
                    {pendentes.map(renderPedidoCard)}
                </ul>
            )}

            <h2 className="m-0 mb-[16px] text-[1.15rem] font-bold text-(--brotero-texto)">Pedidos ativos</h2>
            {ativos.length === 0 ? (
                <p className="m-0 p-[16px] bg-(--brotero-branco) border border-dashed border-(--brotero-borda) rounded-(--raio) text-(--brotero-texto-cinza)">
                    Não tem requisições em curso. Explore o{' '}
                    <Link href="/biblioteca" className="text-(--brotero-texto-link) hover:underline">
                        catálogo
                    </Link>
                    .
                </p>
            ) : (
                <ul className="m-0 p-0 list-none flex flex-col gap-[12px]">{ativos.map(renderPedidoCard)}</ul>
            )}

            <Dialog
                open={confirmPedido !== null}
                onOpenChange={(open) => {
                    if (!open && !isBusy) {
                        setConfirmPedido(null);
                    }
                }}
            >
                <DialogContent className="border-(--brotero-borda) bg-(--brotero-branco) text-(--brotero-texto) sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-(--brotero-texto)">Cancelar pedido</DialogTitle>
                        <DialogDescription className="text-(--brotero-texto-cinza)">
                            {confirmPedido ? (
                                <>
                                    Cancelar o pedido de «{confirmPedido.book_title}»? O livro voltará a ficar
                                    disponível no catálogo.
                                </>
                            ) : null}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-2">
                        <button
                            type="button"
                            className="px-[12px] py-[6px] text-[13px] font-semibold rounded-(--raio) border border-(--brotero-borda) bg-(--brotero-branco) text-(--brotero-texto) cursor-pointer hover:bg-(--brotero-laranja-hover) disabled:cursor-not-allowed disabled:opacity-60"
                            disabled={isBusy}
                            onClick={() => setConfirmPedido(null)}
                        >
                            Voltar
                        </button>
                        <button
                            type="button"
                            className="inline-flex items-center justify-center gap-2 px-[12px] py-[6px] text-[13px] font-semibold rounded-(--raio) border border-(--brotero-primaria) bg-(--brotero-primaria) text-white cursor-pointer hover:bg-(--brotero-primaria-escuro) disabled:cursor-not-allowed disabled:opacity-60"
                            disabled={isBusy}
                            onClick={handleConfirmCancel}
                        >
                            {isBusy ? (
                                <>
                                    <Spinner className="size-4 text-white" aria-hidden />
                                    <span>A cancelar…</span>
                                </>
                            ) : (
                                'Confirmar cancelamento'
                            )}
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </BibliotecaContaLayout>
    );
}
