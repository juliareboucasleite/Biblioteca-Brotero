import { Link, router, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { BibliotecaContaLayout } from '@/components/biblioteca/BibliotecaContaLayout';
import { CardLivro } from '@/components/CardLivro';
import type { LivroCatalogo } from '@/types';

type Props = {
    patronRole: 'student' | 'teacher' | 'staff';
    listas: Array<{
        id: number;
        name: string;
        type: string;
        classroom: string | null;
        theme: string | null;
        share_code: string | null;
        share_token: string | null;
        books: Array<LivroCatalogo & {
            progress_percent?: number;
            current_page?: number | null;
            reading_status?: string;
        }>;
    }>;
};

export default function BibliotecaContaFavoritos({ listas, patronRole }: Props) {
    const form = useForm({
        name: '',
        type: 'custom',
        classroom: '',
        theme: '',
    });
    const importForm = useForm({ share_code: '', share_token: '' });
    const reserveForm = useForm({
        book_id: '',
        copies: '1',
        classroom: '',
        theme: '',
        reserved_for_date: '',
    });

    function createList(e: FormEvent<HTMLFormElement>): void {
        e.preventDefault();
        form.post('/biblioteca/conta/listas', {
            preserveScroll: true,
            onSuccess: () => form.reset(),
        });
    }

    return (
        <BibliotecaContaLayout title="As minhas listas" secao="favoritos">
            <h2 className="m-0 mb-[8px] text-[1.15rem] font-bold text-(--brotero-texto)">As minhas listas</h2>
            <p className="m-0 mb-[16px] text-[13px] text-(--brotero-texto-cinza)">
                Crie listas com o nome que preferir, como «Ler mais tarde» ou «Geografia».
            </p>
            {patronRole !== 'staff' ? (
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        importForm.post('/biblioteca/conta/listas/importar-partilha', { preserveScroll: true });
                    }}
                    className="mb-[12px] flex flex-wrap items-end gap-[8px] rounded-(--raio) border border-(--brotero-borda) bg-(--brotero-branco) p-[10px]"
                >
                    <label className="grid gap-[4px] text-[12px] font-semibold text-(--brotero-texto-cinza)">
                        Código de partilha
                        <input
                            className="rounded-(--raio) border border-(--brotero-borda) px-[8px] py-[7px] text-[13px]"
                            value={importForm.data.share_code}
                            onChange={(e) => importForm.setData('share_code', e.target.value)}
                            placeholder="ABC123"
                        />
                    </label>
                    <label className="grid gap-[4px] text-[12px] font-semibold text-(--brotero-texto-cinza)">
                        Token/link interno
                        <input
                            className="min-w-[220px] rounded-(--raio) border border-(--brotero-borda) px-[8px] py-[7px] text-[13px]"
                            value={importForm.data.share_token}
                            onChange={(e) => importForm.setData('share_token', e.target.value)}
                            placeholder="Cole o token do link"
                        />
                    </label>
                    <button
                        type="submit"
                        className="cursor-pointer rounded-(--raio) border border-(--brotero-borda) bg-(--brotero-fundo) px-[12px] py-[8px] text-[13px] font-semibold text-(--brotero-texto)"
                    >
                        Importar lista partilhada
                    </button>
                </form>
            ) : null}

            <form onSubmit={createList} className="mb-[20px] flex flex-wrap items-end gap-[8px]">
                <label className="grid gap-[6px] text-[13px] font-semibold text-(--brotero-texto)">
                    Nova lista
                    <input
                        className="min-w-[220px] rounded-(--raio) border border-(--brotero-borda) bg-(--brotero-branco) px-[10px] py-[8px] text-[14px]"
                        value={form.data.name}
                        onChange={(e) => form.setData('name', e.target.value)}
                        placeholder="ex.: Ler mais tarde"
                        maxLength={120}
                        required
                    />
                </label>
                {patronRole === 'teacher' ? (
                    <>
                        <label className="grid gap-[6px] text-[13px] font-semibold text-(--brotero-texto)">
                            Tipo
                            <select
                                value={form.data.type}
                                onChange={(e) => form.setData('type', e.target.value)}
                                className="rounded-(--raio) border border-(--brotero-borda) bg-(--brotero-branco) px-[10px] py-[8px] text-[14px]"
                            >
                                <option value="custom">Personalizada</option>
                                <option value="classroom">Turma/tema</option>
                            </select>
                        </label>
                        {form.data.type === 'classroom' ? (
                            <>
                                <label className="grid gap-[6px] text-[13px] font-semibold text-(--brotero-texto)">
                                    Turma
                                    <input
                                        className="min-w-[160px] rounded-(--raio) border border-(--brotero-borda) bg-(--brotero-branco) px-[10px] py-[8px] text-[14px]"
                                        value={form.data.classroom}
                                        onChange={(e) => form.setData('classroom', e.target.value)}
                                        placeholder="ex.: 8.ºB"
                                    />
                                </label>
                                <label className="grid gap-[6px] text-[13px] font-semibold text-(--brotero-texto)">
                                    Tema
                                    <input
                                        className="min-w-[160px] rounded-(--raio) border border-(--brotero-borda) bg-(--brotero-branco) px-[10px] py-[8px] text-[14px]"
                                        value={form.data.theme}
                                        onChange={(e) => form.setData('theme', e.target.value)}
                                        placeholder="ex.: Revolução Industrial"
                                    />
                                </label>
                            </>
                        ) : null}
                    </>
                ) : null}
                <button
                    type="submit"
                    disabled={form.processing}
                    className="cursor-pointer rounded-(--raio) border-0 bg-(--brotero-primaria) px-[14px] py-[10px] text-[14px] font-semibold text-white disabled:opacity-60"
                >
                    Criar lista
                </button>
            </form>

            {listas.length === 0 ? (
                <p className="m-0 p-[16px] bg-(--brotero-branco) border border-dashed border-(--brotero-borda) rounded-(--raio) text-(--brotero-texto-cinza)">
                    Crie a sua lista de leituras: no{' '}
                    <Link href="/biblioteca" className="text-(--brotero-texto-link) hover:underline">
                        catálogo
                    </Link>
                    , use o botão «+» nos cartões para guardar livros nas suas listas.
                </p>
            ) : (
                <div className="flex flex-col gap-[18px]">
                    {listas.map((lista) => (
                        <section key={lista.id} className="rounded-(--raio) border border-(--brotero-borda) bg-(--brotero-branco) p-[12px]">
                            <div className="mb-[12px] flex flex-wrap items-center gap-[8px]">
                                <h3 className="m-0 text-[15px] font-bold text-(--brotero-texto)">{lista.name}</h3>
                                {lista.type === 'classroom' ? (
                                    <span className="rounded-full border border-sky-200 bg-sky-50 px-[8px] py-[2px] text-[11px] font-semibold text-sky-900">
                                        Turma {lista.classroom ?? '—'}
                                    </span>
                                ) : null}
                                {lista.share_code ? (
                                    <span className="rounded-full border border-emerald-200 bg-emerald-50 px-[8px] py-[2px] text-[11px] font-semibold text-emerald-900">
                                        Código: {lista.share_code}
                                    </span>
                                ) : null}
                                {patronRole === 'teacher' && lista.type === 'classroom' ? (
                                    <button
                                        type="button"
                                        className="cursor-pointer rounded-(--raio) border border-(--brotero-borda) bg-(--brotero-fundo) px-[10px] py-[5px] text-[12px] font-semibold"
                                        onClick={() =>
                                            router.post(`/biblioteca/conta/listas/${lista.id}/partilhar`, {}, { preserveScroll: true })
                                        }
                                    >
                                        Gerar/atualizar partilha
                                    </button>
                                ) : null}
                            </div>
                            {lista.books.length === 0 ? (
                                <p className="m-0 text-[13px] text-(--brotero-texto-cinza)">Sem livros nesta lista.</p>
                            ) : (
                                <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-[16px] max-[768px]:grid-cols-[repeat(auto-fill,minmax(130px,1fr))] max-[768px]:gap-[12px]">
                                    {lista.books.map((livro) => (
                                        <div key={livro.id} className="flex flex-col gap-[8px]">
                                            <CardLivro livro={livro} />
                                            <button
                                                type="button"
                                                className="cursor-pointer rounded-(--raio) border border-(--brotero-borda) bg-(--brotero-branco) px-[10px] py-[7px] text-[12px] font-semibold text-(--brotero-texto)"
                                                onClick={() => {
                                                    const bookId = encodeURIComponent(livro.id);
                                                    const listId = encodeURIComponent(String(lista.id));
                                                    form.delete(`/biblioteca/conta/listas/${listId}/livros/${bookId}`, {
                                                        preserveScroll: true,
                                                    });
                                                }}
                                            >
                                                Remover desta lista
                                            </button>
                                            {patronRole === 'student' ? (
                                                <div className="mt-[6px] grid gap-[6px] rounded-(--raio) border border-(--brotero-borda) p-[8px]">
                                                    <label className="text-[11px] font-semibold text-(--brotero-texto-cinza)">
                                                        Progresso: {livro.progress_percent ?? 0}%
                                                    </label>
                                                    <input
                                                        type="range"
                                                        min={0}
                                                        max={100}
                                                        value={livro.progress_percent ?? 0}
                                                        onChange={(e) => {
                                                            const progress = Number(e.target.value);
                                                            router.patch(
                                                                `/biblioteca/conta/listas/${lista.id}/livros/${livro.id}/progresso`,
                                                                {
                                                                    progress_percent: progress,
                                                                    reading_status: progress === 100 ? 'finished' : progress > 0 ? 'reading' : 'not_started',
                                                                },
                                                                { preserveScroll: true },
                                                            );
                                                        }}
                                                    />
                                                </div>
                                            ) : null}
                                            {patronRole === 'teacher' && lista.type === 'classroom' ? (
                                                <div className="mt-[6px] grid gap-[6px] rounded-(--raio) border border-(--brotero-borda) p-[8px]">
                                                    <label className="text-[11px] font-semibold text-(--brotero-texto-cinza)">
                                                        Reservar para turma
                                                    </label>
                                                    <div className="flex gap-[6px]">
                                                        <input
                                                            className="w-[72px] rounded-(--raio) border border-(--brotero-borda) px-[6px] py-[6px] text-[12px]"
                                                            value={reserveForm.data.copies}
                                                            onChange={(e) => reserveForm.setData('copies', e.target.value)}
                                                            placeholder="Qtd."
                                                        />
                                                        <button
                                                            type="button"
                                                            className="cursor-pointer rounded-(--raio) border border-(--brotero-borda) bg-(--brotero-fundo) px-[8px] py-[6px] text-[12px] font-semibold"
                                                            onClick={() =>
                                                                router.post(
                                                                    `/biblioteca/conta/listas/${lista.id}/reservar`,
                                                                    {
                                                                        book_id: Number(livro.id),
                                                                        copies: Number(reserveForm.data.copies || '1'),
                                                                        classroom: lista.classroom ?? 'Turma',
                                                                        theme: lista.theme ?? null,
                                                                    },
                                                                    { preserveScroll: true },
                                                                )
                                                            }
                                                        >
                                                            Reservar
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : null}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>
                    ))}
                </div>
            )}
        </BibliotecaContaLayout>
    );
}
