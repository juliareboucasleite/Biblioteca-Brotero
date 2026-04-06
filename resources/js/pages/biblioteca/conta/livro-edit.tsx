import { Head, useForm, usePage } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { BibliotecaContaLayout } from '@/components/biblioteca/BibliotecaContaLayout';

type BookEditPayload = {
    id: number;
    title: string;
    description: string;
    isbn: string;
    published_year: string;
    pages: string;
    language: string;
    publisher: string;
    authors_input: string;
    categories_input: string;
    cover_image: string | null;
};

type Props = {
    book: BookEditPayload;
};

export default function BibliotecaContaLivroEdit({ book }: Props) {
    const { flash } = usePage().props;
    const updateUrl = `/biblioteca/conta/balcao/livros/${book.id}`;

    const form = useForm({
        _method: 'put',
        title: book.title,
        description: book.description,
        isbn: book.isbn,
        published_year: book.published_year,
        pages: book.pages,
        language: book.language,
        publisher: book.publisher,
        authors_input: book.authors_input,
        categories_input: book.categories_input,
        cover: null as File | null,
    });

    function submit(e: FormEvent): void {
        e.preventDefault();
        form.post(updateUrl, {
            forceFormData: true,
            preserveScroll: true,
        });
    }

    return (
        <BibliotecaContaLayout title="Editar livro" secao="livro-novo">
            <Head title={`Editar: ${book.title} — Biblioteca`} />

            {flash?.success ? (
                <p
                    className="m-0 mb-[12px] rounded-(--raio) border border-emerald-200 bg-emerald-50 px-[14px] py-[10px] text-[13px] text-emerald-900"
                    role="status"> {flash.success} </p>
            ) : null}
            {flash?.error ? (
                <p
                    className="m-0 mb-[12px] rounded-(--raio) border border-red-200 bg-red-50 px-[14px] py-[10px] text-[13px] text-red-900"
                    role="alert"> {flash.error} </p>
            ) : null}

            <p className="m-0 mb-[20px] text-[14px] text-(--brotero-texto-cinza)">
                Alterações reflectem-se de imediato no catálogo. Deixe «Capa» em branco para manter a imagem actual.
                Capa nova: JPEG, PNG ou WebP (máx. 5&nbsp;MB).
            </p>

            {book.cover_image ? (
                <div className="mx-auto mb-[20px] max-w-[640px]">
                    <p className="m-0 mb-[8px] text-[13px] font-semibold text-(--brotero-texto)">Capa actual</p>
                    <img
                        src={book.cover_image}
                        alt=""
                        className="max-h-[200px] rounded-(--raio) border border-(--brotero-borda) object-contain"
                    />
                </div>
            ) : null}

            <form
                className="mx-auto flex max-w-[640px] flex-col gap-[16px]"
                encType="multipart/form-data"
                onSubmit={submit}
            >
                <div className="grid gap-[6px]">
                    <label htmlFor="le-title" className="text-[13px] font-semibold text-(--brotero-texto)"> Título <span className="text-red-600">*</span></label>
                    <input
                        id="le-title"
                        className="rounded-(--raio) border border-(--brotero-borda) bg-(--brotero-branco) px-[12px] py-[10px] text-[14px] text-(--brotero-texto)"
                        value={form.data.title}
                        onChange={(e) => form.setData('title', e.target.value)}
                        required
                        maxLength={500}
                    />
                    {form.errors.title ? (
                        <p className="m-0 text-[12px] text-red-600">{form.errors.title}</p>
                    ) : null}
                </div>

                <div className="grid gap-[6px]">
                    <label htmlFor="le-desc" className="text-[13px] font-semibold text-(--brotero-texto)"> Descrição / sinopse</label><textarea
                        id="le-desc"
                        rows={6}
                        className="rounded-(--raio) border border-(--brotero-borda) bg-(--brotero-branco) px-[12px] py-[10px] text-[14px] text-(--brotero-texto)"
                        value={form.data.description}
                        onChange={(e) => form.setData('description', e.target.value)}
                    />
                    {form.errors.description ? (
                        <p className="m-0 text-[12px] text-red-600">{form.errors.description}</p>
                    ) : null}
                </div>

                <div className="grid gap-[6px] sm:grid-cols-2 sm:gap-[16px]">
                    <div className="grid gap-[6px]">
                        <label htmlFor="le-isbn" className="text-[13px] font-semibold text-(--brotero-texto)">ISBN (opcional)</label>
                        <input
                            id="le-isbn"
                            className="rounded-(--raio) border border-(--brotero-borda) bg-(--brotero-branco) px-[12px] py-[10px] text-[14px] text-(--brotero-texto)"
                            value={form.data.isbn}
                            onChange={(e) => form.setData('isbn', e.target.value)}
                            maxLength={32}
                        />
                        {form.errors.isbn ? (
                            <p className="m-0 text-[12px] text-red-600">{form.errors.isbn}</p>
                        ) : null}
                    </div>
                    <div className="grid gap-[6px]">
                        <label htmlFor="le-lang" className="text-[13px] font-semibold text-(--brotero-texto)"> Idioma (ex.: português, inglês)</label>
                        <input
                            id="le-lang"
                            className="rounded-(--raio) border border-(--brotero-borda) bg-(--brotero-branco) px-[12px] py-[10px] text-[14px] text-(--brotero-texto)"
                            value={form.data.language}
                            onChange={(e) => form.setData('language', e.target.value)}
                            maxLength={32}
                        />
                        {form.errors.language ? (
                            <p className="m-0 text-[12px] text-red-600">{form.errors.language}</p>
                        ) : null}
                    </div>
                </div>

                <div className="grid gap-[6px] sm:grid-cols-2 sm:gap-[16px]">
                    <div className="grid gap-[6px]">
                        <label htmlFor="le-year" className="text-[13px] font-semibold text-(--brotero-texto)">Ano de edição</label>
                        <input
                            id="le-year"
                            type="number"
                            min={1000}
                            max={2100}
                            className="rounded-(--raio) border border-(--brotero-borda) bg-(--brotero-branco) px-[12px] py-[10px] text-[14px] text-(--brotero-texto)"
                            value={form.data.published_year}
                            onChange={(e) => form.setData('published_year', e.target.value)}
                        />
                        {form.errors.published_year ? (
                            <p className="m-0 text-[12px] text-red-600">{form.errors.published_year}</p>
                        ) : null}
                    </div>
                    <div className="grid gap-[6px]">
                        <label htmlFor="le-pages" className="text-[13px] font-semibold text-(--brotero-texto)">Páginas</label>
                        <input
                            id="le-pages"
                            type="number"
                            min={1}
                            className="rounded-(--raio) border border-(--brotero-borda) bg-(--brotero-branco) px-[12px] py-[10px] text-[14px] text-(--brotero-texto)"
                            value={form.data.pages}
                            onChange={(e) => form.setData('pages', e.target.value)}
                        />
                        {form.errors.pages ? (
                            <p className="m-0 text-[12px] text-red-600">{form.errors.pages}</p>
                        ) : null}
                    </div>
                </div>

                <div className="grid gap-[6px]">
                    <label htmlFor="le-pub" className="text-[13px] font-semibold text-(--brotero-texto)">Editora</label>
                    <input
                        id="le-pub"
                        className="rounded-(--raio) border border-(--brotero-borda) bg-(--brotero-branco) px-[12px] py-[10px] text-[14px] text-(--brotero-texto)"
                        value={form.data.publisher}
                        onChange={(e) => form.setData('publisher', e.target.value)}
                        maxLength={255}
                    />
                    {form.errors.publisher ? (
                        <p className="m-0 text-[12px] text-red-600">{form.errors.publisher}</p>
                    ) : null}
                </div>

                <div className="grid gap-[6px]">
                    <label htmlFor="le-auth" className="text-[13px] font-semibold text-(--brotero-texto)">Autores (separar por vírgula ou nova linha)</label>
                    <textarea
                        id="le-auth"
                        rows={2}
                        className="rounded-(--raio) border border-(--brotero-borda) bg-(--brotero-branco) px-[12px] py-[10px] text-[14px] text-(--brotero-texto)"
                        value={form.data.authors_input}
                        onChange={(e) => form.setData('authors_input', e.target.value)}
                        placeholder="ex.: José Saramago"
                    />
                    {form.errors.authors_input ? (
                        <p className="m-0 text-[12px] text-red-600">{form.errors.authors_input}</p>
                    ) : null}
                </div>

                <div className="grid gap-[6px]">
                    <label htmlFor="le-cat" className="text-[13px] font-semibold text-(--brotero-texto)">Categorias (opcional, separar por vírgula)</label>
                    <textarea
                        id="le-cat"
                        rows={2}
                        className="rounded-(--raio) border border-(--brotero-borda) bg-(--brotero-branco) px-[12px] py-[10px] text-[14px] text-(--brotero-texto)"
                        value={form.data.categories_input}
                        onChange={(e) => form.setData('categories_input', e.target.value)}
                        placeholder="ex.: Ficção, Romance"
                    />
                    {form.errors.categories_input ? (
                        <p className="m-0 text-[12px] text-red-600">{form.errors.categories_input}</p>
                    ) : null}
                </div>

                <div className="grid gap-[6px]">
                    <label htmlFor="le-cover" className="text-[13px] font-semibold text-(--brotero-texto)">Substituir capa (opcional)</label>
                    <input
                        id="le-cover"
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="text-[14px] text-(--brotero-texto)"
                        onChange={(e) => form.setData('cover', e.target.files?.[0] ?? null)}
                    />
                    {form.errors.cover ? (
                        <p className="m-0 text-[12px] text-red-600">{form.errors.cover}</p>
                    ) : null}
                </div>

                <div className="flex flex-wrap gap-[12px] pt-[8px]">
                    <button
                        type="submit"
                        disabled={form.processing}
                        className="cursor-pointer rounded-(--raio) border-0 bg-(--brotero-primaria) px-[20px] py-[12px] text-[15px] font-semibold text-white hover:opacity-90 disabled:opacity-60"
                    >{form.processing ? 'A guardar…' : 'Guardar alterações'}</button>
                    <a
                        href={`/biblioteca/livro/${book.id}`}
                        className="inline-flex items-center rounded-(--raio) border border-(--brotero-borda) bg-(--brotero-branco) px-[20px] py-[12px] text-[15px] font-semibold text-(--brotero-texto) no-underline hover:bg-(--brotero-laranja-hover)"
                    > Voltar à ficha </a>
                    <a
                        href="/biblioteca/conta/balcao"
                        className="inline-flex items-center rounded-(--raio) border border-(--brotero-borda) bg-(--brotero-branco) px-[20px] py-[12px] text-[15px] font-semibold text-(--brotero-texto) no-underline hover:bg-(--brotero-laranja-hover)"
                    >Balcão</a>
                </div>
            </form>
        </BibliotecaContaLayout>
    );
}
