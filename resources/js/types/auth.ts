export type User = {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    two_factor_enabled?: boolean;
    created_at: string;
    updated_at: string;
    [key: string]: unknown;
};

/** Leitor autenticado na área «Minha conta» (cartão). */
export type PatronPortalMode = 'bibliotecaria' | 'comunidade';

export type LibraryPatronAuth = {
    id: number;
    name: string | null;
    card_number: string;
    /** Pontos de gamificação (requisição / devolução no prazo). */
    points?: number;
    /** Só bibliotecárias/os com cartão dedicado escolhem o modo ao entrar. */
    portal_mode: PatronPortalMode;
    /** Se o cartão está marcado como bibliotecária/o (BD ou env). */
    is_librarian: boolean;
};

/** Utilizadores web com acesso ao painel /staff/pedidos (config `biblioteca.staff_user_emails`). */
export type StaffBibliotecaShared = {
    canAccessPedidos: boolean;
    pedidosUrl: string | null;
};

export type Auth = {
    user: User | null;
    patron: LibraryPatronAuth | null;
};

export type TwoFactorSetupData = {
    svg: string;
    url: string;
};

export type TwoFactorSecretKey = {
    secretKey: string;
};
