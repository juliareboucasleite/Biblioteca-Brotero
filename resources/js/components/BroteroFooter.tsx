import React from 'react';

const BLOG_URL = 'https://bbrotero.blogspot.com/';
const EMAIL = 'mailto:biblioteca@esab.pt';
const CC_URL = 'https://creativecommons.org/licenses/by-sa/4.0/';

export function BroteroFooter() {
    return (
        <footer className="mt-[32px] bg-[#3c3c3c] text-[#ccc] py-[16px] text-[12px]">
            <div className="w-full max-w-(--max-largura) mx-auto px-[10px]">
                <div className="text-center">
                    <div className="flex flex-wrap justify-center gap-x-6 gap-y-4 mb-4">
                        <a
                            href="https://www.instagram.com/bibabrotero/"
                            target="_blank"
                            rel="noreferrer noopener"
                            className="inline-flex items-center gap-[0.35rem] text-[#ccc] no-underline hover:text-white hover:underline"
                        >
                            Instagram
                        </a>
                        <a
                            href="https://www.facebook.com/BibliotecaEscolarAvelarBrotero"
                            target="_blank"
                            rel="noreferrer noopener"
                            className="inline-flex items-center gap-[0.35rem] text-[#ccc] no-underline hover:text-white hover:underline"
                        >
                            Facebook
                        </a>
                        <a
                            href={BLOG_URL}
                            target="_blank"
                            rel="noreferrer noopener"
                            className="inline-flex items-center gap-[0.35rem] text-[#ccc] no-underline hover:text-white hover:underline"
                        >
                            Brotero blog
                        </a>
                    </div>
                    <p className="my-[4px]">Biblioteca Brotero © 2025</p>
                    <p className="my-[4px]">
                        <a href={CC_URL} target="_blank" rel="noreferrer noopener">
                            Licença Creative Commons Attribution-ShareAlike 4.0 International
                        </a>
                    </p>
                    <p className="my-[4px]">Biblioteca Escolar da Escola Secundária Avelar Brotero, Coimbra</p>
                    <p className="my-[4px]">
                        Atualização: Setembro de 2025 –{' '}
                        <a className="text-[#5d7a8c] hover:text-[#e8ecf0] hover:underline" href={EMAIL}>
                            biblioteca@esab.pt
                        </a>
                    </p>
                </div>
            </div>
        </footer>
    );
}

