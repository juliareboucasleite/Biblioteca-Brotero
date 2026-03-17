import React from 'react';

export function BroteroFooter() {
    return (
        <footer className="brotero-footer">
            <div className="container">
                <div className="footer-inner">
                    <div className="footer-redes">
                        <a href="#" className="footer-rede">
                            <span>Facebook</span>
                        </a>
                        <a href="#" className="footer-rede">
                            <span>Instagram</span>
                        </a>
                    </div>
                    <p>© {new Date().getFullYear()} Biblioteca Brotero</p>
                    <p>
                        Desenvolvido pela{' '}
                        <a href="#" target="_blank" rel="noreferrer">
                            Escola Secundária Avelar Brotero
                        </a>
                    </p>
                </div>
            </div>
        </footer>
    );
}

