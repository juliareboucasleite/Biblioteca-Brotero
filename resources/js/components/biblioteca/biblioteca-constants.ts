/** Título placeholder usado quando ainda não existe livro real no catálogo. */
export const BIBLIOTECA_LIVRO_PLACEHOLDER_TITULO = 'Os livros aparecerão aqui';

export function isLivroPlaceholder(titulo: string | undefined | null): boolean {
    return titulo === BIBLIOTECA_LIVRO_PLACEHOLDER_TITULO || !titulo?.trim();
}
