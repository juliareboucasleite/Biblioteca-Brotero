import { router, usePage } from '@inertiajs/react';
import clsx from 'clsx';
import { useCallback, useState } from 'react';
import type { MouseEvent } from 'react';
import type { LivroCatalogo } from '@/types';
import type { Auth } from '@/types/auth';

type CardLivroProps = {
    livro: LivroCatalogo;
    className?: string;
};

type ReadingListOption = { id: number; name: string };
type PageProps = { auth: Auth; favoriteBookIds?: string[]; patronReadingLists?: ReadingListOption[] };

export function CardLivro({ livro, className }: CardLivroProps) {
    const { auth, favoriteBookIds = [], patronReadingLists = [] } = usePage<PageProps>().props;
    const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
    const [isListModalOpen, setIsListModalOpen] = useState(false);
    const [selectedListId, setSelectedListId] = useState<string>('');
    const [listName, setListName] = useState('Ler depois');
    const [isSavingList, setIsSavingList] = useState(false);
    const [savedListFeedback, setSavedListFeedback] = useState<string | null>(null);

    const updatePosition = useCallback((e: MouseEvent<HTMLAnchorElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setPosition({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        });
    }, []);

    const href = `/biblioteca/livro/${encodeURIComponent(livro.id)}`;
    const hasCover = Boolean(livro.capa && livro.capa.trim().length > 0);
    const isSaved = favoriteBookIds.includes(String(livro.id));

    const onSaveToList = (e: MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        e.stopPropagation();

        if (!auth.patron) {
            window.location.href = '/biblioteca/entrar';

            return;
        }

        setSelectedListId(patronReadingLists[0] ? String(patronReadingLists[0].id) : '');
        setListName('Ler depois');
        setIsListModalOpen(true);
    };

    const onConfirmSaveToList = () => {
        if (isSavingList) {
            return;
        }

        const bookId = encodeURIComponent(livro.id);
        const trimmedName = listName.trim();
        const listId = selectedListId !== '' ? Number(selectedListId) : null;
        const listNameForFeedback =
            listId !== null
                ? (patronReadingLists.find((list) => list.id === listId)?.name ?? 'lista selecionada')
                : (trimmedName !== '' ? trimmedName : 'Ler depois');

        const payload =
            listId !== null
                ? { list_id: listId }
                : { list_name: trimmedName !== '' ? trimmedName : 'Ler depois' };

        setIsSavingList(true);
        router.post(
            `/biblioteca/conta/listas/livros/${bookId}`,
            payload,
            {
                preserveScroll: true,
                onSuccess: () => {
                    setIsListModalOpen(false);
                    setSavedListFeedback(`Guardado em «${listNameForFeedback}»`);
                    window.setTimeout(() => setSavedListFeedback(null), 2400);
                },
                onFinish: () => setIsSavingList(false),
            },
        );
    };

    return (
        <article
            className={clsx(
                'card-livro group',
                className,
            )}
        >
            <div className="relative">
                <a
                    href={href}
                    className="group relative aspect-2/3 bg-linear-to-br from-[#f8f8f8] to-[#ededed] min-h-[200px] max-[768px]:min-h-[160px] block no-underline text-inherit overflow-hidden"
                    aria-label="Ver livro e requisitar"
                    onMouseEnter={updatePosition}
                    onMouseMove={updatePosition}
                >
                    {hasCover && (
                        <img
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            src={livro.capa as string}
                            alt={`Capa do livro ${livro.titulo}`}
                            loading="lazy"
                            referrerPolicy="no-referrer"
                        />
                    )}
                    <div
                        className="absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2 px-[20px] py-[10px] rounded-full bg-(--brotero-primaria) text-white text-[14px] font-bold shadow-2xl opacity-0 pointer-events-none transition-all duration-300 ease-out will-change-[left,top] group-hover:opacity-100 group-hover:pointer-events-auto"
                        style={
                            position !== null
                                ? { left: position.x, top: position.y }
                                : { left: '50%', top: '50%' }
                        }
                    >
                        take it
                    </div>
                </a>
                {livro.tem_ebook ? (
                    <span className="pointer-events-none absolute top-[12px] left-[12px] z-10 rounded-full bg-(--brotero-primaria)/90 backdrop-blur-md px-[10px] py-[4px] text-[10px] font-black uppercase tracking-wider text-white shadow-lg">
                        E-book
                    </span>
                ) : null}
                <button
                    type="button"
                    className={clsx(
                        'absolute top-[12px] right-[12px] z-10 w-[40px] h-[40px] rounded-full bg-white/80 backdrop-blur-md border border-white/20 text-[20px] leading-none flex items-center justify-center cursor-pointer shadow-xl transition-all duration-200 hover:scale-110 active:scale-95',
                        isSaved ? 'text-(--brotero-primaria)' : 'text-(--brotero-texto-cinza)',
                    )}
                    title={isSaved ? 'Guardar noutra lista' : 'Guardar numa lista'}
                    aria-label={isSaved ? 'Guardar noutra lista' : 'Guardar numa lista'}
                    onClick={onSaveToList}
                >
                    {isSaved ? '✓' : '+'}
                </button>
                {savedListFeedback ? (
                    <span className="pointer-events-none absolute right-[12px] top-[58px] z-10 rounded-full border border-emerald-200 bg-emerald-50 px-[10px] py-[4px] text-[11px] font-semibold text-emerald-900 shadow-sm">
                        {savedListFeedback}
                    </span>
                ) : null}
            </div>
            {isListModalOpen ? (
                <div className="fixed inset-0 z-80 flex items-center justify-center p-[16px]">
                    <button
                        type="button"
                        aria-label="Fechar modal"
                        className="absolute inset-0 border-0 bg-black/35"
                        onClick={() => setIsListModalOpen(false)}
                    />
                    <div className="relative z-81 w-full max-w-[420px] rounded-[14px] border border-(--brotero-borda) bg-(--brotero-branco) p-[16px] shadow-[0_12px_34px_rgba(0,0,0,0.2)]">
                        <h3 className="m-0 text-[16px] font-bold text-(--brotero-texto)">Guardar em lista</h3>
                        <p className="m-0 mt-[6px] text-[13px] text-(--brotero-texto-cinza)">
                            Escolha uma lista existente ou crie uma nova para este livro.
                        </p>
                        <label className="mt-[12px] block text-[12px] font-semibold uppercase tracking-wide text-(--brotero-texto-cinza)">
                            Lista
                        </label>
                        <select
                            autoFocus
                            value={selectedListId}
                            onChange={(e) => setSelectedListId(e.target.value)}
                            className="mt-[6px] w-full rounded-(--raio) border border-(--brotero-borda) bg-(--brotero-branco) px-[10px] py-[9px] text-[14px] text-(--brotero-texto)"
                        >
                            {patronReadingLists.map((list) => (
                                <option key={list.id} value={String(list.id)}>
                                    {list.name}
                                </option>
                            ))}
                            <option value="">Criar nova lista</option>
                        </select>
                        {selectedListId === '' ? (
                            <input
                                value={listName}
                                onChange={(e) => setListName(e.target.value)}
                                maxLength={120}
                                placeholder="Nome da nova lista"
                                className="mt-[10px] w-full rounded-(--raio) border border-(--brotero-borda) bg-(--brotero-branco) px-[10px] py-[9px] text-[14px] text-(--brotero-texto)"
                            />
                        ) : null}
                        <div className="mt-[14px] flex justify-end gap-[8px]">
                            <button
                                type="button"
                                disabled={isSavingList}
                                className="btn-brotero btn-brotero-secondary btn-sm"
                                onClick={() => setIsListModalOpen(false)}
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                disabled={isSavingList || (selectedListId === '' && listName.trim() === '')}
                                className={clsx('btn-brotero btn-brotero-primary btn-sm', isSavingList && 'btn-loading')}
                                onClick={onConfirmSaveToList}
                            >
                                {isSavingList ? 'A guardar...' : 'Guardar'}
                            </button>
                        </div>
                    </div>
                </div>
            ) : null}
            {(livro.requisicoes_count ?? 0) > 0 ? (
                <p className="m-0 px-[10px] py-[8px] text-[12px] font-semibold text-(--brotero-texto-cinza) border-t border-(--brotero-borda)">
                    {livro.requisicoes_count}{' '}
                    {livro.requisicoes_count === 1 ? 'requisição' : 'requisições'}
                </p>
            ) : null}
        </article>
    );
}
