import { Form, Head, Link } from '@inertiajs/react';
import { BibliotecaCatalogShell } from '@/components/biblioteca/BibliotecaCatalogShell';

type Props = {
    greeting_name?: string | null;
};

const sessaoBtnPrimaryClass =
    'inline-flex w-full flex-col items-start rounded-[12px] border border-(--brotero-primaria) bg-(--brotero-primaria) px-[18px] py-[16px] text-left text-[15px] leading-snug text-white shadow-[0_10px_24px_rgba(71,94,114,0.28)] transition duration-150 hover:brightness-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--brotero-primaria)/35 disabled:cursor-not-allowed disabled:opacity-65';

const sessaoBtnSecondaryClass =
    'inline-flex w-full flex-col items-start rounded-[12px] border-2 border-(--brotero-primaria) bg-(--brotero-branco) px-[18px] py-[16px] text-left text-[15px] leading-snug text-(--brotero-texto) transition duration-150 hover:bg-(--brotero-fundo) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--brotero-primaria)/30 disabled:cursor-not-allowed disabled:opacity-65';

export default function BibliotecaLoginPortal({ greeting_name }: Props) {
    const label =
        greeting_name && greeting_name.trim() !== ''
            ? `Olá, ${greeting_name.trim()}: como vai utilizar a sessão?`
            : 'Como vai utilizar a sessão?';

    return (
        <>
            <Head title="Modo de sessão · Leitor" />

            <BibliotecaCatalogShell>
                <div className="mx-auto flex min-h-[calc(100vh-160px)] w-full max-w-[520px] flex-col justify-center py-[18px]">
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
