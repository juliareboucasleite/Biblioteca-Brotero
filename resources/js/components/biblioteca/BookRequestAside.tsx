import { useState  } from 'react';
import type {FormEvent} from 'react';
import { LISTA_ESCOLAS } from '@/constants/escolas';
import type { LivroCatalogo } from '@/types/biblioteca';

type BookRequestAsideProps = {
    livro: LivroCatalogo;
    placeholder: boolean;
};

function getCsrfToken(): string | null {
    const match = document.cookie.match(/(?:^|;)\s*XSRF-TOKEN=([^;]+)/);

    return match ? match[1] : null;
}

export function BookRequestAside({ livro, placeholder }: BookRequestAsideProps) {
    const [requestType, setRequestType] = useState<'escola' | 'cacifo'>('escola');
    const [cardNumber, setCardNumber] = useState('');
    const [schoolLocation, setSchoolLocation] = useState<string>(LISTA_ESCOLAS[0] ?? '');
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        setSubmitError(null);
        setSuccessMessage(null);

        if (placeholder) {
            setSubmitError('Selecione um livro válido no catálogo.');

            return;
        }

        if (!/^[0-9]{5}$/.test(cardNumber)) {
            setSubmitError('O número do cartão deve ter 5 dígitos (apenas números).');

            return;
        }

        if (requestType === 'escola' && !schoolLocation.trim()) {
            setSubmitError('Selecione a biblioteca/escola para retirada.');

            return;
        }

        try {
            const csrf = getCsrfToken();
            const res = await fetch('/biblioteca/requisitar', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    ...(csrf ? { 'X-CSRF-TOKEN': csrf, 'X-XSRF-TOKEN': csrf } : {}),
                    Accept: 'application/json',
                },
                body: JSON.stringify({
                    book_id: Number(livro.id),
                    request_type: requestType,
                    card_number: cardNumber,
                    ...(requestType === 'escola' ? { school_location: schoolLocation } : {}),
                }),
            });

            type RequisitarResponse = {
                ok?: boolean;
                error?: string;
                message?: string;
                errors?: Record<string, unknown> | null;
            };

            const data = (await res.json()) as RequisitarResponse;

            if (!res.ok || !data?.ok) {
                const errors = data?.errors;
                let firstValidationError: string | null = null;

                if (errors && typeof errors === 'object') {
                    const first = Object.values(errors)[0];

                    if (Array.isArray(first) && typeof first[0] === 'string') {
                        firstValidationError = first[0];
                    }
                }

                const message =
                    data?.error ||
                    data?.message ||
                    firstValidationError ||
                    'Não foi possível criar o pedido. Tente novamente.';

                setSubmitError(message);

                return;
            }

            setSuccessMessage(data.message ?? 'Pedido criado com sucesso.');
        } catch {
            setSubmitError('Falha de rede ao requisitar. Tente novamente.');
        }
    };

    return (
        <aside className="border border-(--brotero-borda) rounded-(--raio) p-[20px] bg-(--brotero-branco) shadow-[0_1px_3px_rgba(0,0,0,0.06)] max-[900px]:col-span-2 max-[600px]:col-span-1">
            <h2 className="m-0 mb-[16px] text-[1.05rem] font-bold text-(--brotero-texto)">
                Como deseja retirar?
            </h2>
            <form action="#" method="post" onSubmit={handleSubmit}>
                {submitError ? (
                    <p className="m-0 mb-[12px] text-[14px] text-[#b42318] bg-[#fef3f2] border border-[#fecaca] p-[10px_12px] rounded-[6px]">
                        {submitError}
                    </p>
                ) : null}
                {successMessage ? (
                    <p className="m-0 mb-[12px] text-[14px] text-[#067647] bg-[#ecfdf5] border border-[#bbf7d0] p-[10px_12px] rounded-[6px]">
                        {successMessage}
                    </p>
                ) : null}

                <div className="flex flex-col gap-[12px] mb-[18px]">
                    <label className="flex items-center gap-[10px] cursor-pointer text-[14px] text-(--brotero-texto)">
                        <input
                            type="radio"
                            name="retirada"
                            value="escola"
                            checked={requestType === 'escola'}
                            onChange={() => setRequestType('escola')}
                            className="w-[18px] h-[18px] accent-(--brotero-primaria)"
                        />
                        <span>Retirada na escola desejada</span>
                    </label>
                    <label className="flex items-center gap-[10px] cursor-pointer text-[14px] text-(--brotero-texto)">
                        <input
                            type="radio"
                            name="retirada"
                            value="cacifo"
                            checked={requestType === 'cacifo'}
                            onChange={() => setRequestType('cacifo')}
                            className="w-[18px] h-[18px] accent-(--brotero-primaria)"
                        />
                        <span>Retirar em cacifo</span>
                    </label>
                </div>

                {requestType === 'escola' ? (
                    <div>
                        <label
                            htmlFor="pagina-livro-escola"
                            className="block mb-[6px] text-[13px] font-semibold text-(--brotero-texto-cinza)"
                        >
                            Biblioteca/escola
                        </label>
                        <select
                            id="pagina-livro-escola"
                            name="escola"
                            className="w-full p-[10px_12px] text-[14px] border border-(--brotero-borda) rounded-[6px] bg-(--brotero-branco) text-(--brotero-texto)"
                            value={schoolLocation}
                            onChange={(e) => setSchoolLocation(e.target.value)}
                            required
                        >
                            {LISTA_ESCOLAS.map((escola) => (
                                <option key={escola}>{escola}</option>
                            ))}
                            <option>Outra escola...</option>
                        </select>
                    </div>
                ) : null}

                <div>
                    <label
                        htmlFor="pagina-livro-cartao"
                        className="block mb-[6px] text-[13px] font-semibold text-(--brotero-texto-cinza)"
                    >
                        Número do cartão (5 dígitos)
                    </label>
                    <input
                        id="pagina-livro-cartao"
                        name="cartao"
                        className="w-full p-[10px_12px] text-[14px] border border-(--brotero-borda) rounded-[6px] bg-(--brotero-branco) text-(--brotero-texto)"
                        inputMode="numeric"
                        pattern="[0-9]{5}"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').slice(0, 5))}
                        placeholder="12345"
                        required
                    />
                </div>

                <button
                    type="submit"
                    className="w-full mt-[12px] px-[20px] py-[12px] border-0 rounded-(--raio) bg-(--brotero-primaria) text-white text-[15px] font-semibold cursor-pointer transition-opacity duration-150 ease-in-out hover:opacity-90"
                >
                    Requisitar livro
                </button>
            </form>
        </aside>
    );
}
