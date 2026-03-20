type BookCoverProps = {
    coverSrc: string | null;
    titulo: string;
    placeholder: boolean;
};

export function BookCover({ coverSrc, titulo, placeholder }: BookCoverProps) {
    return (
        <div className="sticky top-[24px]">
            <div
                className="relative aspect-2/3 bg-linear-to-br from-[#e8e8e8] to-[#d0d0d0] rounded-[6px] w-full"
                id="pagina-livro-capa"
            >
                {coverSrc ? (
                    <img
                        className="absolute inset-0 w-full h-full object-cover rounded-[6px]"
                        src={coverSrc}
                        alt={`Capa do livro ${placeholder ? 'Livro' : titulo}`}
                        loading="lazy"
                        referrerPolicy="no-referrer"
                    />
                ) : null}
            </div>
        </div>
    );
}
