export function BroteroHeader() {
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
                        <input
                            type="text"
                            className="header-search-input"
                            placeholder="Pesquisar livros..."
                            name="q"
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

