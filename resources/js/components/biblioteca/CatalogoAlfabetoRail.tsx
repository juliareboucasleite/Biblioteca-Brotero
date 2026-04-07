import { useCallback } from 'react';
import { LETRAS_CARRIL_ALFABETO, catalogoSectionId } from '@/lib/catalogo-alfabeto';

type CatalogoAlfabetoRailProps = {
    letrasComLivros: Set<string>;
};

export function CatalogoAlfabetoRail({ letrasComLivros }: CatalogoAlfabetoRailProps) {
    const scrollToLetter = useCallback((letter: string) => {
        const id = catalogoSectionId(letter);
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, []);

    return (
        <nav
            className="hidden min-[900px]:flex flex-col shrink-0 w-[32px] sticky top-[76px] self-start max-h-[min(560px,calc(100vh-100px))] overflow-y-auto py-[4px] pl-[4px]"
            aria-label="Índice alfabético: saltar para a letra"
        >
            {LETRAS_CARRIL_ALFABETO.map((letter) => {
                const activo = letrasComLivros.has(letter);
                const label = letter === '#' ? '0–9 e outros' : letter;

                return (
                    <button
                        key={letter}
                        type="button"
                        disabled={!activo}
                        title={activo ? `Ir para «${label}»` : `Sem livros em «${label}»`}
                        onClick={() => activo && scrollToLetter(letter)}
                        className={
                            activo
                                ? 'cursor-pointer rounded text-[11px] font-semibold leading-[1.1] py-[3px] text-(--brotero-texto-link) hover:underline hover:text-(--brotero-texto-link-hover)'
                                : 'cursor-default rounded text-[11px] leading-[1.1] py-[3px] text-(--brotero-texto-cinza) opacity-35'
                        }
                    >
                        {letter}
                    </button>
                );
            })}
        </nav>
    );
}
