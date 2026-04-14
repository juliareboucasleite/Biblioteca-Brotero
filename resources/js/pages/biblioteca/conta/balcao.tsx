import type { RequestPayload } from '@inertiajs/core';
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

/** Campos e botões dos modais: evita `bg-background` / `muted-foreground` do tema a ficarem ilegíveis no Brotero. */
const balcaoModalFieldClass =
    'w-full rounded-(--raio) border border-(--brotero-borda) bg-(--brotero-branco) px-3 py-2.5 text-[14px] leading-normal text-(--brotero-texto) placeholder:text-(--brotero-texto-cinza) shadow-none focus:border-(--brotero-primaria) focus:outline-none focus:ring-2 focus:ring-(--brotero-primaria)/35';

const balcaoModalBtnSecondaryClass =
    'rounded-md border border-(--brotero-borda) bg-(--brotero-branco) px-3 py-2 text-sm font-semibold text-(--brotero-texto) hover:bg-(--brotero-fundo)';

const balcaoDialogContentClass =
    'border-(--brotero-borda) bg-(--brotero-branco) text-(--brotero-texto) sm:max-w-md [&>button.absolute]:text-(--brotero-texto) [&>label]:text-(--brotero-texto)';

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

/** Pedidos pendentes ou activos não podem ser ocultados do balcão. */
function podeOcultarDoBalcao(status: string): boolean {
    return status !== 'pending' && status !== 'created';
}

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
    const [hideRow, setHideRow] = useState<DeskPedido | null>(null);
    const [cancelRow, setCancelRow] = useState<DeskPedido | null>(null);
    const [returnRow, setReturnRow] = useState<DeskPedido | null>(null);

    const rejectForm = useForm({ reason: '' });
    const noteForm = useForm({ patron_visible_note: '' });
    const fineForm = useForm({ fine_amount: '' });

    function baseUrl(id: number, action: string): string {
        return `/biblioteca/conta/balcao/pedidos/${id}/${action}`;
    }

    function postAction(id: number, action: string, data?: RequestPayload): void {
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

    function submitHide(): void {
        if (hideRow === null) {
            return;
        }

        setBusyId(hideRow.id);
        router.post(baseUrl(hideRow.id, 'ocultar'), {}, {
            preserveScroll: true,
            onFinish: () => {
                setBusyId(null);
                setHideRow(null);
            },
        });
    }

    function submitCancel(): void {
        if (cancelRow === null) {
            return;
        }

        setBusyId(cancelRow.id);
        router.post(baseUrl(cancelRow.id, 'cancelar'), {}, {
            preserveScroll: true,
            onFinish: () => {
                setBusyId(null);
                setCancelRow(null);
            },
        });
    }

    function submitReturn(): void {
        if (returnRow === null) {
            return;
        }

        setBusyId(returnRow.id);
        router.post(baseUrl(returnRow.id, 'devolver'), {}, {
            preserveScroll: true,
            onFinish: () => {
                setBusyId(null);
                setReturnRow(null);
            },
        });
    }

    const rejectOpen = rejectId !== null;
    const rejectBusy = rejectForm.processing;
    const hideOpen = hideRow !== null;
    const hideBusy = hideRow !== null && busyId === hideRow.id;
    const cancelOpen = cancelRow !== null;
    const cancelBusy = cancelRow !== null && busyId === cancelRow.id;
    const returnOpen = returnRow !== null;
    const returnBusy = returnRow !== null && busyId === returnRow.id;

    return (
        <BibliotecaContaLayout title="Balcão · todos os pedidos" secao="balcao">
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
                Requisições <strong>devolvidas</strong> deixam de aparecer aqui automaticamente ao fim de{' '}
                <strong>30 dias</strong> após a data de devolução. Em pedidos concluídos pode usar{' '}
                <strong>Ocultar</strong> para os retirar da lista de imediato (permanecem no histórico do aluno).
            </p>

            {pedidos.length === 0 ? (
                <p className="rounded-(--raio) border border-dashed border-(--brotero-borda) bg-(--brotero-branco) p-[16px] text-(--brotero-texto-cinza)">
                    Este painel apresenta todas as requisições para gestão. A lista é atualizada em tempo real.
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
                                {p.status === 'returned' && p.returned_at ? (
                                    <> · Devolvido: {formatDt(p.returned_at)}</>
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
                                        onClick={() => setCancelRow(p)}
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
                                            onClick={() => setReturnRow(p)}
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
                                {podeOcultarDoBalcao(p.status) ? (
                                    <button
                                        type="button"
                                        disabled={busy}
                                        className="rounded-(--raio) border border-(--brotero-borda) bg-(--brotero-fundo) px-[10px] py-[6px] text-[12px] font-semibold text-(--brotero-texto-cinza) disabled:opacity-50"
                                        title="Retira este pedido da lista do balcão (o aluno continua a ver no histórico)"
                                        onClick={() => setHideRow(p)}
                                    >
                                        Ocultar
                                    </button>
                                ) : null}
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
                <DialogContent className={balcaoDialogContentClass}>
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-(--brotero-texto)">Recusar pedido</DialogTitle>
                        <DialogDescription className="text-[14px] leading-relaxed text-(--brotero-texto-cinza)">
                            Motivo opcional: pode aparecer no histórico do aluno.
                        </DialogDescription>
                    </DialogHeader>
                    <textarea
                        className={`${balcaoModalFieldClass} min-h-[96px]`}
                        value={rejectForm.data.reason}
                        onChange={(e) => rejectForm.setData('reason', e.target.value)}
                    />
                    {rejectForm.errors.reason ? (
                        <p className="m-0 text-[13px] font-medium text-red-700">{rejectForm.errors.reason}</p>
                    ) : null}
                    <DialogFooter className="gap-2">
                        <button
                            type="button"
                            className={balcaoModalBtnSecondaryClass}
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
                <DialogContent className={balcaoDialogContentClass}>
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-(--brotero-texto)">Nota visível ao aluno</DialogTitle>
                        <DialogDescription className="text-[14px] leading-relaxed text-(--brotero-texto-cinza)">
                            Aparece em «Os meus pedidos» e no histórico. Deixe vazio para apagar.
                        </DialogDescription>
                    </DialogHeader>
                    <textarea
                        className={`${balcaoModalFieldClass} min-h-[128px]`}
                        value={noteForm.data.patron_visible_note}
                        onChange={(e) => noteForm.setData('patron_visible_note', e.target.value)}
                    />
                    {noteForm.errors.patron_visible_note ? (
                        <p className="m-0 text-[13px] font-medium text-red-700">
                            {noteForm.errors.patron_visible_note}
                        </p>
                    ) : null}
                    <DialogFooter className="gap-2">
                        <button
                            type="button"
                            className={balcaoModalBtnSecondaryClass}
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
                <DialogContent className={balcaoDialogContentClass}>
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-(--brotero-texto)">Multa manual (EUR)</DialogTitle>
                        <DialogDescription className="text-[14px] leading-relaxed text-(--brotero-texto-cinza)">
                            Só em requisições ativas. Use «Recalc. multa» para 0,50 € por dia de atraso.
                        </DialogDescription>
                    </DialogHeader>
                    <input
                        type="text"
                        inputMode="decimal"
                        className={balcaoModalFieldClass}
                        value={fineForm.data.fine_amount}
                        onChange={(e) => fineForm.setData('fine_amount', e.target.value)}
                    />
                    {fineForm.errors.fine_amount ? (
                        <p className="m-0 text-[13px] font-medium text-red-700">{fineForm.errors.fine_amount}</p>
                    ) : null}
                    <DialogFooter className="gap-2">
                        <button
                            type="button"
                            className={balcaoModalBtnSecondaryClass}
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

            <Dialog
                open={hideOpen}
                onOpenChange={(open) => {
                    if (!open && !hideBusy) {
                        setHideRow(null);
                    }
                }}
            >
                <DialogContent className={balcaoDialogContentClass}>
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-(--brotero-texto)">Ocultar do balcão</DialogTitle>
                        <DialogDescription className="text-[14px] leading-relaxed text-(--brotero-texto-cinza)">
                            Este pedido deixa de aparecer nesta lista. O aluno mantém o registo em «Histórico» e em «Os meus
                            pedidos» quando aplicável.
                        </DialogDescription>
                    </DialogHeader>
                    {hideRow ? (
                        <p className="m-0 rounded-md border border-(--brotero-borda) bg-(--brotero-fundo) px-3 py-2 text-sm text-(--brotero-texto)">
                            <span className="font-semibold">{hideRow.book_title}</span>
                            <span className="text-(--brotero-texto-cinza)">
                                {' '}
                                · #{hideRow.id} · Cartão {hideRow.card_number}
                            </span>
                        </p>
                    ) : null}
                    <DialogFooter className="gap-2">
                        <button
                            type="button"
                            className={balcaoModalBtnSecondaryClass}
                            disabled={hideBusy}
                            onClick={() => setHideRow(null)}
                        >
                            Cancelar
                        </button>
                        <button
                            type="button"
                            className="rounded-md bg-(--brotero-texto-cinza) px-3 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
                            disabled={hideBusy}
                            onClick={submitHide}
                        >
                            {hideBusy ? (
                                <span className="inline-flex items-center gap-2">
                                    <Spinner className="size-4" aria-hidden />
                                    A ocultar…
                                </span>
                            ) : (
                                'Ocultar'
                            )}
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog
                open={cancelOpen}
                onOpenChange={(open) => {
                    if (!open && !cancelBusy) {
                        setCancelRow(null);
                    }
                }}
            >
                <DialogContent className={balcaoDialogContentClass}>
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-(--brotero-texto)">Cancelar pedido</DialogTitle>
                        <DialogDescription className="text-[14px] leading-relaxed text-(--brotero-texto-cinza)">
                            O livro volta ao catálogo se a requisição estiver ativa. Esta ação não pode ser desfeita aqui.
                        </DialogDescription>
                    </DialogHeader>
                    {cancelRow ? (
                        <p className="m-0 rounded-md border border-(--brotero-borda) bg-(--brotero-fundo) px-3 py-2 text-sm text-(--brotero-texto)">
                            <span className="font-semibold">{cancelRow.book_title}</span>
                            <span className="text-(--brotero-texto-cinza)">
                                {' '}
                                · #{cancelRow.id} · Cartão {cancelRow.card_number}
                            </span>
                        </p>
                    ) : null}
                    <DialogFooter className="gap-2">
                        <button
                            type="button"
                            className={balcaoModalBtnSecondaryClass}
                            disabled={cancelBusy}
                            onClick={() => setCancelRow(null)}
                        >
                            Não
                        </button>
                        <button
                            type="button"
                            className="rounded-md border border-red-300 bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                            disabled={cancelBusy}
                            onClick={submitCancel}
                        >
                            {cancelBusy ? (
                                <span className="inline-flex items-center gap-2">
                                    <Spinner className="size-4" aria-hidden />
                                    A cancelar…
                                </span>
                            ) : (
                                'Sim, cancelar pedido'
                            )}
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog
                open={returnOpen}
                onOpenChange={(open) => {
                    if (!open && !returnBusy) {
                        setReturnRow(null);
                    }
                }}
            >
                <DialogContent className={balcaoDialogContentClass}>
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-(--brotero-texto)">Marcar como devolvido</DialogTitle>
                        <DialogDescription className="text-[14px] leading-relaxed text-(--brotero-texto-cinza)">
                            Confirma que o exemplar foi entregue na biblioteca? O registo ficará como devolvido e o livro pode
                            voltar a ser requisitado.
                        </DialogDescription>
                    </DialogHeader>
                    {returnRow ? (
                        <p className="m-0 rounded-md border border-(--brotero-borda) bg-(--brotero-fundo) px-3 py-2 text-sm text-(--brotero-texto)">
                            <span className="font-semibold">{returnRow.book_title}</span>
                            <span className="text-(--brotero-texto-cinza)">
                                {' '}
                                · #{returnRow.id} · Cartão {returnRow.card_number}
                            </span>
                        </p>
                    ) : null}
                    <DialogFooter className="gap-2">
                        <button
                            type="button"
                            className={balcaoModalBtnSecondaryClass}
                            disabled={returnBusy}
                            onClick={() => setReturnRow(null)}
                        >
                            Voltar
                        </button>
                        <button
                            type="button"
                            className="rounded-md border border-emerald-800 bg-emerald-700 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-50"
                            disabled={returnBusy}
                            onClick={submitReturn}
                        >
                            {returnBusy ? (
                                <span className="inline-flex items-center gap-2">
                                    <Spinner className="size-4" aria-hidden />
                                    A registar…
                                </span>
                            ) : (
                                'Confirmar devolução'
                            )}
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </BibliotecaContaLayout>
    );
}
