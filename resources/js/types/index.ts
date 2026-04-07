export type * from './auth';
export type * from './biblioteca-leitor';
export type * from './biblioteca';
export type * from './navigation';
export type * from './ui';

export type Category = {
    id: string | number;
    name: string;
    /** Identificador estável após `biblioteca:consolidate-categories` (ícones / ordem no catálogo). */
    slug?: string | null;
};