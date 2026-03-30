import { Form, Head, Link } from '@inertiajs/react';
import { BroteroFooter } from '@/components/BroteroFooter';
import { BroteroHeader } from '@/components/BroteroHeader';
import { Button } from '@/components/ui/button';

type Props = {
    greeting_name?: string | null;
};

export default function BibliotecaLoginPortal({ greeting_name }: Props) {
    const label =
        greeting_name && greeting_name.trim() !== ''
            ? `Olá, ${greeting_name.trim()} — como vai utilizar a sessão?`
            : 'Como vai utilizar a sessão?';

    return (
        <>
            <Head title="Modo de sessão — Leitor" />

            <div className="min-h-screen flex flex-col bg-(--brotero-fundo) text-(--brotero-texto)">
                <BroteroHeader />

                <main className="mx-auto w-full max-w-[480px] flex-1 px-[10px] pt-[24px] pb-[40px]">
                    <h1 className="m-0 mb-[12px] text-[1.35rem] font-bold text-(--brotero-texto)">
                        Entrada — biblioteca
                    </h1>
                    <p className="m-0 mb-[28px] text-[14px] text-(--brotero-texto-cinza)">{label}</p>

                    <div className="flex flex-col gap-[14px]">
                        <Form method="post" action="/biblioteca/entrar/modo" className="m-0">
                            {({ processing }) => (
                                <>
                                    <input type="hidden" name="portal_mode" value="bibliotecaria" />
                                    <Button
                                        type="submit"
                                        className="h-auto min-h-[52px] w-full whitespace-normal bg-(--brotero-primaria) px-[16px] py-[14px] text-[15px] font-semibold leading-snug hover:opacity-90"
                                        disabled={processing}
                                    >
                                        Bibliotecária / Bibliotecário
                                    </Button>
                                </>
                            )}
                        </Form>

                        <Form method="post" action="/biblioteca/entrar/modo" className="m-0">
                            {({ processing }) => (
                                <>
                                    <input type="hidden" name="portal_mode" value="comunidade" />
                                    <Button
                                        type="submit"
                                        variant="outline"
                                        className="h-auto min-h-[52px] w-full whitespace-normal border-(--brotero-borda) px-[16px] py-[14px] text-[15px] font-semibold leading-snug text-(--brotero-texto)"
                                        disabled={processing}
                                    >
                                        Aluno / Professor / Funcionário
                                    </Button>
                                </>
                            )}
                        </Form>
                    </div>

                    <p className="mt-[28px] text-[13px] text-(--brotero-texto-cinza)">
                        <Link href="/biblioteca/entrar" className="text-(--brotero-texto-link) hover:underline">
                            ← Voltar ao início de sessão
                        </Link>
                    </p>
                </main>

                <BroteroFooter />
            </div>
        </>
    );
}
