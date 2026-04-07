import { Link, usePage } from '@inertiajs/react';
import { Pencil } from 'lucide-react';
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
    const patron = usePage().props.auth?.patron;
    const modoBibliotecaria =
        patron?.is_librarian === true && patron?.portal_mode === 'bibliotecaria';
    const editarLivroHref = modoBibliotecaria ? `/biblioteca/conta/balcao/livros/${livro.id}/editar` : null;

    const details = bookApi?.details ?? null;
    const categoriasLabel =
        bookApi?.categories
            ?.map((c) => c?.name?.trim())
            .filter((x): x is string => Boolean(x))
            .join(', ') ?? '';
    const disponivel =
        bookApi?.available === true ? true : bookApi?.available === false ? false : null;

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
            <div className="mb-[8px] flex flex-wrap items-start gap-[12px]">
                <h1
                    className="m-0 flex-1 min-w-0 text-[1.5rem] font-bold text-(--brotero-texto) leading-[1.3]"
                    id="pagina-livro-title"
                >
                    {livro.titulo}
                </h1>
                {editarLivroHref ? (
                    <Link
                        href={editarLivroHref}
                        className="inline-flex shrink-0 items-center justify-center rounded-(--raio) border border-(--brotero-borda) bg-(--brotero-branco) p-[10px] text-(--brotero-texto) hover:bg-(--brotero-laranja-hover)"
                        title="Editar ficha do livro (balcão)"
                        aria-label="Editar ficha do livro"
                        preserveScroll
                    >
                        <Pencil className="size-[20px]" aria-hidden />
                    </Link>
                ) : null}
            </div>
            <p className="m-0 mb-[16px] text-[15px] text-(--brotero-texto-cinza)" id="pagina-livro-author">
                {authorsLabel}
            </p>
            {categoriasLabel !== '' ? (
                <p className="m-0 mb-[10px] text-[14px] text-(--brotero-texto-cinza)">
                    <span className="font-semibold text-(--brotero-texto)">Categorias: </span>
                    {categoriasLabel}
                </p>
            ) : null}
            {disponivel !== null && !bookApi?.has_ebook ? (
                <p
                    className={`m-0 mb-[12px] text-[14px] font-semibold ${disponivel ? 'text-green-700' : 'text-amber-800'}`}
                >
                    {disponivel ? 'Disponível para requisição' : 'Indisponível no momento (exemplar requisitado)'}
                </p>
            ) : null}
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
