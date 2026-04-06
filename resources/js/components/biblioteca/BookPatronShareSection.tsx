import { Form, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import type { Auth } from '@/types/auth';

type PatronShare = {
    id: number;
    message: string | null;
};

type BookPatronShareSectionProps = {
    bookId: string;
    patronShare: PatronShare | null;
    hidden?: boolean;
};

export function BookPatronShareSection({
    bookId,
    patronShare,
    hidden = false,
}: BookPatronShareSectionProps) {
    const { auth } = usePage<{ auth: Auth }>().props;
    const patron = auth.patron;
    const [removing, setRemoving] = useState(false);

    if (hidden) {
        return null;
    }

    return (
        <section
            className="mt-[28px] rounded-[18px] border border-(--brotero-borda-suave) bg-(--brotero-branco) p-[18px_20px] shadow-[0_8px_28px_rgba(42,38,48,0.06)]"
            aria-labelledby="titulo-partilha-livro"
        >
            <div className="mb-[12px] flex flex-wrap items-baseline justify-between gap-[10px]">
                <h2
                    id="titulo-partilha-livro"
                    className="m-0 text-[1.1rem] font-bold text-(--brotero-texto)"
                >
                    Recomendar à comunidade
                </h2>
                <Link
                    href="/biblioteca/descobertas"
                    className="text-[13px] font-semibold text-(--brotero-texto-link) no-underline hover:text-(--brotero-texto-link-hover) hover:underline"
                >
                    Ver descobertas
                </Link>
            </div>
            <p className="m-0 mb-[14px] text-[14px] leading-snug text-(--brotero-texto-cinza)">
                Partilhe uma nota curta sobre este livro. Aparece no feed «Descobertas» para outros leitores
                descobrirem títulos e requisitarem no balcão.
            </p>

            {!patron ? (
                <p className="m-0 text-[14px] text-(--brotero-texto)">
                    <a
                        href="/biblioteca/entrar"
                        className="font-semibold text-(--brotero-texto-link) hover:text-(--brotero-texto-link-hover) hover:underline"
                    >
                        Entre com o cartão
                    </a>{' '}
                    para publicar a sua recomendação.
                </p>
            ) : (
                <>
                    <Form
                        action="/biblioteca/descobertas"
                        method="post"
                        className="flex flex-col gap-[12px]"
                        preserveScroll
                    >
                        {({ processing, errors }) => (
                            <>
                                <input type="hidden" name="book_id" value={bookId} />
                                <div className="grid gap-[6px]">
                                    <label
                                        htmlFor="partilha-mensagem"
                                        className="text-[13px] font-semibold text-(--brotero-texto)"
                                    >
                                        A sua mensagem (opcional, máx. 500 caracteres)
                                    </label>
                                    <textarea
                                        id="partilha-mensagem"
                                        name="message"
                                        rows={3}
                                        maxLength={500}
                                        defaultValue={patronShare?.message ?? ''}
                                        className="resize-y rounded-(--raio) border border-(--brotero-borda) bg-(--brotero-branco) px-[12px] py-[10px] text-[14px] text-(--brotero-texto) placeholder:text-(--brotero-texto-cinza) focus:border-(--brotero-primaria) focus:outline-none focus:ring-2 focus:ring-(--brotero-primaria)/25"
                                        placeholder="Porque é que vale a pena ler este livro?"
                                    />
                                    <InputError message={errors.message} />
                                </div>
                                <div className="flex flex-wrap items-center gap-[12px]">
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="cursor-pointer rounded-full border-0 bg-(--brotero-primaria) px-[20px] py-[10px] text-[14px] font-semibold text-white shadow-[0_4px_14px_rgba(77,107,122,0.3)] transition-opacity hover:opacity-92 disabled:cursor-not-allowed disabled:opacity-55"
                                    >
                                        {processing
                                            ? 'A guardar…'
                                            : patronShare
                                              ? 'Atualizar recomendação'
                                              : 'Publicar recomendação'}
                                    </button>
                                    {patronShare ? (
                                        <button
                                            type="button"
                                            disabled={removing}
                                            onClick={() => {
                                                if (
                                                    ! window.confirm(
                                                        'Remover a sua recomendação deste livro no feed?',
                                                    )
                                                ) {
                                                    return;
                                                }

                                                setRemoving(true);
                                                router.delete(
                                                    `/biblioteca/descobertas/${patronShare.id}`,
                                                    {
                                                        preserveScroll: true,
                                                        onFinish: () => setRemoving(false),
                                                    },
                                                );
                                            }}
                                            className="cursor-pointer rounded-full border border-(--brotero-borda) bg-transparent px-[18px] py-[9px] text-[13px] font-semibold text-(--brotero-texto-cinza) hover:border-red-300 hover:bg-red-50 hover:text-red-800 disabled:cursor-not-allowed disabled:opacity-55"
                                        >
                                            {removing ? 'A remover…' : 'Remover'}
                                        </button>
                                    ) : null}
                                </div>
                            </>
                        )}
                    </Form>
                </>
            )}
        </section>
    );
}
