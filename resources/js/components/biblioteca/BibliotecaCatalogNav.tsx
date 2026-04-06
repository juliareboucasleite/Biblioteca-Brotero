import { usePage } from '@inertiajs/react';
import {
    BookMarked,
    Heart,
    LayoutGrid,
    Library,
    LogIn,
    MessageCircle,
    Sparkles,
    User,
} from 'lucide-react';
import type { ComponentType } from 'react';
import { cn } from '@/lib/utils';
import type { Auth } from '@/types/auth';

function normalizePath(url: string): string {
    const path = url.split('?')[0]?.split('#')[0] ?? '/';

    if (path === '' || path === '/') {
        return '/';
    }

    return path.endsWith('/') && path.length > 1 ? path.slice(0, -1) : path;
}

function isNavActive(currentUrl: string, href: string): boolean {
    const path = normalizePath(currentUrl);

    if (href === '/biblioteca') {
        return path === '/biblioteca';
    }

    return path === href || path.startsWith(`${href}/`);
}

/** Secção «Conta» (pedidos, perfil, balcão, …), exclui rotas com atalho próprio no rail. */
function isContaRailSectionActive(currentUrl: string): boolean {
    const path = normalizePath(currentUrl);

    if (!path.startsWith('/biblioteca/conta')) {
        return false;
    }

    if (path.startsWith('/biblioteca/conta/mensagens')) {
        return false;
    }

    if (path.startsWith('/biblioteca/conta/favoritos')) {
        return false;
    }

    return true;
}

type NavItemProps = {
    href: string;
    title: string;
    icon: ComponentType<{ className?: string; strokeWidth?: number }>;
    label: string;
    active: boolean;
};

function NavItem({ href, title, icon: Icon, label, active }: NavItemProps) {
    return (
        <a
            href={href}
            title={title}
            className={cn(
                'group flex min-w-[4.5rem] shrink-0 flex-col items-center justify-center gap-[6px] rounded-[18px] px-[8px] py-[11px] no-underline transition-[background-color,color,box-shadow,transform] duration-200 motion-reduce:transition-none',
                'lg:min-w-[5.25rem] lg:px-[10px] lg:py-[13px]',
                active
                    ? 'bg-(--brotero-primaria)/14 text-(--brotero-primaria) shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]'
                    : 'text-(--brotero-texto-cinza) hover:bg-(--brotero-borda-suave)/55 hover:text-(--brotero-texto)',
                'focus-visible:outline focus-visible:outline-2 focus-visible:outline-(--brotero-primaria) focus-visible:outline-offset-2',
            )}
        >
            <span
                className={cn(
                    'flex size-[40px] items-center justify-center rounded-2xl transition-[background-color,box-shadow] duration-200 motion-reduce:transition-none lg:size-[42px]',
                    active
                        ? 'bg-(--brotero-branco) shadow-[0_4px_14px_rgba(74,101,114,0.12)]'
                        : 'bg-(--brotero-fundo)/90 group-hover:bg-(--brotero-branco)/90',
                )}
            >
                <Icon className="size-[21px] shrink-0" strokeWidth={1.65} aria-hidden />
            </span>
            <span className="max-w-[5.5rem] text-center text-[10px] font-semibold leading-snug tracking-wide lg:text-[11px]">
                {label}
            </span>
        </a>
    );
}

export function BibliotecaCatalogNav() {
    const page = usePage<{ auth: Auth }>();
    const { auth } = page.props;
    const url = page.url;
    const patron = auth.patron;

    return (
        <nav
            aria-label="Navegação do catálogo"
            className={cn(
                'shrink-0',
                /* Mobile: faixa tipo cartão com cantos redondos */
                'mx-3 mt-3 rounded-[22px] border border-(--brotero-borda-suave)/90 bg-(--brotero-branco)/92 shadow-[0_10px_32px_rgba(42,38,48,0.07)] backdrop-blur-md',
                'flex flex-row items-center justify-start gap-[8px] overflow-x-auto px-[10px] py-[10px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
                /* Desktop: ilha vertical flutuante */
                'lg:sticky lg:top-5 lg:mx-0 lg:mt-0 lg:max-h-[calc(100vh-2.5rem)] lg:w-auto lg:self-start lg:flex-col lg:items-center lg:gap-[6px] lg:overflow-y-auto lg:overflow-x-visible lg:rounded-[32px] lg:border lg:border-(--brotero-borda-suave) lg:bg-(--brotero-branco)/96 lg:px-[12px] lg:py-[18px] lg:shadow-[0_16px_48px_rgba(42,38,48,0.09),0_2px_8px_rgba(42,38,48,0.04)] lg:backdrop-blur-xl lg:[scrollbar-width:thin]',
            )}
        >
            <a
                href="/biblioteca"
                className="mb-0 hidden p-[3px] lg:mb-[6px] lg:flex lg:justify-center"
                title="Biblioteca Brotero"
            >
                <span className="flex size-[50px] items-center justify-center rounded-[22px] bg-linear-to-br from-(--brotero-borda-suave) to-(--brotero-fundo) p-[5px] shadow-[0_6px_20px_rgba(42,38,48,0.08)] ring-1 ring-(--brotero-borda-suave)/90">
                    <img
                        src="/images/logo.png"
                        alt=""
                        className="size-[40px] rounded-[18px] object-cover shadow-inner"
                    />
                </span>
            </a>

            <div className="flex flex-none flex-row items-center gap-[8px] lg:flex-col lg:gap-[6px]">
                <NavItem
                    href="/biblioteca"
                    title="Início"
                    icon={LayoutGrid}
                    label="Início"
                    active={isNavActive(url, '/biblioteca')}
                />
                <NavItem
                    href="/biblioteca/livros"
                    title="Todos os livros"
                    icon={Library}
                    label="Todos"
                    active={isNavActive(url, '/biblioteca/livros')}
                />
                <NavItem
                    href="/biblioteca/descobertas"
                    title="Descobertas da comunidade"
                    icon={Sparkles}
                    label="Descobertas"
                    active={isNavActive(url, '/biblioteca/descobertas')}
                />
                <NavItem
                    href={patron ? '/biblioteca/conta/mensagens' : '/biblioteca/entrar'}
                    title={patron ? 'Mensagens com outros leitores' : 'Entrar para mensagens'}
                    icon={MessageCircle}
                    label="Chats"
                    active={isNavActive(url, '/biblioteca/conta/mensagens')}
                />
                <NavItem
                    href={patron ? '/biblioteca/conta/favoritos' : '/biblioteca/entrar'}
                    title={patron ? 'Favoritos' : 'Entrar para favoritos'}
                    icon={Heart}
                    label="Favoritos"
                    active={isNavActive(url, '/biblioteca/conta/favoritos')}
                />
                <NavItem
                    href={patron ? '/biblioteca/conta/pedidos' : '/biblioteca/entrar'}
                    title={patron ? 'Minha conta' : 'Entrar'}
                    icon={patron ? User : LogIn}
                    label={patron ? 'Conta' : 'Entrar'}
                    active={
                        patron ? isContaRailSectionActive(url) : isNavActive(url, '/biblioteca/entrar')
                    }
                />
                <NavItem
                    href="/ranking"
                    title="Ranking de leitores"
                    icon={BookMarked}
                    label="Ranking"
                    active={isNavActive(url, '/ranking')}
                />
            </div>
        </nav>
    );
}
