import { useEffect, useMemo, useState } from 'react';
import { BroteroFooter } from '@/components/BroteroFooter';
import { BroteroHeader } from '@/components/BroteroHeader';
import { LISTA_ESCOLAS } from '@/constants/escolas';

type LivroDetalhe = {
    id: string;
    titulo: string;
    autor: string;
    desc: string;
    capa?: string | null;
};

const TEXTO_PLACEHOLDER = 'Os livros aparecerão aqui';

function isPlaceholder(livro: LivroDetalhe): boolean {
    return livro.titulo === TEXTO_PLACEHOLDER || !livro.titulo?.trim();
}

type LibraryBookProps = {
    livro: LivroDetalhe;
};

type BookApi = {
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
    details?: {
        publisher?: string | null;
        location?: string | null;
        format?: string | null;
        dimensions?: string | null;
    } | null;
};

export default function LibraryBook({ livro }: LibraryBookProps) {
    const placeholder = isPlaceholder(livro);
    const [bookApi, setBookApi] = useState<BookApi | null>(null);
    const isNumericId = useMemo(() => {
        const n = Number(livro.id);

        return Number.isFinite(n) && n > 0;
    }, [livro.id]);

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            if (placeholder || !isNumericId) {
                return;
            }

            try {
                const res = await fetch(`/books/${encodeURIComponent(livro.id)}`, {
                    headers: { Accept: 'application/json' },
                });

                if (!res.ok) {
                    return;
                }

                const data = (await res.json()) as BookApi;

                if (!cancelled) {
                    setBookApi(data);
                }
            } catch {
                // Mantém layout base sem detalhes extra.
            }
        };

        load();

        return () => {
            cancelled = true;
        };
    }, [placeholder, isNumericId, livro.id]);

    const coverSrc = (bookApi?.cover_image ?? livro.capa) || null;
    const authorsFromApi = bookApi?.authors?.map((a) => a?.name?.trim()).filter(Boolean) ?? [];
    const authorsLabel = authorsFromApi.length > 0 ? authorsFromApi.join(', ') : livro.autor;

    const details = bookApi?.details ?? null;

    const [requestType, setRequestType] = useState<'escola' | 'cacifo'>('escola');
    const [cardNumber, setCardNumber] = useState('');
    const [schoolLocation, setSchoolLocation] = useState<string>(LISTA_ESCOLAS[0] ?? '');
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const getCsrfToken = (): string | null => {
        const match = document.cookie.match(/(?:^|;)\s*XSRF-TOKEN=([^;]+)/);

        // Envia o token "raw" do cookie (evita divergências por decoding).
        return match ? match[1] : null;
    };

    const handleSubmit = async (e: React.FormEvent) => {
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

            const data = (await res.json()) as any;

            if (!res.ok || !data?.ok) {
                const errors = data?.errors as
                    | Record<string, unknown>
                    | undefined
                    | null;

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
        <>
            <div className="brotero-scope">
                <BroteroHeader />

                <main className="pagina-livro-main">
                <div className="container">
                    <p className="pagina-livro-voltar">
                        <a href="/biblioteca/livros" className="link-voltar">
                            ← Voltar ao catálogo
                        </a>
                    </p>
                    <div className="pagina-livro-layout">
                        <div className="pagina-livro-capa-wrap">
                            <div className="pagina-livro-capa" id="pagina-livro-capa">
                                {coverSrc && (
                                    <img
                                        className="pagina-livro-img"
                                        src={coverSrc}
                                        alt={`Capa do livro ${placeholder ? 'Livro' : livro.titulo}`}
                                        loading="lazy"
                                        referrerPolicy="no-referrer"
                                    />
                                )}
                            </div>
                        </div>
                        <div className="pagina-livro-desc">
                            <h1 className="pagina-livro-title" id="pagina-livro-title">
                                {placeholder ? 'Livro' : livro.titulo}
                            </h1>
                            {!placeholder && (
                                <>
                                    <p className="pagina-livro-author" id="pagina-livro-author">
                                        {authorsLabel}
                                    </p>
                                    <div className="pagina-livro-sinopse">
                                        <p className="pagina-livro-desc-text" id="pagina-livro-desc">
                                            {bookApi?.description ?? livro.desc}
                                        </p>
                                    </div>

                                    <div className="pagina-livro-meta">
                                        <h3 className="pagina-livro-meta-titulo">Detalhes do livro</h3>
                                        <div className="pagina-livro-meta-grid">
                                            {bookApi?.isbn ? (
                                                <div className="pagina-livro-meta-item">
                                                    <strong>ISBN</strong>
                                                    <span>{bookApi.isbn}</span>
                                                </div>
                                            ) : null}

                                            {bookApi?.published_year ? (
                                                <div className="pagina-livro-meta-item">
                                                    <strong>Ano</strong>
                                                    <span>{bookApi.published_year}</span>
                                                </div>
                                            ) : null}

                                            {bookApi?.pages ? (
                                                <div className="pagina-livro-meta-item">
                                                    <strong>Páginas</strong>
                                                    <span>{bookApi.pages}</span>
                                                </div>
                                            ) : null}

                                            {bookApi?.language ? (
                                                <div className="pagina-livro-meta-item">
                                                    <strong>Idioma</strong>
                                                    <span>{bookApi.language}</span>
                                                </div>
                                            ) : null}

                                            {details?.publisher ? (
                                                <div className="pagina-livro-meta-item">
                                                    <strong>Editora</strong>
                                                    <span>{details.publisher}</span>
                                                </div>
                                            ) : null}
                                        </div>
                                    </div>
                                </>
                            )}
                            {placeholder && (
                                <p className="pagina-livro-desc-text">
                                    Selecione um livro no catálogo para ver a ficha e requisitar.
                                </p>
                            )}
                        </div>
                        <aside className="pagina-livro-opcoes">
                            <h2 className="pagina-livro-opcoes-titulo">Como deseja retirar?</h2>
                            <form className="pagina-livro-form" action="#" method="post" onSubmit={handleSubmit}>
                                {submitError && <p className="pagina-livro-erro">{submitError}</p>}
                                {successMessage && <p className="pagina-livro-sucesso">{successMessage}</p>}

                                <div className="pagina-livro-retirada">
                                    <label className="pagina-livro-radio">
                                        <input
                                            type="radio"
                                            name="retirada"
                                            value="escola"
                                            checked={requestType === 'escola'}
                                            onChange={() => setRequestType('escola')}
                                        />
                                        <span>Retirada na escola desejada</span>
                                    </label>
                                    <label className="pagina-livro-radio">
                                        <input
                                            type="radio"
                                            name="retirada"
                                            value="cacifo"
                                            checked={requestType === 'cacifo'}
                                            onChange={() => setRequestType('cacifo')}
                                        />
                                        <span>Retirar em cacifo</span>
                                    </label>
                                </div>

                                {requestType === 'escola' && (
                                    <div className="pagina-livro-escola">
                                        <label htmlFor="pagina-livro-escola">Biblioteca/escola</label>
                                        <select
                                            id="pagina-livro-escola"
                                            name="escola"
                                            className="pagina-livro-select"
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
                                )}

                                <div className="pagina-livro-escola">
                                    <label htmlFor="pagina-livro-cartao">Número do cartão (5 dígitos)</label>
                                    <input
                                        id="pagina-livro-cartao"
                                        name="cartao"
                                        className="pagina-livro-select"
                                        inputMode="numeric"
                                        pattern="[0-9]{5}"
                                        value={cardNumber}
                                        onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').slice(0, 5))}
                                        placeholder="12345"
                                        required
                                    />
                                </div>

                                <button type="submit" className="pagina-livro-submit">
                                    Requisitar livro
                                </button>
                            </form>
                        </aside>
                    </div>
                </div>
            </main>

            <BroteroFooter />
            </div>
        </>
    );
}
