import { Head, useForm, usePage } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { BibliotecaContaLayout } from '@/components/biblioteca/BibliotecaContaLayout';

export default function BibliotecaContaLivroNovo() {
    const { flash } = usePage().props;

    const form = useForm({
        title: '',
        description: '',
        isbn: '',
        published_year: '',
        pages: '',
        language: 'pt',
        publisher: '',
        authors_input: '',
        categories_input: '',
        cover: null as File | null,
        ebook: null as File | null,
    });

    function submit(e: FormEvent): void {
        e.preventDefault();
        form.post('/biblioteca/conta/balcao/livros', { forceFormData: true, preserveScroll: true });
    }

    return (
        <BibliotecaContaLayout title="Novo livro (manual)" secao="livro-novo">
            <Head title="Novo livro — Biblioteca" />

            {flash?.success ? (
                <p
                    className="m-0 mb-[12px] rounded-(--raio) border border-emerald-200 bg-emerald-50 px-[14px] py-[10px] text-[13px] text-emerald-900"
                    role="status"
                >
                    {flash.success}
                </p>
            ) : null}
            {flash?.error ? (
                <p
                    className="m-0 mb-[12px] rounded-(--raio) border border-red-200 bg-red-50 px-[14px] py-[10px] text-[13px] text-red-900"
                    role="alert"
                >
                    {flash.error}
                </p>
            ) : null}

            <p className="m-0 mb-[20px] text-[14px] text-(--brotero-texto-cinza)">
                O livro fica imediato no catálogo público. Capa: JPEG, PNG ou WebP (máx. 5&nbsp;MB). Execute{' '}
                <code className="rounded bg-(--brotero-fundo) px-[4px] text-[13px]">php artisan storage:link</code>{' '}
                se as imagens não aparecerem.
            </p>

            <form
                className="mx-auto flex max-w-[640px] flex-col gap-[16px]"
                encType="multipart/form-data"
                onSubmit={submit}
            >
                <div className="grid gap-[6px]">
                    <label htmlFor="ln-title" className="text-[13px] font-semibold text-(--brotero-texto)">
                        Título <span className="text-red-600">*</span>
                    </label>
                    <input
                        id="ln-title"
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
                    <label htmlFor="ln-desc" className="text-[13px] font-semibold text-(--brotero-texto)">
                        Descrição / sinopse
                    </label>
                    <textarea
                        id="ln-desc"
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
                        <label htmlFor="ln-isbn" className="text-[13px] font-semibold text-(--brotero-texto)">
                            ISBN (opcional)
                        </label>
                        <p className="m-0 text-[12px] text-(--brotero-texto-cinza)">
                            Pode indicar ISBN-10 e ISBN-13, separados por vírgula (ex.: 8575226622, 9788575226629).
                        </p>
                        <input
                            id="ln-isbn"
                            className="rounded-(--raio) border border-(--brotero-borda) bg-(--brotero-branco) px-[12px] py-[10px] text-[14px] text-(--brotero-texto)"
                            value={form.data.isbn}
                            onChange={(e) => form.setData('isbn', e.target.value)}
                            maxLength={128}
                        />
                        {form.errors.isbn ? (
                            <p className="m-0 text-[12px] text-red-600">{form.errors.isbn}</p>
                        ) : null}
                    </div>
                    <div className="grid gap-[6px]">
                        <label htmlFor="ln-lang" className="text-[13px] font-semibold text-(--brotero-texto)">
                            Idioma (ex.: português, inglês)
                        </label>
                        <input
                            id="ln-lang"
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
                        <label htmlFor="ln-year" className="text-[13px] font-semibold text-(--brotero-texto)">
                            Ano de edição
                        </label>
                        <input
                            id="ln-year"
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
                        <label htmlFor="ln-pages" className="text-[13px] font-semibold text-(--brotero-texto)">
                            Páginas
                        </label>
                        <input
                            id="ln-pages"
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
                    <label htmlFor="ln-pub" className="text-[13px] font-semibold text-(--brotero-texto)">
                        Editora
                    </label>
                    <input
                        id="ln-pub"
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
                    <label htmlFor="ln-auth" className="text-[13px] font-semibold text-(--brotero-texto)">
                        Autores (separar por vírgula ou nova linha)
                    </label>
                    <textarea
                        id="ln-auth"
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
                    <label htmlFor="ln-cat" className="text-[13px] font-semibold text-(--brotero-texto)">
                        Categorias (opcional, separar por vírgula)
                    </label>
                    <textarea
                        id="ln-cat"
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
                    <label htmlFor="ln-cover" className="text-[13px] font-semibold text-(--brotero-texto)">
                        Capa do livro
                    </label>
                    <input
                        id="ln-cover"
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="text-[14px] text-(--brotero-texto)"
                        onChange={(e) => form.setData('cover', e.target.files?.[0] ?? null)}
                    />
                    {form.errors.cover ? (
                        <p className="m-0 text-[12px] text-red-600">{form.errors.cover}</p>
                    ) : null}
                </div>

                <div className="grid gap-[6px]">
                    <label htmlFor="ln-ebook" className="text-[13px] font-semibold text-(--brotero-texto)">
                        E-book opcional (PDF ou EPUB, máx. 50&nbsp;MB)
                    </label>
                    <p className="m-0 text-[13px] text-(--brotero-texto-cinza)">
                        Ficheiro privado: só leitores com sessão podem abrir no browser. Respeite direitos de autor.
                    </p>
                    <input
                        id="ln-ebook"
                        type="file"
                        accept=".pdf,.epub,application/pdf,application/epub+zip"
                        className="text-[14px] text-(--brotero-texto)"
                        onChange={(e) => form.setData('ebook', e.target.files?.[0] ?? null)}
                    />
                    {form.errors.ebook ? (
                        <p className="m-0 text-[12px] text-red-600">{form.errors.ebook}</p>
                    ) : null}
                </div>

                <div className="flex flex-wrap gap-[12px] pt-[8px]">
                    <button
                        type="submit"
                        disabled={form.processing}
                        className="cursor-pointer rounded-(--raio) border-0 bg-(--brotero-primaria) px-[20px] py-[12px] text-[15px] font-semibold text-white hover:opacity-90 disabled:opacity-60"
                    >
                        {form.processing ? 'A guardar…' : 'Guardar no catálogo'}
                    </button>
                    <a
                        href="/biblioteca/conta/balcao"
                        className="inline-flex items-center rounded-(--raio) border border-(--brotero-borda) bg-(--brotero-branco) px-[20px] py-[12px] text-[15px] font-semibold text-(--brotero-texto) no-underline hover:bg-(--brotero-laranja-hover)"
                    >
                        Voltar ao balcão
                    </a>
                </div>
            </form>
        </BibliotecaContaLayout>
    );
}
