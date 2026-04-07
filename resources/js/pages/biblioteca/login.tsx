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
                <div className="mx-auto w-full max-w-[440px] pt-[4px] lg:pt-0">
                    <header className="mb-[20px]">
                        <h1 className="m-0 mb-[8px] text-[1.5rem] font-bold leading-tight text-(--brotero-texto)">
                            Entrar na sua conta
                        </h1>
                        <p className="m-0 text-[15px] leading-snug text-(--brotero-texto-cinza)">
                            Introduza o número do cartão da biblioteca e a senha. Formato corrido, só algarismos:{' '}
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
