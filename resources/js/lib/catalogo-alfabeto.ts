import type { LivroCatalogo } from '@/types/biblioteca';

/** Letra A–Z ou «#» para dígitos / outros / vazio. */
export function letraIndiceTitulo(titulo: string): string {
    const t = titulo.trim();

    if (t === '') {
        return '#';
    }

    const base = t.normalize('NFD').replace(/\p{M}/gu, '');
    const first = base.charAt(0).toUpperCase();

    if (/^[A-Z]$/.test(first)) {
        return first;
    }

    if (/^[0-9]$/.test(first)) {
        return '#';
    }

    return '#';
}

export type GrupoCatalogoLetra = {
    letter: string;
    livros: LivroCatalogo[];
};

/**
 * Ordena por título (pt) e agrupa pela primeira letra.
 */
export function ordenarEAgruparLivrosPorLetra(livros: LivroCatalogo[]): GrupoCatalogoLetra[] {
    const sorted = [...livros].sort((a, b) =>
        a.titulo.localeCompare(b.titulo, 'pt', { sensitivity: 'base' }),
    );
    const map = new Map<string, LivroCatalogo[]>();

    for (const livro of sorted) {
        const key = letraIndiceTitulo(livro.titulo);
        const bucket = map.get(key);

        if (bucket === undefined) {
            map.set(key, [livro]);
        } else {
            bucket.push(livro);
        }
    }

    const letters = [...map.keys()].sort((a, b) => {
        if (a === '#') {
            return -1;
        }

        if (b === '#') {
            return 1;
        }

        return a.localeCompare(b, 'pt');
    });

    return letters.map((letter) => {
        const group = map.get(letter);

        return { letter, livros: group ?? [] };
    });
}

export const LETRAS_CARRIL_ALFABETO = ['#', ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')] as const;

export function catalogoSectionId(letter: string): string {
    return letter === '#' ? 'catalogo-letra-outros' : `catalogo-letra-${letter}`;
}
