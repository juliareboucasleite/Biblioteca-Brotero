import { Form, Head } from '@inertiajs/react';
import { BibliotecaCatalogShell } from '@/components/biblioteca/BibliotecaCatalogShell';
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
            <Head title="Entrar · Leitor" />

            <BibliotecaCatalogShell>
                <div className="mx-auto flex min-h-[calc(100vh-160px)] w-full max-w-[460px] flex-col justify-center py-[18px]">
                    <header className="mb-[20px]">
                        <h1 className="m-0 mb-[8px] text-[1.5rem] font-bold leading-tight text-(--brotero-texto)">
                            Entrar na sua conta
                        </h1>
                        <p className="m-0 text-[15px] leading-snug text-(--brotero-texto-cinza)">
                            Introduza o número do cartão da biblioteca e a palavra-passe. Formato corrido, só algarismos:{' '}
                            <strong>DDMMAA</strong> (6) ou <strong>DDMMAAAA</strong> (8), sem barras nem hífens.
                        </p>
                    </header>

                    <div className="rounded-[18px] border border-(--brotero-borda-suave) bg-(--brotero-branco) p-[20px_22px] shadow-[0_8px_28px_rgba(42,38,48,0.06)] sm:p-[24px_26px]">
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
                                    <Label htmlFor="password">Palavra-passe:</Label>
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
                                    className={`inline-flex h-[44px] w-full items-center justify-center rounded-[12px] border border-(--brotero-primaria) bg-(--brotero-primaria) px-[16px] text-[15px] font-semibold text-white shadow-[0_10px_24px_rgba(71,94,114,0.28)] transition duration-150 hover:brightness-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--brotero-primaria)/35 disabled:cursor-not-allowed disabled:opacity-65${processing ? ' btn-loading' : ''}`}
                                >
                                    {processing ? 'A entrar…' : 'Entrar'}
                                </button>
                            </>
                        )}
                    </Form>

                    {status ? (
                        <p className="mt-[16px] rounded-(--raio) border border-green-200 bg-green-50 p-[12px] text-[14px] text-green-800">
                            {status}
                        </p>
                    ) : null}
                    </div>

                    <p className="mt-[22px] text-[14px] text-(--brotero-texto-cinza)">
                        <a
                            href="/biblioteca"
                            className="font-semibold text-(--brotero-texto-link) no-underline hover:underline"
                        >
                            ← Voltar ao catálogo
                        </a>
                    </p>
                </div>
            </BibliotecaCatalogShell>
        </>
    );
}
