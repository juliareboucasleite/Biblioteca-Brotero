import { Link } from '@inertiajs/react';
import { BibliotecaContaLayout } from '@/components/biblioteca/BibliotecaContaLayout';

type Props = {
    perfil: {
        name: string | null;
        card_number: string;
        data_nascimento: string;
        pontos: number;
    };
};

export default function BibliotecaContaPerfil({ perfil }: Props) {
    return (
        <BibliotecaContaLayout title="O meu perfil" secao="perfil">
            <h2 className="m-0 mb-[16px] text-[1.15rem] font-bold text-(--brotero-texto)">Perfil do leitor</h2>
            <div className="p-[20px] bg-(--brotero-branco) border border-(--brotero-borda) rounded-(--raio) max-w-[580px]">
                <dl className="m-0 grid gap-[12px]">
                    <div>
                        <dt className="text-[12px] font-bold text-(--brotero-texto-cinza) uppercase tracking-wide">
                            Nome
                        </dt>
                        <dd className="m-0 text-[15px] text-(--brotero-texto)">
                            {perfil.name?.trim() ? perfil.name : '-'}
                        </dd>
                    </div>
                    <div>
                        <dt className="text-[12px] font-bold text-(--brotero-texto-cinza) uppercase tracking-wide">
                            Cartão
                        </dt>
                        <dd className="m-0 text-[15px] text-(--brotero-texto) font-mono">{perfil.card_number}</dd>
                    </div>
                    <div>
                        <dt className="text-[12px] font-bold text-(--brotero-texto-cinza) uppercase tracking-wide">
                            Data de nascimento
                        </dt>
                        <dd className="m-0 text-[15px] text-(--brotero-texto)">{perfil.data_nascimento}</dd>
                    </div>
                    <div>
                        <dt className="text-[12px] font-bold text-(--brotero-texto-cinza) uppercase tracking-wide">
                            Pontos
                        </dt>
                        <dd className="m-0 text-[15px] text-(--brotero-texto) font-semibold">{perfil.pontos}</dd>
                    </div>
                </dl>
                <p className="mt-[16px] mb-0 text-[13px] text-(--brotero-texto-cinza)">
                    Os pontos refletem a sua participação no{' '}
                    <Link href="/ranking" className="text-(--brotero-texto-link) hover:underline">
                        ranking da biblioteca
                    </Link>
                    .
                </p>
                <p className="mt-[12px] mb-0 text-[13px] text-(--brotero-texto-cinza)">
                    Para atualizar estes dados ou repor a palavra-passe de acesso, contacte a Biblioteca Brotero.
                </p>
            </div>
        </BibliotecaContaLayout>
    );
}
