type BibliotecaCatalogSearchBarProps = {
    formAction: string;
    defaultQuery?: string | null;
    categoriaSelecionada?: string | null;
    lingua?: string | null;
    authorSelecionado?: string | null;
    ano?: string | null;
};

export function BibliotecaCatalogSearchBar({
    formAction,
    defaultQuery,
    categoriaSelecionada,
    lingua,
    authorSelecionado,
    ano,
}: BibliotecaCatalogSearchBarProps) {
    const qInit = defaultQuery ?? '';

    return (
        <form
            action={formAction}
            method="get"
            className="flex min-h-[50px] w-full items-center gap-[10px] rounded-full border border-(--brotero-borda-suave) bg-(--brotero-branco) pr-[6px] pl-[18px] shadow-[0_4px_20px_rgba(42,38,48,0.05)] max-[480px]:pl-[14px]"
        >
            {categoriaSelecionada ? (
                <input
                    type="hidden"
                    name="categoria"
                    value={categoriaSelecionada}
                />
            ) : null}
            {lingua ? (
                <input type="hidden" name="lingua" value={lingua} />
            ) : null}
            {authorSelecionado ? (
                <input
                    type="hidden"
                    name="author_id"
                    value={authorSelecionado}
                />
            ) : null}
            {ano ? <input type="hidden" name="ano" value={ano} /> : null}
            <span
                className="text-[1.15rem] leading-none text-(--brotero-texto-cinza)"
                aria-hidden="true"
            >
                ⌕
            </span>
            <input
                type="search"
                name="q"
                defaultValue={qInit}
                placeholder="Pesquisar por título, autor ou palavras…"
                className="min-w-0 flex-1 border-0 bg-transparent py-[14px] text-[15px] text-(--brotero-texto) placeholder:text-(--brotero-texto-cinza) focus:ring-0 focus:outline-none"
                autoComplete="off"
            />
            <button
                type="submit"
                className="shrink-0 cursor-pointer rounded-full border-0 bg-(--brotero-primaria) px-[18px] py-[10px] text-[14px] font-semibold text-white shadow-[0_2px_10px_rgba(74,101,114,0.28)] transition-[background-color,box-shadow,transform] duration-150 hover:bg-(--brotero-primaria-escuro) hover:shadow-[0_4px_14px_rgba(74,101,114,0.22)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--brotero-primaria) active:scale-[0.98] motion-reduce:transition-none motion-reduce:active:scale-100"
            >
                Pesquisar
            </button>
        </form>
    );
}
