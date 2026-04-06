import { Link, usePage } from '@inertiajs/react';
import { BibliotecaContaLayout } from '@/components/biblioteca/BibliotecaContaLayout';
import { cn } from '@/lib/utils';
import type { ChatConversaLista } from '@/types/biblioteca';

type Flash = { success?: string; error?: string } | undefined;

type Props = {
    conversas: ChatConversaLista[];
};

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
        <BibliotecaContaLayout title="Mensagens" secao="mensagens">
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

            <p className="m-0 mb-[18px] max-w-[56ch] text-[15px] leading-snug text-(--brotero-texto-cinza)">
                Converse em privado com outros leitores. Nas Descobertas, use «Mensagem privada» para abrir
                uma conversa com quem partilhou um livro.
            </p>

            {conversas.length === 0 ? (
                <p
                    className="m-0 rounded-(--raio) border border-dashed border-(--brotero-borda) bg-(--brotero-branco) p-[18px] text-[15px] text-(--brotero-texto-cinza)"
                    role="status"
                >
                    Ainda não tem conversas. Vá a «Descobertas» e envie uma mensagem privada a outro leitor.
                </p>
            ) : (
                <ul className="m-0 flex list-none flex-col gap-[10px] p-0">
                    {conversas.map((c) => (
                        <li key={c.id}>
                            <Link
                                href={`/biblioteca/conta/mensagens/${encodeURIComponent(c.id)}`}
                                className={cn(
                                    'flex flex-col gap-[4px] rounded-[14px] border border-(--brotero-borda-suave) bg-(--brotero-branco) p-[14px_16px] no-underline shadow-[0_4px_16px_rgba(42,38,48,0.05)] transition-colors',
                                    'hover:border-(--brotero-primaria-claro) hover:bg-(--brotero-fundo)',
                                    'focus-visible:outline focus-visible:outline-2 focus-visible:outline-(--brotero-primaria) focus-visible:-outline-offset-2',
                                )}
                                preserveScroll
                            >
                                <div className="flex items-start justify-between gap-[10px]">
                                    <span className="text-[15px] font-semibold text-(--brotero-texto)">
                                        {c.outro_label}
                                    </span>
                                    <span className="shrink-0 text-[12px] text-(--brotero-texto-cinza)">
                                        {formatData(c.ultima_em)}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between gap-[10px]">
                                    <span className="line-clamp-2 min-w-0 text-[13px] text-(--brotero-texto-cinza)">
                                        {c.ultima_mensagem ?? 'Sem mensagens ainda — diga olá.'}
                                    </span>
                                    {c.nao_lidas > 0 ? (
                                        <span className="inline-flex shrink-0 rounded-full bg-(--brotero-primaria) px-[8px] py-[2px] text-[11px] font-bold text-white">
                                            {c.nao_lidas > 99 ? '99+' : c.nao_lidas}
                                        </span>
                                    ) : null}
                                </div>
                            </Link>
                        </li>
                    ))}
                </ul>
            )}
        </BibliotecaContaLayout>
    );
}
