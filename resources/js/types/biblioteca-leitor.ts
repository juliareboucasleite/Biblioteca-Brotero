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
};
