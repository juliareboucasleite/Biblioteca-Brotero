import { Link, usePage } from '@inertiajs/react';
import { BibliotecaContaLayout } from '@/components/biblioteca/BibliotecaContaLayout';
import { cn } from '@/lib/utils';
import type { ChatConversaLista } from '@/types/biblioteca';

type Flash = { success?: string; error?: string } | undefined;

type Props = {
    conversas: ChatConversaLista[];
};

function inicialDoNome(label: string): string {
    const t = label.trim();

    return t !== '' ? t[0]!.toUpperCase() : '?';
}

function formatData(iso: string | null): string {
    if (!iso) {
        return '';
    }

    const d = new Date(iso);

    if (Number.isNaN(d.getTime())) {
        return iso;
    }

    return d.toLocaleDateString('pt-PT', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export default function BibliotecaContaMensagens({ conversas }: Props) {
    const { flash } = usePage<{ flash: Flash }>().props;

    return (
        <BibliotecaContaLayout title="Conversas" secao="mensagens">
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

            <header className="mb-[22px] rounded-[20px] border border-(--brotero-borda-suave) bg-linear-to-br from-[#faf8f6] via-[#f7f4fb] to-[#eef3f7] px-[20px] py-[20px] shadow-[0_10px_36px_rgba(42,38,48,0.07)]">
                <h1 className="m-0 text-[1.65rem] font-bold leading-tight tracking-tight text-(--brotero-texto)">
                    Conversas
                </h1>
                <p className="m-0 mt-[10px] max-w-[52ch] text-[15px] leading-relaxed text-(--brotero-texto-cinza)">
                    Os teus chats com outros leitores. Primeiro envia um pedido — quando{' '}
                    <strong className="font-semibold text-(--brotero-texto)">ambos aceitarem</strong>, as
                    mensagens ficam aqui.
                </p>
                <p className="m-0 mt-[12px] text-[12px] leading-snug text-(--brotero-texto-cinza) opacity-90">
                    Em <Link href="/biblioteca/descobertas">Descobertas</Link>, usa «Mensagem privada» para
                    pedir conversa a quem partilhou um livro.
                </p>
            </header>

            {conversas.length === 0 ? (
                <p
                    className="m-0 rounded-[16px] border border-dashed border-(--brotero-borda) bg-(--brotero-branco)/80 p-[22px] text-center text-[15px] leading-relaxed text-(--brotero-texto-cinza)"
                    role="status"
                >
                    Ainda não tens conversas.{' '}
                    <Link href="/biblioteca/descobertas" className="font-semibold text-(--brotero-texto-link)">
                        Explora Descobertas
                    </Link>{' '}
                    e envia «Mensagem privada» a um leitor.
                </p>
            ) : (
                <ul className="m-0 flex list-none flex-col gap-[10px] p-0">
                    {conversas.map((c) => (
                        <li key={c.id}>
                            <Link
                                href={`/biblioteca/conta/mensagens/${encodeURIComponent(c.id)}`}
                                className={cn(
                                    'flex flex-col gap-[10px] rounded-[16px] border border-(--brotero-borda-suave) bg-(--brotero-branco) p-[14px_16px] no-underline shadow-[0_6px_22px_rgba(42,38,48,0.06)] transition-[transform,box-shadow,border-color]',
                                    'hover:-translate-y-px hover:border-(--brotero-primaria-claro) hover:bg-(--brotero-fundo) hover:shadow-[0_10px_28px_rgba(77,107,122,0.12)]',
                                    'focus-visible:outline-2 focus-visible:outline-(--brotero-primaria) focus-visible:-outline-offset-2',
                                )}
                                preserveScroll
                            >
                                <div className="flex items-start gap-[12px]">
                                    <span
                                        className="flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-full bg-linear-to-br from-violet-100 to-[#d4e4ec] text-[17px] font-bold text-violet-950 shadow-inner"
                                        aria-hidden
                                    >
                                        {inicialDoNome(c.outro_label)}
                                    </span>
                                    <div className="flex min-w-0 flex-1 flex-col gap-[4px]">
                                        <div className="flex items-start justify-between gap-[10px]">
                                            <span className="text-[16px] font-semibold text-(--brotero-texto)">
                                                {c.outro_label}
                                            </span>
                                            <span className="shrink-0 text-[12px] text-(--brotero-texto-cinza)">
                                                {formatData(c.ultima_em)}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between gap-[10px]">
                                            <span className="line-clamp-2 min-w-0 text-[13px] text-(--brotero-texto-cinza)">
                                                {c.resumo ?? ''}
                                            </span>
                                            <span className="flex shrink-0 items-center gap-[6px]">
                                                {c.precisa_acao ? (
                                                    <span className="rounded-full bg-amber-100 px-[8px] py-[3px] text-[10px] font-bold uppercase tracking-wide text-amber-950">
                                                        Pedido
                                                    </span>
                                                ) : null}
                                                {c.nao_lidas > 0 ? (
                                                    <span className="inline-flex rounded-full bg-(--brotero-primaria) px-[8px] py-[2px] text-[11px] font-bold text-white">
                                                        {c.nao_lidas > 99 ? '99+' : c.nao_lidas}
                                                    </span>
                                                ) : null}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </li>
                    ))}
                </ul>
            )}
        </BibliotecaContaLayout>
    );
}
