import { Form, Head, Link } from '@inertiajs/react';
import { BibliotecaCatalogShell } from '@/components/biblioteca/BibliotecaCatalogShell';

type Props = {
    greeting_name?: string | null;
};

const sessaoBtnPrimaryClass =
    'w-full rounded-(--raio) border-0 bg-(--brotero-primaria) px-[18px] py-[16px] text-left text-[15px] font-semibold leading-snug text-white shadow-[0_1px_3px_rgba(0,0,0,0.12)] transition-opacity hover:opacity-92 focus:outline-none focus-visible:ring-2 focus-visible:ring-(--brotero-primaria) focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';

const sessaoBtnSecondaryClass =
    'w-full rounded-(--raio) border-2 border-(--brotero-primaria) bg-(--brotero-branco) px-[18px] py-[16px] text-left text-[15px] font-semibold leading-snug text-(--brotero-texto) shadow-[0_1px_2px_rgba(0,0,0,0.06)] transition-colors hover:bg-(--brotero-fundo) focus:outline-none focus-visible:ring-2 focus-visible:ring-(--brotero-primaria)/50 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';

export default function BibliotecaLoginPortal({ greeting_name }: Props) {
    const label =
        greeting_name && greeting_name.trim() !== ''
            ? `Olá, ${greeting_name.trim()}: como vai utilizar a sessão?`
            : 'Como vai utilizar a sessão?';

    return (
        <>
            <Head title="Modo de sessão · Leitor" />

            <BibliotecaCatalogShell>
                <div className="mx-auto w-full max-w-[520px] pt-[4px] lg:pt-0">
                    <div className="rounded-[18px] border border-(--brotero-borda-suave) bg-(--brotero-branco) px-[22px] py-[26px] shadow-[0_8px_28px_rgba(42,38,48,0.06)] sm:px-[26px] sm:py-[30px]">
                        <h1 className="m-0 mb-[10px] text-[1.45rem] font-bold leading-tight tracking-tight text-(--brotero-texto)">
                            Entrada · biblioteca
                        </h1>
                        <p className="m-0 mb-[26px] text-[15px] leading-relaxed text-(--brotero-texto-cinza)">
                            {label}
                        </p>

                        <div className="flex flex-col gap-[16px]">
                            <Form method="post" action="/biblioteca/entrar/modo" className="m-0">
                                {({ processing }) => (
                                    <>
                                        <input type="hidden" name="portal_mode" value="bibliotecaria" />
                                        <button type="submit" disabled={processing} className={sessaoBtnPrimaryClass}>
                                            <span className="block">Bibliotecária / Bibliotecário</span>
                                            <span className="mt-[6px] block text-[13px] font-normal leading-snug text-white/90">
                                                Gerir balcão, aprovar pedidos e registar livros.
                                            </span>
                                        </button>
                                    </>
                                )}
                            </Form>

                            <Form method="post" action="/biblioteca/entrar/modo" className="m-0">
                                {({ processing }) => (
                                    <>
                                        <input type="hidden" name="portal_mode" value="comunidade" />
                                        <button type="submit" disabled={processing} className={sessaoBtnSecondaryClass}>
                                            <span className="block text-(--brotero-texto)">
                                                Aluno / Professor / Funcionário
                                            </span>
                                            <span className="mt-[6px] block text-[13px] font-normal leading-snug text-(--brotero-texto-cinza)">
                                                Requisitar livros, favoritos e histórico na comunidade.
                                            </span>
                                        </button>
                                    </>
                                )}
                            </Form>
                        </div>
                    </div>

                    <p className="m-0 mt-[22px] text-center text-[14px] text-(--brotero-texto-cinza) sm:text-left">
                        <Link
                            href="/biblioteca/entrar"
                            className="font-semibold text-(--brotero-texto-link) hover:text-(--brotero-texto-link-hover) hover:underline"
                        >
                            ← Voltar ao início de sessão
                        </Link>
                    </p>
                </div>
            </BibliotecaCatalogShell>
        </>
    );
}
