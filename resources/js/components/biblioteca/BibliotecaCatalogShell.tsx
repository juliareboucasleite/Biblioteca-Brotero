import type { ReactNode } from 'react';
import { BibliotecaCatalogHelpPanel } from '@/components/biblioteca/BibliotecaCatalogHelpPanel';
import { BibliotecaCatalogNav } from '@/components/biblioteca/BibliotecaCatalogNav';
import { BroteroFooter } from '@/components/BroteroFooter';

type BibliotecaCatalogShellProps = {
    children: ReactNode;
};

/**
 * Layout catálogo: barra lateral, conteúdo central; ajuda em balão flutuante (canto).
 */
export function BibliotecaCatalogShell({
    children,
}: BibliotecaCatalogShellProps) {
    return (
        <div className="biblioteca-catalog-shell flex min-h-screen flex-col bg-(--brotero-fundo) text-(--brotero-texto)">
            <a
                href="#conteudo-catalogo"
                className="absolute top-3 left-[-9999px] z-[300] inline-block rounded-[12px] border-2 border-transparent bg-(--brotero-branco) px-[14px] py-[10px] text-[14px] font-semibold text-(--brotero-texto) shadow-none outline-none focus:left-3 focus:border-(--brotero-primaria) focus:shadow-[0_8px_24px_rgba(42,38,48,0.15)]"
            >
                Saltar para o conteúdo
            </a>
            <div className="flex min-h-0 flex-1 flex-col lg:flex-row lg:items-stretch">
                <div className="lg:flex lg:shrink-0 lg:items-start lg:py-5 lg:pl-4 lg:pr-1">
                    <BibliotecaCatalogNav />
                </div>
                <div
                    id="conteudo-catalogo"
                    className="mx-auto w-full max-w-(--max-largura) min-h-0 min-w-0 flex-1 scroll-mt-4 px-[12px] pb-[28px] sm:px-[16px] lg:pt-5 lg:pb-[40px] lg:pr-5"
                    tabIndex={-1}
                >
                    {children}
                </div>
            </div>
            <BroteroFooter />
            <BibliotecaCatalogHelpPanel />
        </div>
    );
}
