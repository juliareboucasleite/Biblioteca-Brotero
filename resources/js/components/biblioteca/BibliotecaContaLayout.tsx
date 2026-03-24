import { Head, Link, router } from '@inertiajs/react';
import type { ReactNode } from 'react';
import { BroteroFooter } from '@/components/BroteroFooter';
import { BroteroHeader } from '@/components/BroteroHeader';
import { cn } from '@/lib/utils';

type ContaSecao = 'pedidos' | 'historico' | 'favoritos' | 'perfil';

type BibliotecaContaLayoutProps = {
    title: string;
    secao: ContaSecao;
    children: ReactNode;
};

const linkBase =
    'text-[14px] px-[12px] py-[8px] rounded-(--raio) no-underline text-(--brotero-texto-link) hover:text-(--brotero-texto-link-hover) hover:underline';

export function BibliotecaContaLayout({ title, secao, children }: BibliotecaContaLayoutProps) {
    const active = (s: ContaSecao) =>
        cn(linkBase, s === secao && 'font-bold text-(--brotero-texto) no-underline pointer-events-none');

    return (
        <>
            <Head title={title} />
            <div className="min-h-screen flex flex-col bg-(--brotero-fundo) text-(--brotero-texto)">
                <BroteroHeader />
                <div className="w-full max-w-(--max-largura) mx-auto px-[10px] flex-1 pb-[32px]">
                    <nav
                        className="flex flex-wrap items-center gap-[8px] mb-[20px] pb-[12px] border-b border-(--brotero-borda)"
                        aria-label="Área do leitor"
                    >
                        <Link href="/biblioteca/conta/pedidos" className={active('pedidos')} preserveScroll>
                            Pedidos ativos
                        </Link>
                        <Link href="/biblioteca/conta/historico" className={active('historico')} preserveScroll>
                            Histórico
                        </Link>
                        <Link href="/biblioteca/conta/favoritos" className={active('favoritos')} preserveScroll>
                            Favoritos
                        </Link>
                        <Link href="/biblioteca/conta/perfil" className={active('perfil')} preserveScroll>
                            Perfil
                        </Link>
                        <button
                            type="button"
                            className={cn(linkBase, 'border-0 bg-transparent cursor-pointer font-inherit')}
                            onClick={() => router.post('/biblioteca/sair')}
                        >
                            Sair
                        </button>
                    </nav>
                    {children}
                </div>
                <BroteroFooter />
            </div>
        </>
    );
}
