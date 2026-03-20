import type { ReactNode } from 'react';

type BibliotecaSectionPlaceholderProps = {
    children: ReactNode;
};

export function BibliotecaSectionPlaceholder({ children }: BibliotecaSectionPlaceholderProps) {
    return (
        <p className="m-0 p-[16px] bg-(--brotero-branco) border border-dashed border-(--brotero-borda) rounded-(--raio) text-[14px] text-(--brotero-texto-cinza) col-span-full">
            {children}
        </p>
    );
}
