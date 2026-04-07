import { Link } from '@inertiajs/react';
import { BibliotecaContaLayout } from '@/components/biblioteca/BibliotecaContaLayout';

type Props = {
    leitor: {
        id: string;
        label: string;
        cartao_mascarado: string;
        pontos: number;
    };
};

export default function BibliotecaContaLeitorPerfil({ leitor }: Props) {
    return (
        <BibliotecaContaLayout title={`Perfil · ${leitor.label}`} secao="mensagens">
            <div className="mb-[16px]">
                <Link
                    href="/biblioteca/conta/mensagens"
                    className="text-[14px] font-semibold text-(--brotero-texto-link) no-underline hover:underline"
                    preserveScroll
                >
                    ← Conversas
                </Link>
            </div>

            <div className="max-w-[480px] rounded-[18px] border border-(--brotero-borda-suave) bg-(--brotero-branco) p-[22px] shadow-[0_8px_28px_rgba(42,38,48,0.06)]">
                <h1 className="m-0 mb-[6px] text-[1.35rem] font-bold text-(--brotero-texto)">{leitor.label}</h1>
                <p className="m-0 mb-[16px] text-[14px] text-(--brotero-texto-cinza)">
                    Só vê este perfil porque têm uma conversa privada aceite na plataforma. Os dados são
                    limitados para proteger a privacidade.
                </p>
                <dl className="m-0 grid gap-[12px] text-[15px]">
                    <div>
                        <dt className="m-0 text-[12px] font-semibold uppercase tracking-wide text-(--brotero-texto-cinza)">
                            Cartão
                        </dt>
                        <dd className="m-0 font-mono text-(--brotero-texto)">{leitor.cartao_mascarado}</dd>
                    </div>
                    <div>
                        <dt className="m-0 text-[12px] font-semibold uppercase tracking-wide text-(--brotero-texto-cinza)">
                            Pontos (ranking)
                        </dt>
                        <dd className="m-0 text-(--brotero-texto)">{leitor.pontos} pts</dd>
                    </div>
                </dl>
            </div>
        </BibliotecaContaLayout>
    );
}
