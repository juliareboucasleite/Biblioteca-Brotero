type BookMetaFieldProps = {
    label: string;
    value: string | number | null | undefined;
};

export function BookMetaField({ label, value }: BookMetaFieldProps) {
    if (value === null || value === undefined || value === '') {
        return null;
    }

    return (
        <div className="pagina-livro-meta-item">
            <strong className="block text-[13px] font-bold text-(--brotero-texto-cinza) mb-[2px]">
                {label}
            </strong>
            <span className="text-[14px] text-(--brotero-texto)">{value}</span>
        </div>
    );
}
