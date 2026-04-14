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
            role="search"
            aria-label="Pesquisa de livros"
            className="flex min-h-[56px] w-full items-center gap-[12px] rounded-full border border-(--brotero-borda) bg-(--brotero-branco) pr-[8px] pl-[24px] shadow-premium transition-all duration-300 focus-within:border-(--brotero-primaria) focus-within:ring-4 focus-within:ring-(--brotero-primaria)/10 max-[480px]:pl-[16px]"
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
                className="text-[1.25rem] leading-none text-(--brotero-texto-cinza) transition-colors group-focus-within:text-(--brotero-primaria)"
                aria-hidden="true"
            >
                ⌕
            </span>
            <input
                type="search"
                name="q"
                defaultValue={qInit}
                aria-label="Pesquisar livros por título, autor ou ISBN"
                placeholder="Pesquisar por título, autor ou palavras…"
                className="min-w-0 flex-1 border-0 bg-transparent py-[16px] text-[16px] text-(--brotero-texto) placeholder:text-(--brotero-texto-cinza) focus:ring-0 focus:outline-none"
                autoComplete="off"
            />
            <button
                type="submit"
                className="shrink-0 cursor-pointer rounded-full border-0 bg-(--brotero-primaria) px-[24px] py-[12px] text-[15px] font-bold text-white shadow-lg transition-all duration-200 hover:bg-(--brotero-primaria-escuro) hover:shadow-xl hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--brotero-primaria) active:scale-[0.96]"
            >
                Pesquisar
            </button>
        </form>
    );
}
