import { BookMetaField } from '@/components/biblioteca/BookMetaField';
import type { BookApi, LivroCatalogo } from '@/types/biblioteca';

type BookDetailContentProps = {
    livro: LivroCatalogo;
    placeholder: boolean;
    bookApi: BookApi | null;
    authorsLabel: string;
};

export function BookDetailContent({
    livro,
    placeholder,
    bookApi,
    authorsLabel,
}: BookDetailContentProps) {
    const details = bookApi?.details ?? null;

    if (placeholder) {
        return (
            <div className="min-w-0">
                <h1
                    className="m-0 mb-[8px] text-[1.5rem] font-bold text-(--brotero-texto) leading-[1.3]"
                    id="pagina-livro-title"
                >
                    Livro
                </h1>
                <p className="m-0">Selecione um livro no catálogo para ver a ficha e requisitar.</p>
            </div>
        );
    }

    return (
        <div className="min-w-0">
            <h1
                className="m-0 mb-[8px] text-[1.5rem] font-bold text-(--brotero-texto) leading-[1.3]"
                id="pagina-livro-title"
            >
                {livro.titulo}
            </h1>
            <p className="m-0 mb-[16px] text-[15px] text-(--brotero-texto-cinza)" id="pagina-livro-author">
                {authorsLabel}
            </p>
            <div className="text-[15px] leading-[1.6] text-(--brotero-texto)">
                <p className="m-0" id="pagina-livro-desc">
                    {bookApi?.description ?? livro.desc}
                </p>
            </div>

            <div className="mt-[18px] p-[16px] border border-(--brotero-borda) rounded-[6px] bg-(--brotero-branco)">
                <h3 className="m-0 mb-[10px] text-[16px] font-bold text-(--brotero-texto)">
                    Detalhes do livro
                </h3>
                <div className="grid grid-cols-2 gap-x-[20px] gap-y-[10px]">
                    <BookMetaField label="ISBN" value={bookApi?.isbn} />
                    <BookMetaField label="Ano" value={bookApi?.published_year} />
                    <BookMetaField label="Páginas" value={bookApi?.pages} />
                    <BookMetaField label="Idioma" value={bookApi?.language} />
                    <BookMetaField label="Editora" value={details?.publisher} />
                </div>
            </div>
        </div>
    );
}
