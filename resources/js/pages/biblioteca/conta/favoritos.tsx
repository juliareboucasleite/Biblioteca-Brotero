import { Link } from '@inertiajs/react';
import { BibliotecaContaLayout } from '@/components/biblioteca/BibliotecaContaLayout';
import { CardLivro } from '@/components/CardLivro';
import type { LivroCatalogo } from '@/types';

type Props = {
    livros: LivroCatalogo[];
};

export default function BibliotecaContaFavoritos({ livros }: Props) {
    return (
        <BibliotecaContaLayout title="Os meus favoritos" secao="favoritos">
            <h2 className="m-0 mb-[16px] text-[1.15rem] font-bold text-(--brotero-texto)">Livros favoritos</h2>
            {livros.length === 0 ? (
                <p className="m-0 p-[16px] bg-(--brotero-branco) border border-dashed border-(--brotero-borda) rounded-(--raio) text-(--brotero-texto-cinza)">
                    Crie a sua lista de leituras: no{' '}
                    <Link href="/biblioteca" className="text-(--brotero-texto-link) hover:underline">
                        catálogo
                    </Link>
                    , use o ícone de coração nos cartões para guardar favoritos aqui.
                </p>
            ) : (
                <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-[16px] max-[768px]:grid-cols-[repeat(auto-fill,minmax(130px,1fr))] max-[768px]:gap-[12px]">
                    {livros.map((livro) => (
                        <CardLivro key={livro.id} livro={livro} />
                    ))}
                </div>
            )}
        </BibliotecaContaLayout>
    );
}
