export function BroteroHeader() {
    const currentParams =
        typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    const categoria = currentParams?.get('categoria') ?? '';
    const lingua = currentParams?.get('lingua') ?? '';

    return (
        <header className="header-brotero">
            <div className="container">
                <div className="header-inner">
                    <a href="/biblioteca" className="header-brand">
                        <img
                            src="/images/logo.png"
                            alt="Biblioteca Brotero"
                            className="header-logo"
                        />
                        <span className="header-titulo">Biblioteca Brotero</span>
                    </a>

                    <form className="header-search" action="/biblioteca" method="get">
                        {categoria !== '' && <input type="hidden" name="categoria" value={categoria} />}
                        {lingua !== '' && <input type="hidden" name="lingua" value={lingua} />}
                        <input
                            type="text"
                            className="header-search-input"
                            placeholder="Pesquisar livros..."
                            name="q"
                            defaultValue={currentParams?.get('q') ?? ''}
                        />
                        <button type="submit" className="header-search-btn" aria-label="Pesquisar">
                            <span className="icon-search" aria-hidden="true">⌕</span>
                        </button>
                    </form>
                </div>
            </div>
        </header>
    );
}

