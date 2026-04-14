import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Spinner } from '@/components/ui/spinner';
import AppLayout from '@/layouts/app-layout';
import { formatDt } from '@/lib/format';
import staffPatrons from '@/routes/staff/patrons';
import staffPedidos from '@/routes/staff/pedidos';

type StaffPedidoRow = {
    id: number;
    book_id: number;
    book_title: string;
    isbn: string | null;
    card_number: string;
    request_type: string;
    school_location: string | null;
    created_at: string | null;
    patron_registered: boolean;
};

type Props = {
    pedidos: StaffPedidoRow[];
};

function tipoRetiradaLabel(requestType: string): string {
    switch (requestType) {
        case 'escola':
            return 'Retirada na escola';
        case 'cacifo':
            return 'Cacifo';
        default:
            return requestType;
    }
}

function PatronRegisterBlock({ pedidoId, cardNumber }: { pedidoId: number; cardNumber: string }) {
    const form = useForm({
        card_number: cardNumber,
        birth_date: '',
        name: '',
        email: '',
        is_librarian: false,
    });

    return (
        <div className="rounded-md border border-amber-200/80 bg-amber-50/60 p-4">
            <p className="mb-3 text-sm font-medium text-amber-950">
                Registar leitor ({cardNumber})
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1 sm:col-span-2">
                    <label className="text-sm font-medium" htmlFor={`cn-${pedidoId}`}>
                        Cartão (5 dígitos)
                    </label>
                    <input
                        id={`cn-${pedidoId}`}
                        className="border-input bg-background w-full rounded-md border px-3 py-2 text-sm"
                        inputMode="numeric"
                        value={form.data.card_number}
                        onChange={(e) =>
                            form.setData('card_number', e.target.value.replace(/\D/g, '').slice(0, 5))
                        }
                    />
                    {form.errors.card_number ? (
                        <p className="text-destructive text-xs">{form.errors.card_number}</p>
                    ) : null}
                </div>
                <div className="space-y-1">
                    <label className="text-sm font-medium" htmlFor={`bd-${pedidoId}`}>
                        Data de nascimento
                    </label>
                    <input
                        id={`bd-${pedidoId}`}
                        type="date"
                        className="border-input bg-background w-full rounded-md border px-3 py-2 text-sm"
                        value={form.data.birth_date}
                        onChange={(e) => form.setData('birth_date', e.target.value)}
                    />
                    {form.errors.birth_date ? (
                        <p className="text-destructive text-xs">{form.errors.birth_date}</p>
                    ) : null}
                </div>
                <div className="space-y-1">
                    <label className="text-sm font-medium" htmlFor={`nm-${pedidoId}`}>
                        Nome (opcional)
                    </label>
                    <input
                        id={`nm-${pedidoId}`}
                        className="border-input bg-background w-full rounded-md border px-3 py-2 text-sm"
                        value={form.data.name}
                        onChange={(e) => form.setData('name', e.target.value)}
                    />
                    {form.errors.name ? (
                        <p className="text-destructive text-xs">{form.errors.name}</p>
                    ) : null}
                </div>
                <div className="space-y-1 sm:col-span-2">
                    <label className="text-sm font-medium" htmlFor={`em-${pedidoId}`}>
                        E-mail (opcional)
                    </label>
                    <input
                        id={`em-${pedidoId}`}
                        type="email"
                        className="border-input bg-background w-full rounded-md border px-3 py-2 text-sm"
                        value={form.data.email}
                        onChange={(e) => form.setData('email', e.target.value)}
                    />
                    {form.errors.email ? (
                        <p className="text-destructive text-xs">{form.errors.email}</p>
                    ) : null}
                </div>
                <label className="flex cursor-pointer items-start gap-2 sm:col-span-2">
                    <input
                        type="checkbox"
                        className="mt-1 size-4 accent-(--brotero-primaria)"
                        checked={form.data.is_librarian}
                        onChange={(e) => form.setData('is_librarian', e.target.checked)}
                    />
                    <span className="text-sm leading-snug text-(--brotero-texto)">
                        Cartão de bibliotecária/o: ao entrar no quiosque, escolhe modo de sessão
                    </span>
                </label>
            </div>
            <div className="mt-3">
                <Button type="button" size="sm" disabled={form.processing} onClick={() => form.post(staffPatrons.store.url(), { preserveScroll: true })}>
                    {form.processing ? (
                        <>
                            <Spinner className="mr-2 size-4" aria-hidden />
                            A guardar…
                        </>
                    ) : (
                        'Guardar leitor'
                    )}
                </Button>
            </div>
        </div>
    );
}

export default function StaffPedidos({ pedidos }: Props) {
    const { flash } = usePage().props;
    const [busyId, setBusyId] = useState<number | null>(null);
    const [rejectTarget, setRejectTarget] = useState<StaffPedidoRow | null>(null);
    const [rejectReason, setRejectReason] = useState('');

    const rejectOpen = rejectTarget !== null;
    const [rejectBusy, setRejectBusy] = useState(false);

    function handleApprove(id: number): void {
        setBusyId(id);
        router.post(
            staffPedidos.approve.url({ bookRequest: id }),
            {},
            {
                preserveScroll: true,
                onFinish: () => setBusyId(null),
            },
        );
    }

    function openReject(p: StaffPedidoRow): void {
        setRejectTarget(p);
        setRejectReason('');
    }

    function submitReject(): void {
        if (!rejectTarget) {
            return;
        }

        setRejectBusy(true);
        router.post(
            staffPedidos.reject.url({ bookRequest: rejectTarget.id }),
            { reason: rejectReason.trim() === '' ? null : rejectReason.trim() },
            {
                preserveScroll: true,
                onFinish: () => {
                    setRejectBusy(false);
                    setBusyId(null);
                    setRejectTarget(null);
                    setRejectReason('');
                },
            },
        );
    }

    return (
        <AppLayout
            breadcrumbs={[{ title: 'Pedidos da biblioteca', href: staffPedidos.index.url() }]}
        >
            <Head title="Pedidos pendentes · Biblioteca" />

            <div className="mx-auto max-w-5xl space-y-6 p-4 md:p-8">
                <h1 className="text-2xl font-semibold tracking-tight">Pedidos pendentes</h1>
                <p className="text-muted-foreground text-sm">
                    Aprove requisições depois de validar o cartão. Se o número ainda não existir, registe o
                    leitor antes de aprovar.
                </p>

                {flash?.success ? (
                    <p
                        className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900"
                        role="status"
                    >
                        {flash.success}
                    </p>
                ) : null}
                {flash?.error ? (
                    <p
                        className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900"
                        role="alert"
                    >
                        {flash.error}
                    </p>
                ) : null}

                {pedidos.length === 0 ? (
                    <p className="text-muted-foreground rounded-md border border-dashed px-4 py-8 text-center text-sm">
                        Não há pedidos em análise.
                    </p>
                ) : (
                    <ul className="m-0 flex list-none flex-col gap-4 p-0">
                        {pedidos.map((p) => {
                            const busy = busyId === p.id;

                            return (
                                <li
                                    key={p.id}
                                    className="space-y-4 rounded-lg border bg-card p-4 text-card-foreground shadow-sm"
                                >
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                        <div className="min-w-0 flex-1 space-y-1">
                                            <p className="text-lg font-semibold leading-snug">{p.book_title}</p>
                                            <p className="text-muted-foreground text-sm">
                                                Pedido #{p.id} · Cartão{' '}
                                                <span className="font-mono font-medium">{p.card_number}</span>
                                                {!p.patron_registered ? (
                                                    <span className="ml-2 inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-900">
                                                        Leitor não registado
                                                    </span>
                                                ) : null}
                                            </p>
                                            <p className="text-muted-foreground text-sm">
                                                {tipoRetiradaLabel(p.request_type)}
                                                {p.school_location ? ` · ${p.school_location}` : ''}
                                                {p.isbn ? ` · ISBN ${p.isbn}` : ''}
                                            </p>
                                            <p className="text-muted-foreground text-sm">
                                                Recebido: {formatDt(p.created_at)}
                                            </p>
                                        </div>
                                        <div className="flex shrink-0 flex-wrap gap-2">
                                            <Button
                                                type="button"
                                                size="sm"
                                                disabled={busy || !p.patron_registered}
                                                title={
                                                    !p.patron_registered
                                                        ? 'Registe o leitor com este cartão antes de aprovar.'
                                                        : undefined
                                                }
                                                onClick={() => handleApprove(p.id)}
                                            >
                                                {busy ? (
                                                    <>
                                                        <Spinner className="mr-2 size-4" aria-hidden />
                                                        A aprovar…
                                                    </>
                                                ) : (
                                                    'Aprovar'
                                                )}
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                disabled={busy || rejectBusy}
                                                onClick={() => openReject(p)}
                                            >
                                                Recusar
                                            </Button>
                                        </div>
                                    </div>

                                    {!p.patron_registered ? (
                                        <PatronRegisterBlock key={p.id} pedidoId={p.id} cardNumber={p.card_number} />
                                    ) : null}
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>

            <Dialog
                open={rejectOpen}
                onOpenChange={(open) => {
                    if (!open && !rejectBusy) {
                        setRejectTarget(null);
                        setRejectReason('');
                    }
                }}
            >
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Recusar pedido</DialogTitle>
                        <DialogDescription>
                            {rejectTarget ? (
                                <>
                                    Pedido de «{rejectTarget.book_title}» (cartão {rejectTarget.card_number}). O
                                    motivo é opcional e pode ser mostrado ao aluno no histórico.
                                </>
                            ) : null}
                        </DialogDescription>
                    </DialogHeader>
                    <textarea
                        className="border-input bg-background min-h-[100px] w-full rounded-md border px-3 py-2 text-sm"
                        placeholder="Motivo (opcional)"
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                    />
                    <DialogFooter className="gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            disabled={rejectBusy}
                            onClick={() => {
                                setRejectTarget(null);
                                setRejectReason('');
                            }}
                        >
                            Voltar
                        </Button>
                        <Button type="button" disabled={rejectBusy} onClick={submitReject}>
                            {rejectBusy ? (
                                <>
                                    <Spinner className="mr-2 size-4" aria-hidden />
                                    A recusar…
                                </>
                            ) : (
                                'Confirmar recusa'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
