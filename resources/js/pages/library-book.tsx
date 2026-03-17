import { Head } from '@inertiajs/react';
import { BroteroFooter } from '@/components/BroteroFooter';
import { BroteroHeader } from '@/components/BroteroHeader';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

type LivroDetalhe = {
    id: string;
    titulo: string;
    autor: string;
    desc: string;
};

type LibraryBookProps = {
    livro: LivroDetalhe;
};

const breadcrumbs = (livro: LivroDetalhe): BreadcrumbItem[] => [
    {
        title: 'Biblioteca',
        href: '/biblioteca',
    },
    {
        title: livro.titulo || 'Livro',
        href: '/biblioteca/livro',
    },
];

export default function LibraryBook({ livro }: LibraryBookProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs(livro)}>
            <Head title={livro.titulo || 'Livro'} />

            <div className="brotero-scope">
                <BroteroHeader />

                <main className="pagina-livro-main">
                <div className="container">
                    <p className="pagina-livro-voltar">
                        <a href="/biblioteca" className="link-voltar">
                            ← Voltar ao catálogo
                        </a>
                    </p>
                    <div className="pagina-livro-layout">
                        <div className="pagina-livro-capa-wrap">
                            <div className="pagina-livro-capa" id="pagina-livro-capa" />
                        </div>
                        <div className="pagina-livro-desc">
                            <h1 className="pagina-livro-title" id="pagina-livro-title">
                                {livro.titulo}
                            </h1>
                            <p className="pagina-livro-author" id="pagina-livro-author">
                                {livro.autor}
                            </p>
                            <div className="pagina-livro-sinopse">
                                <p className="pagina-livro-desc-text" id="pagina-livro-desc">
                                    {livro.desc}
                                </p>
                            </div>
                        </div>
                        <aside className="pagina-livro-opcoes">
                            <h2 className="pagina-livro-opcoes-titulo">Como deseja retirar?</h2>
                            <form className="pagina-livro-form" action="#" method="get">
                                <div className="pagina-livro-retirada">
                                    <label className="pagina-livro-radio">
                                        <input type="radio" name="retirada" value="escola" defaultChecked />
                                        <span>Retirada na escola desejada</span>
                                    </label>
                                    <label className="pagina-livro-radio">
                                        <input type="radio" name="retirada" value="cacifo" />
                                        <span>Retirar em cacifo</span>
                                    </label>
                                </div>
                                <div className="pagina-livro-escola">
                                    <label htmlFor="pagina-livro-escola">
                                        Escola (obrigatório para retirada na escola ou em cacifo)
                                    </label>
                                    <select
                                        id="pagina-livro-escola"
                                        name="escola"
                                        className="pagina-livro-select"
                                        required
                                    >
                                        <option>Escola Secundária Avelar Brotero</option>
                                        <option>Outra escola...</option>
                                    </select>
                                </div>
                                <button type="submit" className="pagina-livro-submit">
                                    Requisitar livro
                                </button>
                            </form>
                        </aside>
                    </div>
                </div>
                </main>

                <BroteroFooter />
            </div>
        </AppLayout>
    );
}

