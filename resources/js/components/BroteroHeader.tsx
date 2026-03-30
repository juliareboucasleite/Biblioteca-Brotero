import { usePage } from '@inertiajs/react';
import type { Auth } from '@/types/auth';

export function BroteroHeader() {
    const { auth } = usePage<{ auth: Auth }>().props;
    const currentParams =
        typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    const categoria = currentParams?.get('categoria') ?? '';
    const lingua = currentParams?.get('lingua') ?? '';
    const saudacao = auth.patron?.name?.trim()
        ? auth.patron.name
        : auth.patron
          ? `Cartão · ${auth.patron.card_number}`
          : null;

    return (
        <header className="bg-(--brotero-nav) text-white py-[10px] min-h-[60px] mb-2">
            <div className="w-full max-w-(--max-largura) mx-auto px-[10px]">
                <div className="flex items-center gap-[30px] flex-wrap max-[768px]:flex-col max-[768px]:items-stretch">
                    <a
                        href="/biblioteca"
                        className="flex items-center gap-[8px] text-white no-underline mr-[8px] hover:text-(--brotero-laranja-hover) hover:no-underline"
                    >
                        <img
                            src="/images/logo.png"
                            alt="Biblioteca Brotero"
                            className="h-[36px] w-auto block"
                        />
                        <span className="text-[1.25rem] font-bold whitespace-nowrap">
                            Biblioteca Brotero
                        </span>
                    </a>

                    <div className="flex-1 min-w-0 flex items-center gap-[12px] max-[768px]:flex-col max-[768px]:items-stretch max-[768px]:w-full">
                    <form
                        className="flex-1 min-w-0 max-w-[1000px] h-[40px] bg-(--brotero-branco) rounded-[1px] overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.12)] max-[768px]:max-w-none flex"
                        action="/biblioteca"
                        method="get"
                    >
                        {categoria !== '' && <input type="hidden" name="categoria" value={categoria} />}
                        {lingua !== '' && <input type="hidden" name="lingua" value={lingua} />}
                        <input
                            type="text"
                            className="flex-1 min-w-0 bg-transparent border-none p-[8px_14px] text-[15px] text-(--brotero-texto) placeholder:text-(--brotero-texto-cinza) focus:outline-none"
                            placeholder="Pesquisar livros..."
                            name="q"
                            defaultValue={currentParams?.get('q') ?? ''}
                        />
                        <button
                            type="submit"
                            aria-label="Pesquisar"
                            className="px-[16px] border-0 rounded-none bg-(--brotero-primaria-claro) text-white cursor-pointer text-[1.25rem] leading-none transition-colors duration-150 ease-in-out flex items-center justify-center hover:bg-(--brotero-primaria-escuro)"
                        >
                            <span className="inline-block text-[1.25rem] leading-none" aria-hidden="true">
                                ⌕
                            </span>
                        </button>
                    </form>

                    <div className="flex items-center gap-[10px] shrink-0 text-[14px] max-[768px]:justify-center">
                        {auth.patron ? (
                            <>
                                <span className="opacity-90 whitespace-nowrap max-[480px]:hidden">
                                    {saudacao}
                                </span>
                                <a
                                    href="/biblioteca/conta/pedidos"
                                    className="text-white no-underline font-semibold whitespace-nowrap px-[12px] py-[6px] rounded-[4px] border border-white/40 hover:bg-white/10 hover:no-underline"
                                >
                                    Minha conta
                                </a>
                            </>
                        ) : (
                            <a
                                href="/biblioteca/entrar"
                                className="text-white no-underline font-semibold whitespace-nowrap px-[12px] py-[6px] rounded-[4px] border border-white/40 hover:bg-white/10 hover:no-underline"
                            >
                                Entrar
                            </a>
                        )}
                    </div>
                    </div>
                </div>
            </div>
        </header>
    );
}

