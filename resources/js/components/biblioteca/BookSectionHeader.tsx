import type { ReactNode } from 'react';

type BookSectionHeaderProps = {
    title: string;
    action?: ReactNode;
};

export function BookSectionHeader({ title, action }: BookSectionHeaderProps) {
    return (
        <div className="flex items-baseline justify-between gap-[12px] mb-[12px] px-[2px]">
            <h3 className="m-0 text-[1.2rem] font-bold text-(--brotero-texto)">{title}</h3>
            {action ?? null}
        </div>
    );
}
