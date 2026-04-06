import { Form, Link, usePage } from '@inertiajs/react';
import { useEffect, useRef } from 'react';
import { BibliotecaContaLayout } from '@/components/biblioteca/BibliotecaContaLayout';
import { cn } from '@/lib/utils';
import type { ChatMensagem } from '@/types/biblioteca';

type Flash = { success?: string; error?: string } | undefined;

type Props = {
    conversa: {
        id: string;
        outro_label: string;
    };
    mensagens: ChatMensagem[];
};

function formatHora(iso: string): string {
    if (!iso) {
        return '';
    }

    const d = new Date(iso);

    if (Number.isNaN(d.getTime())) {
        return iso;
    }

    return d.toLocaleString('pt-PT', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export default function BibliotecaContaMensagensConversa({ conversa, mensagens }: Props) {
    const { flash } = usePage<{ flash: Flash }>().props;
    const fimRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        fimRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [mensagens.length]);

    return (
        <BibliotecaContaLayout title={`Chat — ${conversa.outro_label}`} secao="mensagens">
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

            <div className="mb-[14px] flex flex-wrap items-center gap-[12px]">
                <Link
                    href="/biblioteca/conta/mensagens"
                    className="text-[14px] font-semibold text-(--brotero-texto-link) no-underline hover:underline"
                    preserveScroll
                >
                    ← Todas as conversas
                </Link>
            </div>

            <h2 className="m-0 mb-[14px] text-[1.2rem] font-bold text-(--brotero-texto)">
                Com {conversa.outro_label}
            </h2>

            <div
                className="mb-[16px] flex max-h-[min(52vh,420px)] flex-col gap-[10px] overflow-y-auto rounded-[16px] border border-(--brotero-borda-suave) bg-(--brotero-branco) p-[14px] shadow-inner"
                role="log"
                aria-live="polite"
            >
                {mensagens.length === 0 ? (
                    <p className="m-0 text-center text-[14px] text-(--brotero-texto-cinza)">
                        Ainda não há mensagens. Escreva abaixo para começar.
                    </p>
                ) : (
                    mensagens.map((m) => (
                        <div
                            key={m.id}
                            className={cn(
                                'flex flex-col gap-[4px] rounded-[12px] px-[12px] py-[8px] text-[14px] leading-snug',
                                m.minha
                                    ? 'ml-[12%] self-end bg-violet-100 text-violet-950'
                                    : 'mr-[12%] self-start bg-(--brotero-fundo) text-(--brotero-texto)',
                            )}
                        >
                            {!m.minha ? (
                                <span className="text-[11px] font-semibold text-(--brotero-texto-cinza)">
                                    {m.remetente_label}
                                </span>
                            ) : null}
                            <p className="m-0 whitespace-pre-wrap break-words">{m.body}</p>
                            <span className="text-[10px] text-(--brotero-texto-cinza)">
                                {formatHora(m.created_at)}
                            </span>
                        </div>
                    ))
                )}
                <div ref={fimRef} />
            </div>

            <Form
                action={`/biblioteca/conta/mensagens/${encodeURIComponent(conversa.id)}`}
                method="post"
                className="flex flex-col gap-[10px]"
                preserveScroll
            >
                <label className="flex flex-col gap-[6px] text-[14px] text-(--brotero-texto)">
                    <span className="font-semibold">Nova mensagem</span>
                    <textarea
                        name="body"
                        required
                        rows={3}
                        maxLength={2000}
                        className="min-h-[88px] w-full resize-y rounded-[12px] border border-(--brotero-borda) bg-(--brotero-branco) px-[12px] py-[10px] text-[15px] text-(--brotero-texto) focus-visible:outline focus-visible:outline-2 focus-visible:outline-(--brotero-primaria)"
                        placeholder="Escreva a sua mensagem…"
                    />
                </label>
                <button
                    type="submit"
                    className="self-start rounded-[12px] border-0 bg-(--brotero-primaria) px-[18px] py-[10px] text-[14px] font-semibold text-white cursor-pointer hover:opacity-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-(--brotero-primaria) focus-visible:outline-offset-2"
                >
                    Enviar
                </button>
            </Form>
        </BibliotecaContaLayout>
    );
}
