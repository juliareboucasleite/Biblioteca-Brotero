import React from 'react';

export function BroteroHeader() {
    return (
        <header className="header-brotero">
            <div className="container">
                <div className="header-inner">
                    <a href="/biblioteca" className="header-brand">
                        <img
                            src="/images/logo-brotero.png"
                            alt="Biblioteca Brotero"
                            className="header-logo"
                        />
                        <span className="header-titulo">Biblioteca Brotero</span>
                    </a>

                    <form className="header-search">
                        <button type="button" className="header-search-all">
                            Todos
                        </button>
                        <input
                            type="text"
                            className="header-search-input"
                            placeholder="Pesquisar livros..."
                        />
                        <button type="submit" className="header-search-btn">
                            <span className="icon-search" aria-hidden="true">
                                🔍
                            </span>
                            <span className="sr-only">Pesquisar</span>
                        </button>
                    </form>
                </div>
            </div>
        </header>
    );
}

