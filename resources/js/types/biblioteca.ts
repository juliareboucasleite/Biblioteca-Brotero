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
    /** false se estiver bloqueado ou for a própria partilha. */
    pode_contactar: boolean;
    message: string | null;
    created_at: string;
    patron_label: string;
    livro: LivroCatalogo;
};

/** Item na lista «Mensagens» (área do leitor). */
export type ChatConversaLista = {
    id: string;
    outro_label: string;
    resumo: string | null;
    ultima_em: string | null;
    nao_lidas: number;
    /** Destinatário: há pedido por aceitar ou recusar. */
    precisa_acao: boolean;
    sou_iniciador: boolean;
    estado: 'active' | 'pending' | 'declined';
};

/** Detalhe da conversa na página de chat (consentimento antes de mensagens). */
export type ChatConversaDetalhe = {
    id: string;
    outro_id: string | null;
    outro_label: string;
    estado: 'active' | 'pending' | 'declined';
    sou_iniciador: boolean;
    pode_enviar_mensagens: boolean;
    /** Partilhar livros do catálogo (só com conversa aceite). */
    pode_partilhar_livros: boolean;
    pode_aceitar: boolean;
    pode_recusar: boolean;
    pode_cancelar_pedido: boolean;
    mostrar_menu_seguranca: boolean;
    /** Ver perfil resumido (só com conversa aceite). */
    mostrar_perfil_peer: boolean;
};

/** Livro sugerido na conversa entre dois leitores. */
export type ChatLivroPartilhado = {
    id: string;
    nota: string | null;
    de_mim: boolean;
    criado_em: string;
    livro: {
        id: string;
        titulo: string;
        autor: string;
        capa: string | null;
        tem_ebook: boolean;
    };
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
    /** Transferências registadas (botão «Baixar» na ficha). */
    ebook_downloads_count?: number;
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
