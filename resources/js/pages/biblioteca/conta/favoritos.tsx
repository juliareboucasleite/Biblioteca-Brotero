import { Link, router, useForm, usePage } from '@inertiajs/react';
import { ChevronLeft, ChevronRight, LayoutGrid, Rows3, Pencil } from 'lucide-react';
import { useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { BibliotecaContaLayout } from '@/components/biblioteca/BibliotecaContaLayout';
import { CardLivro } from '@/components/CardLivro';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
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
    const { flash } = usePage().props as { flash?: { success?: string; error?: string } };
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
    const editNameForm = useForm({ name: '' });
    const [draftProgress, setDraftProgress] = useState<Record<string, number>>({});
    const [editingList, setEditingList] = useState<{ id: number; currentName: string } | null>(null);
    const [viewModeByList, setViewModeByList] = useState<Record<number, 'grid' | 'row'>>({});
    const rowScrollRefs = useRef<Record<number, HTMLDivElement | null>>({});
    const buttonBaseClass =
        'inline-flex items-center justify-center rounded-(--raio) border text-[12px] font-semibold transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--brotero-primaria)/35 disabled:cursor-not-allowed disabled:opacity-60';
    const buttonNeutralClass = `${buttonBaseClass} border-(--brotero-borda) bg-(--brotero-branco) text-(--brotero-texto) hover:bg-(--brotero-fundo)`;
    const buttonSoftClass = `${buttonBaseClass} border-(--brotero-borda) bg-(--brotero-fundo) text-(--brotero-texto) hover:bg-(--brotero-fundo-escuro)`;
    const buttonPrimaryClass = 'inline-flex items-center justify-center rounded-(--raio) border border-(--brotero-primaria) bg-(--brotero-primaria) text-[14px] font-semibold text-white transition-colors duration-150 hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--brotero-primaria)/40 disabled:cursor-not-allowed disabled:opacity-60';

    function createList(e: FormEvent<HTMLFormElement>): void {
        e.preventDefault();
        form.post('/biblioteca/conta/listas', {
            preserveScroll: true,
            onSuccess: () => form.reset(),
        });
    }

    function commitProgress(listId: number, bookId: number | string, fallbackValue: number): void {
        const key = `${listId}-${bookId}`;
        const progress = draftProgress[key] ?? fallbackValue;

        if (progress === fallbackValue) {
            return;
        }

        router.patch(
            `/biblioteca/conta/listas/${listId}/livros/${bookId}/progresso`,
            {
                progress_percent: progress,
                reading_status:
                    progress === 100 ? 'finished' : progress > 0 ? 'reading' : 'not_started',
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setDraftProgress((prev) => {
                        const next = { ...prev };
                        delete next[key];

                        return next;
                    });
                },
            },
        );
    }

    function openEditListName(listId: number, currentName: string): void {
        setEditingList({ id: listId, currentName });
        editNameForm.setData('name', currentName);
        editNameForm.clearErrors();
    }

    function submitEditListName(): void {
        if (!editingList) {
            return;
        }

        const parsedName = editNameForm.data.name.trim();

        if (!parsedName || parsedName === editingList.currentName.trim()) {
            setEditingList(null);

            return;
        }

        editNameForm.patch(`/biblioteca/conta/listas/${editingList.id}`, {
            preserveScroll: true,
            onSuccess: () => setEditingList(null),
        });
    }

    function getListViewMode(listId: number): 'grid' | 'row' {
        return viewModeByList[listId] ?? 'grid';
    }

    function setListViewMode(listId: number, mode: 'grid' | 'row'): void {
        setViewModeByList((prev) => ({ ...prev, [listId]: mode }));
    }

    function scrollListRow(listId: number, delta: number): void {
        rowScrollRefs.current[listId]?.scrollBy({ left: delta, behavior: 'smooth' });
    }

    return (
        <BibliotecaContaLayout title="As minhas listas" secao="favoritos">
            <h2 className="m-0 mb-[8px] text-[1.15rem] font-bold text-(--brotero-texto)">As minhas listas</h2>
            <p className="m-0 mb-[16px] text-[13px] text-(--brotero-texto-cinza)">
                Crie listas com o nome que preferir, como «Ler depois» ou «Geografia».
            </p>
            {flash?.success ? (
                <p className="mb-[10px] rounded-(--raio) border border-emerald-200 bg-emerald-50 px-[10px] py-[8px] text-[13px] text-emerald-900">
                    {flash.success}
                </p>
            ) : null}
            {flash?.error ? (
                <p className="mb-[10px] rounded-(--raio) border border-red-200 bg-red-50 px-[10px] py-[8px] text-[13px] text-red-900">
                    {flash.error}
                </p>
            ) : null}
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
                        disabled={importForm.processing}
                        className={`${buttonSoftClass} px-3 py-2 text-[13px]`}
                    >
                        {importForm.processing ? 'A importar...' : 'Importar lista partilhada'}
                    </button>
                </form>
            ) : null}

            <form onSubmit={createList} className="mb-[20px] flex flex-wrap items-end gap-[8px]">
                <label className="grid gap-[6px] text-[13px] font-semibold text-(--brotero-texto)">
                    Nova lista
                    <input
                        className="h-[40px] min-w-[220px] rounded-(--raio) border border-(--brotero-borda) bg-(--brotero-branco) px-[10px] text-[14px]"
                        value={form.data.name}
                        onChange={(e) => form.setData('name', e.target.value)}
                        placeholder="ex.: Ler depois"
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
                                        placeholder="ex.: 10.ºB"
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
                    className={`${buttonPrimaryClass} h-[40px] px-3.5`}
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
                                {(lista.type === 'custom' || lista.type === 'classroom') && (
                                    <button
                                        type="button"
                                        title="Editar nome da lista"
                                        className={`${buttonNeutralClass} h-7 w-7 p-0`}
                                        onClick={() => openEditListName(lista.id, lista.name)}
                                    >
                                        <Pencil className="size-3.5" aria-hidden />
                                        <span className="sr-only">Editar nome da lista</span>
                                    </button>
                                )}
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
                                        className={`${buttonSoftClass} px-2.5 py-1.5`}
                                        onClick={() =>
                                            router.post(`/biblioteca/conta/listas/${lista.id}/partilhar`, {}, { preserveScroll: true })
                                        }
                                    >
                                        Gerar/atualizar partilha
                                    </button>
                                ) : null}
                                {lista.books.length > 0 ? (
                                    <div className="ml-auto flex items-center gap-[6px]">
                                        {getListViewMode(lista.id) === 'row' ? (
                                            <>
                                                <button
                                                    type="button"
                                                    className={`${buttonNeutralClass} h-8 w-8 p-0`}
                                                    onClick={() => scrollListRow(lista.id, -260)}
                                                    aria-label="Deslocar para a esquerda"
                                                >
                                                    <ChevronLeft className="size-4" />
                                                </button>
                                                <button
                                                    type="button"
                                                    className={`${buttonNeutralClass} h-8 w-8 p-0`}
                                                    onClick={() => scrollListRow(lista.id, 260)}
                                                    aria-label="Deslocar para a direita"
                                                >
                                                    <ChevronRight className="size-4" />
                                                </button>
                                            </>
                                        ) : null}
                                        <button
                                            type="button"
                                            className={cn(
                                                `${buttonNeutralClass} h-8 w-8 p-0`,
                                                getListViewMode(lista.id) === 'grid' && 'border-(--brotero-primaria) text-(--brotero-primaria)',
                                            )}
                                            onClick={() => setListViewMode(lista.id, 'grid')}
                                            aria-label="Ver em blocos"
                                            title="Ver em blocos"
                                        >
                                            <LayoutGrid className="size-4" />
                                        </button>
                                        <button
                                            type="button"
                                            className={cn(
                                                `${buttonNeutralClass} h-8 w-8 p-0`,
                                                getListViewMode(lista.id) === 'row' && 'border-(--brotero-primaria) text-(--brotero-primaria)',
                                            )}
                                            onClick={() => setListViewMode(lista.id, 'row')}
                                            aria-label="Ver em lista horizontal"
                                            title="Ver em lista horizontal"
                                        >
                                            <Rows3 className="size-4" />
                                        </button>
                                    </div>
                                ) : null}
                            </div>
                            {lista.books.length === 0 ? (
                                <p className="m-0 text-[13px] text-(--brotero-texto-cinza)">Sem livros nesta lista.</p>
                            ) : (
                                <>
                                    <div
                                        ref={(el) => {
                                            rowScrollRefs.current[lista.id] = el;
                                        }}
                                        className={cn(
                                            getListViewMode(lista.id) === 'grid'
                                                ? 'grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-[16px] max-[768px]:grid-cols-[repeat(auto-fill,minmax(130px,1fr))] max-[768px]:gap-[12px]'
                                                : 'flex snap-x snap-proximity gap-[12px] overflow-x-auto pb-[4px]',
                                        )}
                                    >
                                        {lista.books.map((livro) => (
                                            <div
                                                key={livro.id}
                                                className={cn(
                                                    'flex flex-col gap-[8px]',
                                                    getListViewMode(lista.id) === 'row' && 'w-[160px] shrink-0 snap-start',
                                                )}
                                            >
                                                <CardLivro livro={livro} />
                                                <button
                                                    type="button"
                                                    className={`${buttonNeutralClass} px-2.5 py-[7px]`}
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
                                                        {(() => {
                                                            const key = `${lista.id}-${livro.id}`;
                                                            const value =
                                                                draftProgress[key] ?? (livro.progress_percent ?? 0);

                                                            return (
                                                                <>
                                                                    <label className="text-[11px] font-semibold text-(--brotero-texto-cinza)">
                                                                        Progresso: {value}%
                                                                    </label>
                                                                    <div className="overflow-hidden">
                                                                        <input
                                                                            type="range"
                                                                            min={0}
                                                                            max={100}
                                                                            className="m-0 block w-full max-w-full box-border accent-(--brotero-primaria)"
                                                                            value={value}
                                                                            onChange={(e) => {
                                                                                const progress = Number(e.target.value);
                                                                                setDraftProgress((prev) => ({
                                                                                    ...prev,
                                                                                    [key]: progress,
                                                                                }));
                                                                            }}
                                                                            onMouseUp={() =>
                                                                                commitProgress(
                                                                                    lista.id,
                                                                                    livro.id,
                                                                                    livro.progress_percent ?? 0,
                                                                                )
                                                                            }
                                                                            onTouchEnd={() =>
                                                                                commitProgress(
                                                                                    lista.id,
                                                                                    livro.id,
                                                                                    livro.progress_percent ?? 0,
                                                                                )
                                                                            }
                                                                            onKeyUp={() =>
                                                                                commitProgress(
                                                                                    lista.id,
                                                                                    livro.id,
                                                                                    livro.progress_percent ?? 0,
                                                                                )
                                                                            }
                                                                        />
                                                                    </div>
                                                                </>
                                                            );
                                                        })()}
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
                                                                className={`${buttonSoftClass} px-2 py-1.5`}
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
                                </>
                            )}
                        </section>
                    ))}
                </div>
            )}
            <Dialog
                open={editingList !== null}
                onOpenChange={(open) => {
                    if (!open && !editNameForm.processing) {
                        setEditingList(null);
                    }
                }}
            >
                <DialogContent className="border-(--brotero-borda) bg-(--brotero-branco) text-(--brotero-texto) sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-(--brotero-texto)">Editar nome da lista</DialogTitle>
                        <DialogDescription className="text-(--brotero-texto-cinza)">
                            Escolha um novo nome para esta lista.
                        </DialogDescription>
                    </DialogHeader>
                    <input
                        autoFocus
                        className="h-[40px] w-full rounded-(--raio) border border-(--brotero-borda) bg-(--brotero-branco) px-[10px] text-[14px] text-(--brotero-texto) focus:outline-none focus:outline-2 focus:outline-(--brotero-primaria) focus:outline-offset-0"
                        value={editNameForm.data.name}
                        onChange={(e) => editNameForm.setData('name', e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                submitEditListName();
                            }
                        }}
                    />
                    {editNameForm.errors.name ? (
                        <p className="m-0 text-[13px] font-medium text-red-700">{editNameForm.errors.name}</p>
                    ) : null}
                    <DialogFooter className="gap-2 sm:gap-2">
                        <button
                            type="button"
                            className={`${buttonNeutralClass} px-3 py-2`}
                            disabled={editNameForm.processing}
                            onClick={() => setEditingList(null)}
                        >
                            Cancelar
                        </button>
                        <button
                            type="button"
                            className={`${buttonPrimaryClass} px-3 py-2 text-[13px]`}
                            disabled={editNameForm.processing}
                            onClick={submitEditListName}
                        >
                            Guardar
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </BibliotecaContaLayout>
    );
}
