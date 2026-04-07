import { MessageCircle, Send, X } from 'lucide-react';
import { useCallback, useEffect, useId, useState } from 'react';
import { cn } from '@/lib/utils';

/** Balão flutuante de ajuda (estilo chat); sem backend em tempo real. */
export function BibliotecaCatalogHelpPanel() {
    const [open, setOpen] = useState(false);
    const titleId = useId();
    const dialogId = useId();

    const close = useCallback(() => setOpen(false), []);

    useEffect(() => {
        if (!open) {
            return;
        }

        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                close();
            }
        };

        window.addEventListener('keydown', onKey);

        return () => window.removeEventListener('keydown', onKey);
    }, [open, close]);

    return (
        <>
            {open ? (
                <button
                    type="button"
                    className="fixed inset-0 z-190 cursor-default border-0 bg-black/20 p-0 sm:bg-black/15"
                    aria-label="Fechar ajuda"
                    onClick={close}
                />
            ) : null}

            <div className="pointer-events-none fixed right-[14px] bottom-[14px] z-200 flex flex-col items-end gap-[12px] sm:right-[22px] sm:bottom-[22px]">
                <div
                    id={dialogId}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby={titleId}
                    className={cn(
                        'pointer-events-auto w-[min(calc(100vw-28px),360px)] origin-bottom-right transition-[opacity,transform,visibility] duration-200 ease-out motion-reduce:transition-opacity motion-reduce:duration-150',
                        open
                            ? 'visible translate-y-0 scale-100 opacity-100'
                            : 'pointer-events-none invisible translate-y-3 scale-95 opacity-0 motion-reduce:translate-y-0 motion-reduce:scale-100',
                    )}
                >
                    {/* Balão principal + “tail” a apontar para o botão */}
                    <div className="relative w-[min(calc(100vw-28px),360px)] rounded-[22px] border border-(--brotero-borda-suave) bg-(--brotero-branco) p-[14px_16px] shadow-[0_22px_50px_rgba(42,38,48,0.18),0_0_1px_rgba(0,0,0,0.08)]">
                        <span
                            className="pointer-events-none absolute -bottom-[9px] right-[22px] size-[18px] rotate-45 border-r border-b border-(--brotero-borda-suave) bg-(--brotero-branco)"
                            aria-hidden
                        />

                        <div className="relative z-1 flex items-start justify-between gap-[10px] pb-[12px]">
                            <div className="min-w-0">
                                <h2
                                    id={titleId}
                                    className="m-0 text-[1.05rem] font-bold text-(--brotero-texto)"
                                >
                                    Ajuda
                                </h2>
                                <p className="m-0 mt-[2px] text-[12px] text-(--brotero-texto-cinza)">
                                    Mensagens de exemplo; chat em breve
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={close}
                                className="inline-flex size-[40px] shrink-0 items-center justify-center rounded-full border border-(--brotero-borda-suave) bg-(--brotero-fundo) text-(--brotero-texto) transition-colors hover:bg-(--brotero-borda-suave) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--brotero-primaria)"
                                aria-label="Fechar ajuda"
                            >
                                <X className="size-[20px]" strokeWidth={2} aria-hidden />
                            </button>
                        </div>

                        <div className="relative z-1 mb-[12px] rounded-[14px] border border-(--brotero-borda-suave) bg-(--brotero-fundo) p-[10px_12px]">
                            <p className="m-0 text-[12px] font-bold text-(--brotero-primaria)">
                                Biblioteca Brotero
                            </p>
                            <p className="mt-[6px] mb-0 text-[13px] leading-snug text-(--brotero-texto-cinza)">
                                Dúvidas sobre requisições ou o catálogo? Envie um e-mail ou fale connosco na
                                escola.
                            </p>
                        </div>

                        <div
                            className="relative z-1 mb-[12px] flex max-h-[min(42vh,280px)] flex-col gap-[10px] overflow-y-auto overscroll-contain rounded-[16px] border border-(--brotero-borda-suave) bg-linear-to-b from-[#faf7ff] to-(--brotero-branco) p-[12px_12px_10px]"
                            style={{ scrollbarWidth: 'thin' }}
                        >
                            <div className="max-w-[92%] rounded-[14px_14px_14px_4px] bg-(--brotero-branco) px-[12px] py-[10px] text-[13px] leading-snug text-(--brotero-texto) shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
                                Olá! Posso indicar como requisitar um livro ou recuperar a senha do cartão?
                            </div>
                            <div className="max-w-[88%] self-end rounded-[14px_14px_4px_14px] bg-linear-to-br from-violet-500 to-fuchsia-600 px-[12px] py-[10px] text-[13px] leading-snug text-white shadow-[0_4px_12px_rgba(124,58,237,0.35)]">
                                Quero saber como entrar com o número do cartão.
                            </div>
                            <div className="max-w-[92%] rounded-[14px_14px_14px_4px] bg-(--brotero-branco) px-[12px] py-[10px] text-[13px] leading-snug text-(--brotero-texto) shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
                                Use o menu <strong className="font-semibold">Entrar</strong>, o cartão (5
                                algarismos) e a palavra-passe no formato data:{' '}
                                <strong className="font-semibold">DDMMAA</strong> ou{' '}
                                <strong className="font-semibold">DDMMAAAA</strong>.
                            </div>
                        </div>

                        <div className="relative z-1 flex items-center gap-[8px] rounded-full border border-(--brotero-borda) bg-(--brotero-branco) px-[14px] py-[8px] opacity-80">
                            <span className="flex-1 text-[13px] text-(--brotero-texto-cinza)">
                                Escrever mensagem…
                            </span>
                            <span
                                className="inline-flex size-[40px] shrink-0 items-center justify-center rounded-full bg-(--brotero-primaria) text-white"
                                aria-hidden
                            >
                                <Send className="size-[18px]" strokeWidth={2} />
                            </span>
                        </div>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={() => setOpen((v) => !v)}
                    aria-expanded={open}
                    aria-controls={dialogId}
                    className={cn(
                        'pointer-events-auto inline-flex size-[56px] shrink-0 items-center justify-center rounded-full border-2 border-white text-white shadow-[0_10px_30px_rgba(93,122,140,0.45)] transition-[transform,box-shadow] hover:scale-[1.04] active:scale-[0.98]',
                        'bg-linear-to-br from-(--brotero-primaria) to-(--brotero-primaria-escuro)',
                        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--brotero-primaria)',
                    )}
                    aria-label={open ? 'Fechar chat de ajuda' : 'Abrir chat de ajuda'}
                >
                    {open ? (
                        <X className="size-[26px]" strokeWidth={2} aria-hidden />
                    ) : (
                        <MessageCircle className="size-[28px]" strokeWidth={1.9} aria-hidden />
                    )}
                </button>
            </div>
        </>
    );
}
