import { MessageCircle, Send, X, Bot } from 'lucide-react';
import { useCallback, useEffect, useId, useState, useRef } from 'react';
import { cn } from '@/lib/utils';

type Message = {
    id: string;
    text: string;
    sender: 'user' | 'ai';
    timestamp: Date;
};

/** Balão flutuante de ajuda com Assistente IA (Simulado). */
export function BibliotecaCatalogHelpPanel() {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            text: 'Olá! Eu sou o assistente digital da Biblioteca Brotero. Posso ajudar a encontrar livros ou explicar como funcionam as requisições.',
            sender: 'ai',
            timestamp: new Date(),
        },
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const titleId = useId();
    const dialogId = useId();

    const close = useCallback(() => setOpen(false), []);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            text: input.trim(),
            sender: 'user',
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        // Simulação de IA Inteligente local
        setTimeout(() => {
            const query = userMsg.text.toLowerCase();
            let response = "Peço desculpa, ainda estou a aprender. Pode reformular a sua pergunta ou contactar a biblioteca por e-mail?";

            if (query.includes('requisitar') || query.includes('pedir') || query.includes('livro')) {
                response = "Para requisitar um livro, abra a página da obra e clique em «Requisitar». Se estiver disponível, a equipa da biblioteca prepara o livro para entrega.";
            } else if (query.includes('entrar') || query.includes('cartão') || query.includes('palavra-passe') || query.includes('passe')) {
                response = "Use o seu número de cartão (5 algarismos) e a palavra-passe no formato de data (DDMMAA ou DDMMAAAA).";
            } else if (query.includes('ranking') || query.includes('quem')) {
                response = "O nosso ranking destaca os leitores com mais requisições concluídas. Consulte a página «Ranking» para ver os líderes.";
            } else if (query.includes('ola') || query.includes('oi') || query.includes('bom dia')) {
                response = "Olá! Como posso ajudar na sua jornada de leitura hoje?";
            }

            const aiMsg: Message = {
                id: (Date.now() + 1).toString(),
                text: response,
                sender: 'ai',
                timestamp: new Date(),
            };

            setMessages((prev) => [...prev, aiMsg]);
            setIsTyping(false);
        }, 1200);
    };

    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') close();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [open, close]);

    return (
        <>
            {open ? (
                <button
                    type="button"
                    className="fixed inset-0 z-190 cursor-default border-0 bg-black/20 p-0 transition-opacity duration-300"
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
                        'pointer-events-auto w-[min(calc(100vw-28px),380px)] origin-bottom-right transition-all duration-300 cubic-bezier(0.4, 0, 0.2, 1)',
                        open
                            ? 'visible translate-y-0 scale-100 opacity-100'
                            : 'pointer-events-none invisible translate-y-6 scale-90 opacity-0',
                    )}
                >
                    <div className="relative overflow-hidden rounded-[28px] border border-(--brotero-borda) bg-(--brotero-branco) shadow-premium">
                        {/* Header do Chat */}
                        <div className="bg-linear-to-br from-(--brotero-primaria) to-(--brotero-primaria-escuro) px-5 py-4 text-white">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="flex size-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-md">
                                        <Bot className="size-6" />
                                    </div>
                                    <div>
                                        <h2 id={titleId} className="m-0 text-[1rem] font-bold">Assistente Brotero</h2>
                                        <div className="flex items-center gap-1.5 mt-0.5">
                                            <span className="size-2 rounded-full bg-emerald-400 animate-pulse"></span>
                                            <span className="text-[11px] font-medium opacity-80 uppercase tracking-wider">Online</span>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={close}
                                    className="btn-brotero btn-brotero-ghost rounded-full! p-2! text-white! hover:bg-white/15!"
                                    aria-label="Fechar ajuda"
                                >
                                    <X className="size-5" />
                                </button>
                            </div>
                        </div>

                        {/* Área de Mensagens */}
                        <div
                            ref={scrollRef}
                            className="flex max-h-[400px] min-h-[300px] flex-col gap-4 overflow-y-auto px-5 py-6 bg-linear-to-b from-slate-50 to-white"
                            style={{ scrollbarWidth: 'none' }}
                        >
                            {messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={cn(
                                        "flex flex-col gap-1.5 max-w-[85%]",
                                        msg.sender === 'user' ? "self-end items-end" : "self-start items-start"
                                    )}
                                >
                                    <div className={cn(
                                        "px-4 py-2.5 rounded-[20px] text-[14px] leading-relaxed shadow-sm",
                                        msg.sender === 'user' 
                                            ? "bg-(--brotero-primaria) text-white rounded-tr-none" 
                                            : "bg-white text-(--brotero-texto) border border-(--brotero-borda-suave) rounded-tl-none"
                                    )}>
                                        {msg.text}
                                    </div>
                                    <span className="text-[10px] text-(--brotero-texto-cinza) px-1 font-medium">
                                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            ))}
                            {isTyping && (
                                <div className="self-start bg-white border border-(--brotero-borda-suave) px-4 py-3 rounded-[20px] rounded-tl-none shadow-sm">
                                    <div className="flex gap-1">
                                        <span className="size-1.5 rounded-full bg-(--brotero-primaria) animate-bounce"></span>
                                        <span className="size-1.5 rounded-full bg-(--brotero-primaria) animate-bounce [animation-delay:0.2s]"></span>
                                        <span className="size-1.5 rounded-full bg-(--brotero-primaria) animate-bounce [animation-delay:0.4s]"></span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Input Area */}
                        <div className="p-4 border-t border-(--brotero-borda-suave) bg-white">
                            <form
                                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                                className="flex items-center gap-2 rounded-full border border-(--brotero-borda) bg-slate-50 pr-1 pl-4 focus-within:border-(--brotero-primaria) focus-within:ring-2 focus-within:ring-(--brotero-primaria)/10 transition-all"
                            >
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Pergunte ao assistente..."
                                    className="flex-1 border-none bg-transparent py-3 text-[14px] focus:ring-0 outline-none"
                                />
                                <button
                                    type="submit"
                                    disabled={!input.trim()}
                                    className="btn-brotero btn-brotero-primary size-10! rounded-full! p-0!"
                                >
                                    <Send className="size-5" />
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={() => setOpen((v) => !v)}
                    aria-expanded={open}
                    aria-controls={dialogId}
                    className={cn(
                        'pointer-events-auto inline-flex size-[64px] shrink-0 items-center justify-center rounded-full border-4 border-white text-white shadow-premium transition-all duration-300 hover:scale-110 active:scale-95',
                        'bg-linear-to-br from-(--brotero-primaria) to-(--brotero-primaria-escuro)',
                    )}
                >
                    {open ? (
                        <X className="size-[32px]" strokeWidth={2.5} />
                    ) : (
                        <MessageCircle className="size-[34px]" strokeWidth={2} />
                    )}
                </button>
            </div>
        </>
    );
}
