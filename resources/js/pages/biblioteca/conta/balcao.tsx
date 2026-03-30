import { router, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
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

type DeskPedido = {
    id: number;
    book_id: number | null;
    book_title: string;
    isbn: string | null;
    card_number: string;
    request_type: string;
    school_location: string | null;
    cacifo_code: string | null;
    status: string;
    pickup_deadline: string | null;
    return_deadline: string | null;
    returned_at: string | null;
    created_at: string | null;
    fine_amount: string;
    staff_rejection_reason: string | null;
    patron_visible_note: string | null;
    patron_registered: boolean;
};

type Props = {
    pedidos: DeskPedido[];
};

function estadoLabel(status: string): string {
    switch (status) {
        case 'pending':
            return 'Pendente';
        case 'created':
            return 'Ativo';
        case 'rejected':
            return 'Recusado';
        case 'cancelled':
            return 'Cancelado';
        case 'expired':
            return 'Expirado';
        case 'returned':
            return 'Devolvido';
        default:
            return status;
    }
}

function EstadoBadge({ status }: { status: string }) {
    const label = estadoLabel(status);
    const variantClass =
        status === 'pending'
            ? 'border-amber-200 bg-amber-50 text-amber-950'
            : status === 'created'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
              : status === 'rejected'
                ? 'border-red-200 bg-red-50 text-red-900'
                : 'border-(--brotero-borda) bg-(--brotero-fundo) text-(--brotero-texto)';

    return (
        <span
            className={cn(
                'inline-flex shrink-0 rounded-full border px-[8px] py-[2px] text-[11px] font-semibold',
                variantClass,
            )}
        >
            {label}
        </span>
    );
}

export default function BibliotecaContaBalcao({ pedidos }: Props) {
    const { flash } = usePage().props;
    const [busyId, setBusyId] = useState<number | null>(null);
    const [rejectId, setRejectId] = useState<number | null>(null);
    const [noteRow, setNoteRow] = useState<DeskPedido | null>(null);
    const [fineRow, setFineRow] = useState<DeskPedido | null>(null);

    const rejectForm = useForm({ reason: '' });
    const noteForm = useForm({ patron_visible_note: '' });
    const fineForm = useForm({ fine_amount: '' });

    function baseUrl(id: number, action: string): string {
        return `/biblioteca/conta/balcao/pedidos/${id}/${action}`;
    }

    function postAction(id: number, action: string, data?: Record<string, unknown>): void {
        setBusyId(id);
        router.post(baseUrl(id, action), data ?? {}, {
            preserveScroll: true,
            onFinish: () => setBusyId(null),
        });
    }

    function openReject(p: DeskPedido): void {
        setRejectId(p.id);
        rejectForm.setData('reason', '');
        rejectForm.clearErrors();
    }

    function submitReject(): void {
        if (rejectId === null) {
            return;
        }

        setBusyId(rejectId);
        rejectForm.post(baseUrl(rejectId, 'recusar'), {
            preserveScroll: true,
            onFinish: () => {
                setBusyId(null);
                setRejectId(null);
            },
        });
    }

    function openNote(p: DeskPedido): void {
        setNoteRow(p);
        noteForm.setData('patron_visible_note', p.patron_visible_note ?? '');
        noteForm.clearErrors();
    }

    function submitNote(): void {
        if (!noteRow) {
            return;
        }

        setBusyId(noteRow.id);
        noteForm.post(baseUrl(noteRow.id, 'nota'), {
            preserveScroll: true,
            onFinish: () => {
                setBusyId(null);
                setNoteRow(null);
            },
        });
    }

    function openFine(p: DeskPedido): void {
        setFineRow(p);
        fineForm.setData('fine_amount', p.fine_amount ?? '0');
        fineForm.clearErrors();
    }

    function submitFine(): void {
        if (!fineRow) {
            return;
        }

        setBusyId(fineRow.id);
        fineForm.post(baseUrl(fineRow.id, 'multa'), {
            preserveScroll: true,
            onFinish: () => {
                setBusyId(null);
                setFineRow(null);
            },
        });
    }

    const rejectOpen = rejectId !== null;
    const rejectBusy = rejectForm.processing;

    return (
        <BibliotecaContaLayout title="Balcão — todos os pedidos" secao="balcao">
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

            <p className="m-0 mb-[16px] text-[14px] text-(--brotero-texto-cinza)">
                Gerir requisições de todos os cartões. As notas são visíveis ao aluno em «Os meus pedidos» e no histórico.
            </p>

            {pedidos.length === 0 ? (
                <p className="rounded-(--raio) border border-dashed border-(--brotero-borda) bg-(--brotero-branco) p-[16px] text-(--brotero-texto-cinza)">
                    Ainda não há pedidos registados.
                </p>
            ) : null}

            <div className="flex flex-col gap-[14px]">
                {pedidos.map((p) => {
                    const busy = busyId === p.id;
                    const escola = p.request_type === 'escola';

                    return (
                        <div
                            key={p.id}
                            className="rounded-(--raio) border border-(--brotero-borda) bg-(--brotero-branco) p-[14px] shadow-sm"
                        >
                            <div className="mb-[10px] flex flex-wrap items-start justify-between gap-2">
                                <div className="min-w-0 flex-1">
                                    <p className="m-0 text-[15px] font-bold text-(--brotero-texto)">{p.book_title}</p>
                                    <p className="m-0 mt-[4px] text-[12px] text-(--brotero-texto-cinza)">
                                        #{p.id} · Cartão{' '}
                                        <span className="font-mono font-semibold">{p.card_number}</span>
                                        {!p.patron_registered ? (
                                            <span className="ml-2 rounded bg-amber-100 px-[6px] py-[2px] text-[11px] font-semibold text-amber-900">
                                                Leitor não registado
                                            </span>
                                        ) : null}
                                    </p>
                                </div>
                                <EstadoBadge status={p.status} />
                            </div>
                            <p className="m-0 mb-[8px] text-[13px] text-(--brotero-texto-cinza)">
                                {escola ? 'Escola' : 'Cacifo'}
                                {p.school_location ? ` · ${p.school_location}` : ''}
                                {p.cacifo_code ? ` · Código ${p.cacifo_code}` : ''}
                                {p.isbn ? ` · ISBN ${p.isbn}` : ''}
                            </p>
                            <p className="m-0 mb-[8px] text-[13px] text-(--brotero-texto-cinza)">
                                Pedido: {formatDt(p.created_at)}
                                {p.status === 'created' ? (
                                    <>
                                        {' '}
                                        · Levantar: {formatDt(p.pickup_deadline)} · Devolução:{' '}
                                        {formatDt(p.return_deadline)}
                                    </>
                                ) : null}
                            </p>
                            <p className="m-0 mb-[10px] text-[13px] font-semibold text-(--brotero-texto)">
                                Multa: {formatEur(p.fine_amount)}
                            </p>
                            {p.patron_visible_note ? (
                                <p className="m-0 mb-[10px] border-l-2 border-(--brotero-primaria) pl-[8px] text-[12px] text-(--brotero-texto)">
                                    <span className="font-semibold text-(--brotero-texto-cinza)">Nota ao aluno: </span>
                                    {p.patron_visible_note}
                                </p>
                            ) : null}

                            <div className="flex flex-wrap gap-[8px]">
                                {p.status === 'pending' ? (
                                    <>
                                        <button
                                            type="button"
                                            disabled={busy || !p.patron_registered}
                                            title={
                                                !p.patron_registered
                                                    ? 'Registe o leitor antes de aprovar.'
                                                    : undefined
                                            }
                                            className="rounded-(--raio) border border-(--brotero-primaria) bg-(--brotero-primaria) px-[10px] py-[6px] text-[12px] font-semibold text-white disabled:opacity-50"
                                            onClick={() => postAction(p.id, 'aprovar')}
                                        >
                                            {busy ? '…' : 'Aprovar'}
                                        </button>
                                        <button
                                            type="button"
                                            disabled={busy}
                                            className="rounded-(--raio) border border-(--brotero-borda) bg-(--brotero-branco) px-[10px] py-[6px] text-[12px] font-semibold disabled:opacity-50"
                                            onClick={() => openReject(p)}
                                        >
                                            Recusar
                                        </button>
                                    </>
                                ) : null}
                                {p.status === 'pending' || p.status === 'created' ? (
                                    <button
                                        type="button"
                                        disabled={busy}
                                        className="rounded-(--raio) border border-red-200 bg-red-50 px-[10px] py-[6px] text-[12px] font-semibold text-red-900 disabled:opacity-50"
                                        onClick={() => {
                                            if (confirm('Cancelar este pedido? O livro volta ao catálogo se estiver ativo.')) {
                                                postAction(p.id, 'cancelar');
                                            }
                                        }}
                                    >
                                        Cancelar
                                    </button>
                                ) : null}
                                {p.status === 'created' && !p.returned_at ? (
                                    <>
                                        <button
                                            type="button"
                                            disabled={busy}
                                            className="rounded-(--raio) border border-(--brotero-borda) bg-(--brotero-branco) px-[10px] py-[6px] text-[12px] font-semibold disabled:opacity-50"
                                            onClick={() => openFine(p)}
                                        >
                                            Multa (€)
                                        </button>
                                        <button
                                            type="button"
                                            disabled={busy}
                                            className="rounded-(--raio) border border-(--brotero-borda) bg-(--brotero-branco) px-[10px] py-[6px] text-[12px] font-semibold disabled:opacity-50"
                                            onClick={() => postAction(p.id, 'recalcular-multa')}
                                        >
                                            Recalc. multa
                                        </button>
                                        <button
                                            type="button"
                                            disabled={busy}
                                            className="rounded-(--raio) border border-emerald-700 bg-emerald-700 px-[10px] py-[6px] text-[12px] font-semibold text-white disabled:opacity-50"
                                            onClick={() => {
                                                if (confirm('Marcar livro como devolvido?')) {
                                                    postAction(p.id, 'devolver');
                                                }
                                            }}
                                        >
                                            Devolvido
                                        </button>
                                    </>
                                ) : null}
                                <button
                                    type="button"
                                    disabled={busy}
                                    className="rounded-(--raio) border border-(--brotero-borda) bg-(--brotero-branco) px-[10px] py-[6px] text-[12px] font-semibold disabled:opacity-50"
                                    onClick={() => openNote(p)}
                                >
                                    Nota ao aluno
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            <Dialog
                open={rejectOpen}
                onOpenChange={(open) => {
                    if (!open && !rejectBusy) {
                        setRejectId(null);
                    }
                }}
            >
                <DialogContent className="border-(--brotero-borda) bg-(--brotero-branco) sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Recusar pedido</DialogTitle>
                        <DialogDescription>Motivo opcional — pode aparecer no histórico do aluno.</DialogDescription>
                    </DialogHeader>
                    <textarea
                        className="border-input bg-background min-h-[96px] w-full rounded-md border px-3 py-2 text-sm"
                        value={rejectForm.data.reason}
                        onChange={(e) => rejectForm.setData('reason', e.target.value)}
                    />
                    {rejectForm.errors.reason ? (
                        <p className="text-destructive text-xs">{rejectForm.errors.reason}</p>
                    ) : null}
                    <DialogFooter className="gap-2">
                        <button
                            type="button"
                            className="rounded-md border px-3 py-2 text-sm"
                            disabled={rejectBusy}
                            onClick={() => setRejectId(null)}
                        >
                            Voltar
                        </button>
                        <button
                            type="button"
                            className="rounded-md bg-(--brotero-primaria) px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
                            disabled={rejectBusy}
                            onClick={submitReject}
                        >
                            {rejectBusy ? (
                                <span className="inline-flex items-center gap-2">
                                    <Spinner className="size-4" aria-hidden />
                                    A enviar…
                                </span>
                            ) : (
                                'Confirmar recusa'
                            )}
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog
                open={noteRow !== null}
                onOpenChange={(open) => {
                    if (!open && !noteForm.processing) {
                        setNoteRow(null);
                    }
                }}
            >
                <DialogContent className="border-(--brotero-borda) bg-(--brotero-branco) sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Nota visível ao aluno</DialogTitle>
                        <DialogDescription>
                            Aparece em «Os meus pedidos» e no histórico. Deixe vazio para apagar.
                        </DialogDescription>
                    </DialogHeader>
                    <textarea
                        className="border-input bg-background min-h-[120px] w-full rounded-md border px-3 py-2 text-sm"
                        value={noteForm.data.patron_visible_note}
                        onChange={(e) => noteForm.setData('patron_visible_note', e.target.value)}
                    />
                    {noteForm.errors.patron_visible_note ? (
                        <p className="text-destructive text-xs">{noteForm.errors.patron_visible_note}</p>
                    ) : null}
                    <DialogFooter className="gap-2">
                        <button
                            type="button"
                            className="rounded-md border px-3 py-2 text-sm"
                            disabled={noteForm.processing}
                            onClick={() => setNoteRow(null)}
                        >
                            Voltar
                        </button>
                        <button
                            type="button"
                            className="rounded-md bg-(--brotero-primaria) px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
                            disabled={noteForm.processing}
                            onClick={submitNote}
                        >
                            {noteForm.processing ? 'A guardar…' : 'Guardar'}
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog
                open={fineRow !== null}
                onOpenChange={(open) => {
                    if (!open && !fineForm.processing) {
                        setFineRow(null);
                    }
                }}
            >
                <DialogContent className="border-(--brotero-borda) bg-(--brotero-branco) sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Multa manual (EUR)</DialogTitle>
                        <DialogDescription>
                            Só em requisições ativas. Use «Recalc. multa» para 0,50 € por dia de atraso.
                        </DialogDescription>
                    </DialogHeader>
                    <input
                        type="text"
                        inputMode="decimal"
                        className="border-input bg-background w-full rounded-md border px-3 py-2 text-sm"
                        value={fineForm.data.fine_amount}
                        onChange={(e) => fineForm.setData('fine_amount', e.target.value)}
                    />
                    {fineForm.errors.fine_amount ? (
                        <p className="text-destructive text-xs">{fineForm.errors.fine_amount}</p>
                    ) : null}
                    <DialogFooter className="gap-2">
                        <button
                            type="button"
                            className="rounded-md border px-3 py-2 text-sm"
                            disabled={fineForm.processing}
                            onClick={() => setFineRow(null)}
                        >
                            Voltar
                        </button>
                        <button
                            type="button"
                            className="rounded-md bg-(--brotero-primaria) px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
                            disabled={fineForm.processing}
                            onClick={submitFine}
                        >
                            {fineForm.processing ? 'A guardar…' : 'Guardar'}
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </BibliotecaContaLayout>
    );
}
