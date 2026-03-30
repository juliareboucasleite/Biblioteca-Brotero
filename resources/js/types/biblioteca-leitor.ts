/** Linha de pedido na área do leitor (Inertia). */
export type PedidoLeitor = {
    id: number;
    book_title: string;
    request_type: string;
    status: string;
    isbn: string | null;
    school_location: string | null;
    cacifo_code: string | null;
    pickup_deadline: string | null;
    return_deadline: string | null;
    returned_at: string | null;
    created_at: string | null;
    /** Multa acumulada em atraso (EUR), string decimal. */
    fine_amount?: string;
    /** Motivo indicado pela biblioteca quando o pedido foi recusado. */
    staff_rejection_reason?: string | null;
    /** Mensagem da biblioteca visível ao aluno (balcão / modo bibliotecário). */
    patron_visible_note?: string | null;
};
