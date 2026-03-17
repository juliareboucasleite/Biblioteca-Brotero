import React from 'react';

const BLOG_URL = 'https://bbrotero.blogspot.com/';
const EMAIL = 'mailto:biblioteca@esab.pt';
const CC_URL = 'https://creativecommons.org/licenses/by-sa/4.0/';

export function BroteroFooter() {
    return (
        <footer className="brotero-footer">
            <div className="container">
                <div className="footer-inner">
                    <div className="footer-redes">
                        <a
                            href="https://www.instagram.com/bibabrotero/"
                            target="_blank"
                            rel="noreferrer noopener"
                            className="footer-rede"
                        >
                            Instagram
                        </a>
                        <a
                            href="https://www.facebook.com/BibliotecaEscolarAvelarBrotero"
                            target="_blank"
                            rel="noreferrer noopener"
                            className="footer-rede"
                        >
                            Facebook
                        </a>
                        <a
                            href={BLOG_URL}
                            target="_blank"
                            rel="noreferrer noopener"
                            className="footer-rede"
                        >
                            Brotero blog
                        </a>
                    </div>
                    <p>Biblioteca Brotero © 2025</p>
                    <p>
                        <a href={CC_URL} target="_blank" rel="noreferrer noopener">
                            Licença Creative Commons Attribution-ShareAlike 4.0 International
                        </a>
                    </p>
                    <p>Biblioteca Escolar da Escola Secundária Avelar Brotero, Coimbra</p>
                    <p>
                        Atualização: Setembro de 2025 –{' '}
                        <a href={EMAIL}>biblioteca@esab.pt</a>
                    </p>
                </div>
            </div>
        </footer>
    );
}

