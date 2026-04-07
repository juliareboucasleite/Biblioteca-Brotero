/** Formatação pt-PT para datas e moeda (área leitor / catálogo). */

export function formatDt(iso: string | null): string {
    if (!iso) {
        return '-';
    }

    try {
        return new Intl.DateTimeFormat('pt-PT', {
            dateStyle: 'short',
            timeStyle: 'short',
        }).format(new Date(iso));
    } catch {
        return iso;
    }
}

export function formatEur(val: string | undefined | null): string {
    if (val === undefined || val === null) {
        return '-';
    }

    const n = Number(val);

    if (!Number.isFinite(n) || n <= 0) {
        return '0,00 €';
    }

    return new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(n);
}
