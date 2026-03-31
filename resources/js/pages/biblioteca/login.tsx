import { Form, Head } from '@inertiajs/react';
import { BroteroFooter } from '@/components/BroteroFooter';
import { BroteroHeader } from '@/components/BroteroHeader';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Props = {
    status?: string;
};

export default function BibliotecaLogin({ status }: Props) {
    return (
        <>
            <Head title="Entrar — Leitor" />

            <div className="min-h-screen flex flex-col bg-(--brotero-fundo) text-(--brotero-texto)">
                <BroteroHeader />

                <main className="w-full max-w-[420px] mx-auto px-[10px] flex-1 pt-[24px] pb-[40px]">
                    <h1 className="m-0 mb-[8px] text-[1.35rem] font-bold text-(--brotero-texto)">
                        Entrar na sua conta
                    </h1>
                    <p className="m-0 mb-[24px] text-[14px] text-(--brotero-texto-cinza)">
                        Introduza o número do cartão da biblioteca e a senha. Formato corrido, só algarismos:{' '}
                        <strong>DDMMAA</strong> (6) ou <strong>DDMMAAAA</strong> (8), sem barras nem hífens.
                    </p>

                    <Form method="post" action="/biblioteca/entrar" className="flex flex-col gap-[18px]">
                        {({ processing, errors }) => (
                            <>
                                <div className="grid gap-2">
                                    <Label htmlFor="card_number">Número do cartão (5 dígitos)</Label>
                                    <Input
                                        id="card_number"
                                        name="card_number"
                                        inputMode="numeric"
                                        pattern="[0-9]{5}"
                                        maxLength={5}
                                        required
                                        autoComplete="username"
                                        placeholder="12345"
                                        className="bg-(--brotero-branco)"
                                    />
                                    <InputError message={errors.card_number} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="password">Senha:</Label>
                                    <PasswordInput
                                        id="password"
                                        name="password"
                                        required
                                        inputMode="numeric"
                                        autoComplete="current-password"
                                        placeholder="ex.: 231184 ou 23111984"
                                        maxLength={32}
                                        className="bg-(--brotero-branco)"
                                    />
                                    <InputError message={errors.password} />
                                </div>

                                <div className="flex items-center gap-2">
                                    <Checkbox id="remember" name="remember" />
                                    <Label htmlFor="remember" className="font-normal cursor-pointer">
                                        Manter sessão neste dispositivo
                                    </Label>
                                </div>

                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full cursor-pointer rounded-(--raio) border-0 bg-(--brotero-primaria) px-4 py-3.5 text-[15px] font-semibold text-white shadow-[0_1px_3px_rgba(0,0,0,0.14)] transition-opacity hover:opacity-92 focus:outline-none focus-visible:ring-2 focus-visible:ring-(--brotero-primaria) focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-55"
                                >
                                    {processing ? 'A entrar…' : 'Entrar'}
                                </button>
                            </>
                        )}
                    </Form>

                    {status ? (
                        <p className="mt-[16px] text-[14px] text-green-700 bg-green-50 border border-green-200 rounded-(--raio) p-[12px]">
                            {status}
                        </p>
                    ) : null}

                    <p className="mt-[24px] text-[13px] text-(--brotero-texto-cinza)">
                        <a href="/biblioteca" className="text-(--brotero-texto-link) hover:underline">
                            ← Voltar ao catálogo
                        </a>
                    </p>
                </main>

                <BroteroFooter />
            </div>
        </>
    );
}
