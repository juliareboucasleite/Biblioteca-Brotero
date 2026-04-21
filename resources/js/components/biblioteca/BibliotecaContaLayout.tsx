import { Head, Link, router, usePage } from '@inertiajs/react';
import type { ReactNode } from 'react';
import { BibliotecaCatalogShell } from '@/components/biblioteca/BibliotecaCatalogShell';
import { cn } from '@/lib/utils';

type ContaSecao =
    | 'balcao'
    | 'livro-novo'
    | 'livro-import'
    | 'pedidos'
    | 'historico'
    | 'favoritos'
    | 'mensagens'
    | 'perfil';

type BibliotecaContaLayoutProps = {
    title: string;
    secao: ContaSecao;
    children: ReactNode;
    /** Faz o conteúdo crescer até à altura útil da coluna (ex.: conversa em ecrã grande). */
    ocuparAlturaConteudo?: boolean;
};

const linkBase =
    'text-[14px] px-[12px] py-[8px] rounded-(--raio) no-underline text-(--brotero-texto-link) hover:text-(--brotero-texto-link-hover) hover:underline';

export function BibliotecaContaLayout({
    title,
    secao,
    children,
    ocuparAlturaConteudo = false,
}: BibliotecaContaLayoutProps) {
    const patron = usePage().props.auth?.patron;
    const patronRole = patron?.role ?? 'student';
    const isStaff = patronRole === 'staff';
    const perfilLabel =
        patronRole === 'staff'
            ? 'Funcionária/o'
            : patronRole === 'teacher'
              ? 'Professor/a'
              : 'Aluno/a';
    const modoBiblioteca =
        isStaff && patron?.portal_mode === 'bibliotecaria';

    const active = (s: ContaSecao) =>
        cn(linkBase, s === secao && 'font-bold text-(--brotero-texto) no-underline pointer-events-none');

    return (
        <>
            <Head title={title} />
            <BibliotecaCatalogShell>
                <div
                    className={cn(
                        'w-full pb-[8px]',
                        ocuparAlturaConteudo && 'flex min-h-0 flex-1 flex-col',
                    )}
                >
                    <nav
                        className={cn(
                            'mb-[20px] flex flex-wrap items-center gap-[8px] border-b border-(--brotero-borda-suave) pb-[12px]',
                            ocuparAlturaConteudo && 'shrink-0',
                        )}
                        aria-label="Área do leitor"
                    >
                        <span
                            className="rounded-full border border-(--brotero-borda) bg-(--brotero-branco) px-[10px] py-[4px] text-[12px] font-semibold text-(--brotero-texto-cinza)"
                            title="Perfil de acesso"
                        >
                            Perfil: {perfilLabel}
                        </span>
                        {modoBiblioteca ? (
                            <span
                                className="rounded-full border border-(--brotero-borda) bg-(--brotero-branco) px-[10px] py-[4px] text-[12px] font-semibold text-(--brotero-texto)"
                                title="Sessão como pessoal da biblioteca"
                            >
                                Modo bibliotecária/o
                            </span>
                        ) : null}
                        {isStaff ? (
                            <button
                                type="button"
                                className={cn(
                                    'cursor-pointer rounded-full border px-[10px] py-[4px] text-[12px] font-semibold',
                                    modoBiblioteca
                                        ? 'border-emerald-200 bg-emerald-50 text-emerald-900 hover:bg-emerald-100'
                                        : 'border-sky-200 bg-sky-50 text-sky-900 hover:bg-sky-100',
                                )}
                                onClick={() =>
                                    router.post('/biblioteca/modo', {
                                        portal_mode: modoBiblioteca ? 'comunidade' : 'bibliotecaria',
                                    })
                                }
                            >
                                {modoBiblioteca ? 'Mudar para comunidade' : 'Mudar para bibliotecária/o'}
                            </button>
                        ) : null}
                        {modoBiblioteca ? (
                            <>
                                <Link href="/biblioteca/conta/balcao" className={active('balcao')} preserveScroll>
                                    Balcão (todos)
                                </Link>
                                <Link
                                    href="/biblioteca/conta/balcao/livros/novo"
                                    className={active('livro-novo')}
                                    preserveScroll
                                >
                                    Novo livro
                                </Link>
                                <Link
                                    href="/biblioteca/conta/balcao/livros/importar"
                                    className={active('livro-import')}
                                    preserveScroll
                                >
                                    Importar livros
                                </Link>
                            </>
                        ) : null}
                        <Link href="/biblioteca/conta/pedidos" className={active('pedidos')} preserveScroll>
                            Pedidos ativos
                        </Link>
                        <Link href="/biblioteca/conta/historico" className={active('historico')} preserveScroll>
                            Histórico
                        </Link>
                        {!modoBiblioteca ? (
                            <>
                                <Link href="/biblioteca/conta/favoritos" className={active('favoritos')} preserveScroll>
                                    Listas
                                </Link>
                                <Link href="/biblioteca/conta/mensagens" className={active('mensagens')} preserveScroll>
                                    Conversas
                                </Link>
                            </>
                        ) : null}
                        <Link href="/biblioteca/conta/perfil" className={active('perfil')} preserveScroll>
                            Perfil
                        </Link>
                        <button
                            type="button"
                            className={cn(linkBase, 'cursor-pointer border-0 bg-transparent font-inherit')}
                            onClick={() => router.post('/biblioteca/sair')}
                        >
                            Sair
                        </button>
                    </nav>
                    {ocuparAlturaConteudo ? (
                        <div className="flex min-h-0 flex-1 flex-col">{children}</div>
                    ) : (
                        children
                    )}
                </div>
            </BibliotecaCatalogShell>
        </>
    );
}
