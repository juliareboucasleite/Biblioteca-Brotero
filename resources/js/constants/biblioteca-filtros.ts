/** Opções partilhadas entre formulários da biblioteca (`value` + rótulo). */
export const OPCOES_LINGUA = [
    { value: '', label: 'Todas as línguas' },
    { value: 'pt', label: 'Português' },
    { value: 'en', label: 'Inglês' },
    { value: 'fr', label: 'Francês' },
    { value: 'es', label: 'Espanhol' },
    { value: 'de', label: 'Alemão' },
    { value: 'it', label: 'Italiano' },
    { value: 'nl', label: 'Holandês' },
] as const;

export const OPCOES_TIPO_DOCUMENTO = [
    'Tudo',
    'Monografia (Texto Impresso)',
    'Publicação Periódica',
    'Registos Sonoros Musicais',
    'Analítico',
    'Multimédia',
] as const;
