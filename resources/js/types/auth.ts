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
export type LibraryPatronAuth = {
    id: number;
    name: string | null;
    card_number: string;
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
