import { Form, Link, usePage } from '@inertiajs/react';
import { BookPlus, MoreHorizontal, Send } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BibliotecaContaLayout } from '@/components/biblioteca/BibliotecaContaLayout';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import type { ChatConversaDetalhe, ChatLivroPartilhado, ChatMensagem } from '@/types/biblioteca';

type Flash = { success?: string; error?: string } | undefined;

type LivroPesquisa = {
    id: string;
    titulo: string;
    autor: string;
    capa: string | null;
};

type Props = {
    conversa: ChatConversaDetalhe;
    mensagens: ChatMensagem[];
    livros_partilhados: ChatLivroPartilhado[];
};

type TimelineMessage = { kind: 'message'; t: string; id: string; data: ChatMensagem };
type TimelineLivro = { kind: 'livro'; t: string; id: string; data: ChatLivroPartilhado };
type TimelineItem = TimelineMessage | TimelineLivro;

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

function mergeTimeline(mensagens: ChatMensagem[], livros: ChatLivroPartilhado[]): TimelineItem[] {
    const items: TimelineItem[] = [
        ...mensagens.map(
            (m): TimelineMessage => ({
                kind: 'message',
                t: m.created_at,
                id: m.id,
                data: m,
            }),
        ),
        ...livros.map(
            (l): TimelineLivro => ({
                kind: 'livro',
                t: l.criado_em,
                id: l.id,
                data: l,
            }),
        ),
    ];

    items.sort((a, b) => {
        const da = new Date(a.t).getTime();
        const db = new Date(b.t).getTime();

        if (da !== db) {

            return da - db;
        }

        return String(a.id).localeCompare(String(b.id), undefined, { numeric: true });
    });

    return items;
}

async function fetchLivrosParaPartilhar(conversaId: string, q: string): Promise<LivroPesquisa[]> {
    const params = new URLSearchParams({ q, limit: '15' });
    const res = await fetch(
        `/biblioteca/conta/mensagens/${encodeURIComponent(conversaId)}/livros-pesquisa?${params.toString()}`,
        { headers: { Accept: 'application/json' }, credentials: 'same-origin' },
    );

    if (!res.ok) {

        return [];
    }

    const data = (await res.json()) as { livros?: LivroPesquisa[] };

    return data.livros ?? [];
}

function SugerirLivroInline({
    conversaId,
    aberto,
    outroLabel,
}: {
    conversaId: string;
    aberto: boolean;
    outroLabel: string;
}) {
    const [query, setQuery] = useState('');
    const [resultados, setResultados] = useState<LivroPesquisa[]>([]);
    const [loading, setLoading] = useState(false);
    const [selecionado, setSelecionado] = useState<LivroPesquisa | null>(null);
    const partilharAction = `/biblioteca/conta/mensagens/${encodeURIComponent(conversaId)}/partilhar-livro`;

    const pesquisar = useCallback(async () => {
        setLoading(true);

        try {
            const livros = await fetchLivrosParaPartilhar(conversaId, query.trim());

            setResultados(livros);
        } finally {
            setLoading(false);
        }
    }, [conversaId, query]);

    if (!aberto) {
        return null;
    }

    return (
        <div className="mb-[10px] border-b border-(--brotero-borda-suave) pb-[12px]">
            <p className="m-0 mb-[8px] text-[13px] leading-snug text-(--brotero-texto-cinza)">
                Escolha um livro do catálogo para sugerir a <strong>{outroLabel}</strong>. A sugestão aparece no
                histórico, como nas redes sociais.
            </p>
            <div className="mb-[10px] flex flex-wrap gap-[8px]">
                <input
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            void pesquisar();
                        }
                    }}
                    placeholder="Título ou autor…"
                    className="min-w-[160px] flex-1 rounded-[12px] border border-(--brotero-borda) bg-(--brotero-branco) px-[12px] py-[9px] text-[14px] text-(--brotero-texto)"
                />
                <button
                    type="button"
                    className="cursor-pointer rounded-[12px] border-0 bg-(--brotero-primaria) px-[14px] py-[9px] text-[13px] font-semibold text-white hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={loading}
                    onClick={() => void pesquisar()}
                >
                    {loading ? 'A procurar…' : 'Procurar'}
                </button>
            </div>
            {resultados.length > 0 ? (
                <ul className="m-0 mb-[10px] max-h-[160px] list-none space-y-[4px] overflow-y-auto p-0">
                    {resultados.map((liv) => (
                        <li key={liv.id}>
                            <button
                                type="button"
                                onClick={() => setSelecionado(liv)}
                                className={cn(
                                    'flex w-full cursor-pointer items-center gap-[10px] rounded-[12px] border px-[10px] py-[7px] text-left text-[13px] transition-colors',
                                    selecionado?.id === liv.id
                                        ? 'border-(--brotero-primaria) bg-violet-50/80'
                                        : 'border-transparent bg-(--brotero-fundo) hover:border-(--brotero-borda-suave)',
                                )}
                            >
                                {liv.capa ? (
                                    <img
                                        src={liv.capa}
                                        alt=""
                                        className="size-[36px] shrink-0 rounded-[6px] object-cover"
                                    />
                                ) : (
                                    <span className="flex size-[36px] shrink-0 items-center justify-center rounded-[6px] bg-(--brotero-branco) text-[10px] text-(--brotero-texto-cinza)">
                                        …
                                    </span>
                                )}
                                <span className="min-w-0">
                                    <span className="block font-semibold text-(--brotero-texto)">
                                        {liv.titulo}
                                    </span>
                                    <span className="block text-[12px] text-(--brotero-texto-cinza)">
                                        {liv.autor}
                                    </span>
                                </span>
                            </button>
                        </li>
                    ))}
                </ul>
            ) : null}
            {selecionado ? (
                <Form
                    action={partilharAction}
                    method="post"
                    className="flex flex-col gap-[8px] rounded-[12px] bg-violet-50/50 p-[10px]"
                >
                    <input type="hidden" name="book_id" value={selecionado.id} />
                    <p className="m-0 text-[13px] text-(--brotero-texto)">
                        A enviar: <strong>{selecionado.titulo}</strong>
                    </p>
                    <label className="flex flex-col gap-[4px] text-[13px]">
                        <span className="text-(--brotero-texto-cinza)">Nota (opcional)</span>
                        <input
                            name="note"
                            maxLength={500}
                            className="rounded-[10px] border border-(--brotero-borda) px-[10px] py-[7px] text-[14px]"
                            placeholder="Porque sugere este livro…"
                        />
                    </label>
                    <button
                        type="submit"
                        className="w-fit cursor-pointer rounded-[10px] border-0 bg-emerald-700 px-[14px] py-[8px] text-[13px] font-semibold text-white hover:bg-emerald-800"
                    >
                        Enviar sugestão
                    </button>
                </Form>
            ) : null}
        </div>
    );
}

export default function BibliotecaContaMensagensConversa({
    conversa,
    mensagens,
    livros_partilhados,
}: Props) {
    const { flash } = usePage<{ flash: Flash }>().props;
    const fimRef = useRef<HTMLDivElement | null>(null);
    const mensagemRef = useRef<HTMLTextAreaElement | null>(null);
    const [reportOpen, setReportOpen] = useState(false);
    const [blockOpen, setBlockOpen] = useState(false);
    const [sugerirLivroAberto, setSugerirLivroAberto] = useState(false);

    const timeline = useMemo(
        () => mergeTimeline(mensagens, livros_partilhados),
        [mensagens, livros_partilhados],
    );

    useEffect(() => {
        if (!flash?.success) {
            return;
        }

        queueMicrotask(() => {
            setReportOpen(false);
            setBlockOpen(false);
            setSugerirLivroAberto(false);
        });
    }, [flash?.success]);

    const basePath = `/biblioteca/conta/mensagens/${encodeURIComponent(conversa.id)}`;
    const peerBase = conversa.outro_id
        ? `/biblioteca/conta/leitores/${encodeURIComponent(conversa.outro_id)}`
        : null;

    useEffect(() => {
        fimRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [timeline.length]);

    const ajustarAlturaMensagem = useCallback(() => {
        const el = mensagemRef.current;

        if (!el) {

            return;
        }

        el.style.height = 'auto';

        const cap = 168;
        const next = Math.min(Math.max(el.scrollHeight, 44), cap);
        el.style.height = `${next}px`;
    }, []);

    useEffect(() => {
        const id = window.requestAnimationFrame(() => {
            ajustarAlturaMensagem();
        });

        return () => window.cancelAnimationFrame(id);
    }, [ajustarAlturaMensagem]);

    const podeEscrever = conversa.pode_enviar_mensagens && conversa.estado !== 'declined';

    return (
        <BibliotecaContaLayout
            title={`Chat · ${conversa.outro_label}`}
            secao="mensagens"
            ocuparAlturaConteudo
        >
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

            <Dialog open={reportOpen} onOpenChange={setReportOpen}>
                <DialogContent className="border-(--brotero-borda) bg-(--brotero-branco) text-(--brotero-texto) sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Denunciar comportamento</DialogTitle>
                        <DialogDescription className="text-(--brotero-texto-cinza)">
                            A sua denúncia é analisada pela equipa. Não partilhe dados sensíveis desnecessários.
                        </DialogDescription>
                    </DialogHeader>
                    {conversa.outro_id ? (
                        <Form
                            action={`/biblioteca/conta/leitores/${encodeURIComponent(conversa.outro_id)}/denunciar`}
                            method="post"
                            className="flex flex-col gap-[12px]"
                        >
                            <label className="flex flex-col gap-[4px] text-[14px]">
                                <span className="font-semibold">Motivo</span>
                                <select
                                    name="category"
                                    required
                                    className="rounded-[10px] border border-(--brotero-borda) px-[10px] py-[8px]"
                                >
                                    <option value="spam">Spam ou mensagens repetidas</option>
                                    <option value="insultos_ameacas">Insultos ou ameaças</option>
                                    <option value="conteudo_inadequado">Conteúdo inadequado</option>
                                    <option value="outro">Outro</option>
                                </select>
                            </label>
                            <label className="flex flex-col gap-[4px] text-[14px]">
                                <span className="font-semibold">Detalhes (opcional)</span>
                                <textarea
                                    name="details"
                                    rows={3}
                                    maxLength={2000}
                                    className="resize-y rounded-[10px] border border-(--brotero-borda) px-[10px] py-[8px]"
                                />
                            </label>
                            <DialogFooter className="gap-[8px] sm:justify-end">
                                <button
                                    type="button"
                                    className="rounded-[10px] border border-(--brotero-borda) bg-(--brotero-branco) px-[14px] py-[8px] text-[14px] font-semibold"
                                    onClick={() => setReportOpen(false)}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="rounded-[10px] border-0 bg-(--brotero-primaria) px-[14px] py-[8px] text-[14px] font-semibold text-white"
                                >
                                    Enviar denúncia
                                </button>
                            </DialogFooter>
                        </Form>
                    ) : null}
                </DialogContent>
            </Dialog>

            <Dialog open={blockOpen} onOpenChange={setBlockOpen}>
                <DialogContent className="border-(--brotero-borda) bg-(--brotero-branco) text-(--brotero-texto) sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Bloquear este leitor?</DialogTitle>
                        <DialogDescription className="text-(--brotero-texto-cinza)">
                            Deixa de ver conversas com esta pessoa e não poderão enviar-se pedidos até haver uma
                            alteração administrativa. Partilhas de livros nesta conversa serão removidas.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-[8px] sm:justify-end">
                        <button
                            type="button"
                            className="rounded-[10px] border border-(--brotero-borda) bg-(--brotero-branco) px-[14px] py-[8px] text-[14px] font-semibold"
                            onClick={() => setBlockOpen(false)}
                        >
                            Cancelar
                        </button>
                        {conversa.outro_id ? (
                            <Form
                                action={`/biblioteca/conta/leitores/${encodeURIComponent(conversa.outro_id)}/bloquear`}
                                method="post"
                                className="inline"
                                onSuccess={() => setBlockOpen(false)}
                            >
                                <button
                                    type="submit"
                                    className="rounded-[10px] border-0 bg-red-700 px-[14px] py-[8px] text-[14px] font-semibold text-white hover:bg-red-800"
                                >
                                    Bloquear
                                </button>
                            </Form>
                        ) : null}
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Painel de conversa: largura total da coluna + altura até ao rodapé */}
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[18px] border border-(--brotero-borda-suave) bg-(--brotero-branco) shadow-[0_8px_28px_rgba(42,38,48,0.07)]">
                <div className="flex shrink-0 items-center gap-[10px] border-b border-(--brotero-borda-suave) px-[14px] py-[12px]">
                    <Link
                        href="/biblioteca/conta/mensagens"
                        className="shrink-0 text-[13px] font-semibold text-(--brotero-texto-link) no-underline hover:underline"
                        preserveScroll
                    >
                        ← Conversas
                    </Link>
                    <h2 className="m-0 min-w-0 flex-1 truncate text-[1.05rem] font-bold text-(--brotero-texto)">
                        Com {conversa.outro_label}
                    </h2>
                    {conversa.mostrar_menu_seguranca && conversa.outro_id ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger
                                type="button"
                                className="inline-flex size-[38px] shrink-0 cursor-pointer items-center justify-center rounded-[12px] border border-(--brotero-borda-suave) bg-(--brotero-branco) text-(--brotero-texto) hover:bg-(--brotero-fundo)"
                                aria-label="Opções: perfil, denunciar, bloquear"
                            >
                                <MoreHorizontal className="size-[19px]" aria-hidden />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                align="end"
                                className="min-w-52 border border-(--brotero-borda) bg-(--brotero-branco) p-[6px] text-(--brotero-texto) shadow-lg"
                            >
                                {conversa.mostrar_perfil_peer && peerBase ? (
                                    <DropdownMenuItem asChild className="cursor-pointer rounded-[8px] text-[14px]">
                                        <Link href={peerBase}>Ver perfil</Link>
                                    </DropdownMenuItem>
                                ) : null}
                                <DropdownMenuItem
                                    className="cursor-pointer rounded-[8px] text-[14px]"
                                    onSelect={() => setReportOpen(true)}
                                >
                                    Denunciar…
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    className="cursor-pointer rounded-[8px] text-[14px] text-red-800 focus:text-red-900"
                                    onSelect={() => setBlockOpen(true)}
                                >
                                    Bloquear leitor
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : null}
                </div>

                <div className="shrink-0 px-[14px] pt-[12px]">
                    {conversa.estado === 'declined' ? (
                        <div
                            className="mb-[12px] rounded-[12px] bg-(--brotero-fundo) px-[12px] py-[10px] text-[14px] leading-snug text-(--brotero-texto-cinza)"
                            role="status"
                        >
                            Este pedido já não está activo. Para voltar a falar, envie um novo pedido pelas
                            Descobertas, se a outra pessoa aceitar.
                        </div>
                    ) : null}

                    {conversa.estado === 'pending' && conversa.sou_iniciador ? (
                        <div className="mb-[12px] rounded-[12px] border border-amber-200/90 bg-amber-50/90 px-[12px] py-[10px] text-[14px] leading-snug text-amber-950">
                            <p className="m-0">
                                Pedido enviado. <strong>{conversa.outro_label}</strong> tem de aceitar para
                                trocarem mensagens.
                            </p>
                            {conversa.pode_cancelar_pedido ? (
                                <Form action={`${basePath}/cancelar-pedido`} method="post" className="m-0 mt-[10px]">
                                    <button
                                        type="submit"
                                        className="cursor-pointer rounded-[10px] border border-(--brotero-borda) bg-(--brotero-branco) px-[12px] py-[6px] text-[12px] font-semibold text-(--brotero-texto) hover:bg-(--brotero-fundo)"
                                    >
                                        Cancelar pedido
                                    </button>
                                </Form>
                            ) : null}
                        </div>
                    ) : null}

                    {conversa.estado === 'pending' && conversa.pode_aceitar ? (
                        <div className="mb-[12px] rounded-[12px] border border-(--brotero-borda-suave) bg-(--brotero-fundo) px-[12px] py-[10px] text-[14px] leading-snug text-(--brotero-texto)">
                            <p className="m-0">
                                <strong>{conversa.outro_label}</strong> pediu conversar consigo.
                            </p>
                            <div className="mt-[10px] flex flex-wrap gap-[8px]">
                                <Form action={`${basePath}/aceitar`} method="post" className="m-0">
                                    <button
                                        type="submit"
                                        className="cursor-pointer rounded-[10px] border-0 bg-emerald-700 px-[14px] py-[8px] text-[13px] font-semibold text-white hover:bg-emerald-800"
                                    >
                                        Aceitar
                                    </button>
                                </Form>
                                {conversa.pode_recusar ? (
                                    <Form action={`${basePath}/recusar`} method="post" className="m-0">
                                        <button
                                            type="submit"
                                            className="cursor-pointer rounded-[10px] border border-(--brotero-borda) bg-(--brotero-branco) px-[14px] py-[8px] text-[13px] font-semibold text-(--brotero-texto) hover:bg-(--brotero-branco)"
                                        >
                                            Recusar
                                        </button>
                                    </Form>
                                ) : null}
                            </div>
                        </div>
                    ) : null}
                </div>

                {conversa.estado !== 'declined' ? (
                    <div
                        className="flex min-h-0 flex-1 flex-col gap-[10px] overflow-y-auto px-[14px] pb-[12px]"
                        role="log"
                        aria-live="polite"
                    >
                        {!conversa.pode_enviar_mensagens ? (
                            <p className="m-0 py-[24px] text-center text-[14px] text-(--brotero-texto-cinza)">
                                {conversa.estado === 'pending'
                                    ? 'A conversa abre aqui quando ambos aceitarem o pedido.'
                                    : null}
                            </p>
                        ) : timeline.length === 0 ? (
                            <p className="m-0 py-[28px] text-center text-[14px] text-(--brotero-texto-cinza)">
                                Escreva abaixo ou partilhe um livro do catálogo para continuar a conversa.
                            </p>
                        ) : (
                            timeline.map((item) => {
                                if (item.kind === 'message') {
                                    const m = item.data;

                                    return (
                                        <div
                                            key={`m-${m.id}`}
                                            className={cn(
                                                'flex max-w-[min(92%,26rem)] flex-col gap-[4px] rounded-[14px] px-[12px] py-[9px] text-[14px] leading-snug',
                                                m.minha
                                                    ? 'ml-[6%] self-end bg-violet-100 text-violet-950'
                                                    : 'mr-[6%] self-start bg-(--brotero-fundo) text-(--brotero-texto)',
                                            )}
                                        >
                                            {!m.minha ? (
                                                <span className="text-[11px] font-semibold text-(--brotero-texto-cinza)">
                                                    {m.remetente_label}
                                                </span>
                                            ) : null}
                                            <p className="m-0 whitespace-pre-wrap wrap-break-word">{m.body}</p>
                                            <span className="text-[10px] text-(--brotero-texto-cinza)">
                                                {formatHora(m.created_at)}
                                            </span>
                                        </div>
                                    );
                                }

                                const s = item.data;
                                const minha = s.de_mim;

                                return (
                                    <div
                                        key={`l-${s.id}`}
                                        className={cn(
                                            'flex max-w-[min(94%,min(44rem,92vw))] flex-col gap-[6px] rounded-[14px] px-[11px] py-[9px] text-[14px]',
                                            minha
                                                ? 'ml-[6%] self-end border border-violet-200/80 bg-violet-50/90 text-violet-950'
                                                : 'mr-[6%] self-start border border-(--brotero-borda-suave) bg-(--brotero-fundo) text-(--brotero-texto)',
                                        )}
                                    >
                                        <span className="text-[11px] font-semibold uppercase tracking-wide text-(--brotero-texto-cinza)">
                                            {minha ? 'A sugerir um livro' : `Sugestão de ${conversa.outro_label}`}
                                        </span>
                                        <Link
                                            href={`/biblioteca/livro/${encodeURIComponent(s.livro.id)}`}
                                            className={cn(
                                                'flex gap-[10px] rounded-[10px] no-underline transition-opacity hover:opacity-90',
                                                minha ? 'text-violet-950' : 'text-(--brotero-texto)',
                                            )}
                                        >
                                            {s.livro.capa ? (
                                                <img
                                                    src={s.livro.capa}
                                                    alt=""
                                                    className="size-[48px] shrink-0 rounded-[8px] object-cover"
                                                />
                                            ) : (
                                                <span className="flex size-[48px] shrink-0 items-center justify-center rounded-[8px] bg-(--brotero-branco) text-[10px] text-(--brotero-texto-cinza)">
                                                    Sem capa
                                                </span>
                                            )}
                                            <span className="min-w-0">
                                                <span className="block font-semibold">{s.livro.titulo}</span>
                                                <span className="block text-[12px] text-(--brotero-texto-cinza)">
                                                    {s.livro.autor}
                                                </span>
                                            </span>
                                        </Link>
                                        {s.nota ? (
                                            <p className="m-0 text-[13px] leading-snug opacity-90">{s.nota}</p>
                                        ) : null}
                                        <span className="text-[10px] text-(--brotero-texto-cinza)">
                                            {formatHora(s.criado_em)}
                                        </span>
                                    </div>
                                );
                            })
                        )}
                        <div ref={fimRef} />
                    </div>
                ) : null}

                {podeEscrever ? (
                    <div className="shrink-0 border-t border-(--brotero-borda-suave) bg-(--brotero-branco) px-[14px] py-[12px]">
                        {conversa.pode_partilhar_livros ? (
                            <SugerirLivroInline
                                conversaId={conversa.id}
                                aberto={sugerirLivroAberto}
                                outroLabel={conversa.outro_label}
                            />
                        ) : null}
                        <div className="flex items-center gap-[8px] rounded-[24px] border border-(--brotero-borda-suave) bg-(--brotero-branco) px-[6px] py-[6px] pl-[8px] shadow-[inset_0_1px_0_rgba(255,255,255,0.65),0_1px_2px_rgba(42,38,48,0.05)]">
                            {conversa.pode_partilhar_livros ? (
                                <button
                                    type="button"
                                    className={cn(
                                        'inline-flex size-[42px] shrink-0 cursor-pointer items-center justify-center rounded-full border text-(--brotero-texto) transition-colors',
                                        sugerirLivroAberto
                                            ? 'border-violet-300 bg-violet-50 text-(--brotero-primaria) shadow-sm'
                                            : 'border-transparent bg-(--brotero-fundo) hover:bg-(--brotero-fundo) hover:opacity-[0.92]',
                                    )}
                                    onClick={() => setSugerirLivroAberto((v) => !v)}
                                    aria-expanded={sugerirLivroAberto}
                                    aria-label={
                                        sugerirLivroAberto
                                            ? 'Fechar sugestão de livro'
                                            : 'Sugerir um livro do catálogo'
                                    }
                                    title="Sugerir livro"
                                >
                                    <BookPlus className="size-[21px]" aria-hidden />
                                </button>
                            ) : (
                                <span className="w-0 shrink-0" aria-hidden />
                            )}
                            <Form
                                action={basePath}
                                method="post"
                                className="flex min-w-0 flex-1 items-center gap-[6px]"
                            >
                                <textarea
                                    ref={mensagemRef}
                                    name="body"
                                    required
                                    rows={1}
                                    maxLength={2000}
                                    onInput={ajustarAlturaMensagem}
                                    className="min-h-[44px] max-h-[168px] min-w-0 flex-1 resize-none overflow-y-auto border-0 bg-transparent px-[8px] py-[10px] text-[15px] leading-snug text-(--brotero-texto) placeholder:text-(--brotero-texto-cinza) focus-visible:rounded-[12px] focus-visible:ring-2 focus-visible:ring-(--brotero-primaria)/25 focus-visible:outline-none"
                                    placeholder="Mensagem…"
                                />
                                <button
                                    type="submit"
                                    className="inline-flex size-[44px] shrink-0 cursor-pointer items-center justify-center rounded-full border-0 bg-(--brotero-primaria) text-white shadow-sm transition-[transform,opacity] hover:opacity-95 active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--brotero-primaria)"
                                    aria-label="Enviar mensagem"
                                >
                                    <Send className="size-[20px]" aria-hidden strokeWidth={2} />
                                </button>
                            </Form>
                        </div>
                    </div>
                ) : null}
            </div>
        </BibliotecaContaLayout>
    );
}
