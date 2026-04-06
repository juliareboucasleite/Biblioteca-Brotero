/** Catálogo / listagens / card (formato Inertia + UI). */
export type LivroCatalogo = {
    id: string;
    titulo: string;
    autor: string;
    desc: string;
    capa?: string | null;
    /** Presente em rankings (ex.: mais requisitados). */
    requisicoes_count?: number;
    /** Indica PDF/EPUB disponível para leitura autenticada. */
    tem_ebook?: boolean;
};

/** Uma recomendação no feed «Descobertas». */
export type DescobertaEntrada = {
    id: string;
    /** Identificador do leitor que partilhou (para abrir conversa privada). */
    patron_id: number;
    message: string | null;
    created_at: string;
    patron_label: string;
    livro: LivroCatalogo;
};

/** Item na lista «Mensagens» (área do leitor). */
export type ChatConversaLista = {
    id: string;
    outro_label: string;
    ultima_mensagem: string | null;
    ultima_em: string | null;
    nao_lidas: number;
};

/** Mensagem numa conversa 1:1. */
export type ChatMensagem = {
    id: string;
    body: string;
    created_at: string;
    minha: boolean;
    remetente_label: string;
};

/** Subconjunto devolvido em `recommendations` no detalhe do livro. */
export type BookRecommendationApi = {
    id: number | string;
    title?: string | null;
    description?: string | null;
    cover_image?: string | null;
    authors?: Array<{ id: number | string; name?: string | null }> | null;
};

export type BookApi = {
    id: number | string;
    title?: string | null;
    description?: string | null;
    isbn?: string | null;
    published_year?: number | string | null;
    pages?: number | string | null;
    cover_image?: string | null;
    language?: string | null;
    authors?: Array<{ id: number | string; name?: string | null }> | null;
    categories?: Array<{ id: number | string; name?: string | null }> | null;
    /** true se não houver requisição ativa para o exemplar. */
    available?: boolean | null;
    /** Existe ficheiro e-book (PDF ou EPUB) no armazenamento privado. */
    has_ebook?: boolean;
    ebook_format?: 'pdf' | 'epub' | null;
    details?: {
        publisher?: string | null;
        location?: string | null;
        format?: string | null;
        dimensions?: string | null;
    } | null;
    recommendations?: BookRecommendationApi[] | null;
    /** Livros que partilham categoria(s) com o atual (API `/books/{id}`). */
    category_recommendations?: BookRecommendationApi[] | null;
    /** Outros livros recentes no catálogo (exclui o atual e os já listados acima). */
    fallback_recommendations?: BookRecommendationApi[] | null;
};
