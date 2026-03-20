import type { ReactNode } from 'react';
import { BroteroFooter } from '@/components/BroteroFooter';
import { BroteroHeader } from '@/components/BroteroHeader';

type BibliotecaPageShellProps = {
    children: ReactNode;
};

/** Layout exterior comum: fundo Brotero, cabeçalho, conteúdo e rodapé. */
export function BibliotecaPageShell({ children }: BibliotecaPageShellProps) {
    return (
        <div className="min-h-screen flex flex-col bg-(--brotero-fundo) text-(--brotero-texto)">
            <BroteroHeader />
            {children}
            <BroteroFooter />
        </div>
    );
}
