import { useForm, usePage } from '@inertiajs/react';
import { BibliotecaContaLayout } from '@/components/biblioteca/BibliotecaContaLayout';

export default function BibliotecaContaLivroImport() {
    const { flash } = usePage().props as { flash?: { success?: string; error?: string } };
    const form = useForm({
        isbns_text: '',
        csv_file: null as File | null,
    });

    return (
        <BibliotecaContaLayout title="Importação de livros" secao="livro-novo">
            <h2 className="m-0 mb-[8px] text-[1.15rem] font-bold text-(--brotero-texto)">Importação em lote</h2>
            <p className="m-0 mb-[12px] text-[13px] text-(--brotero-texto-cinza)">
                Cole ISBNs (um por linha) ou envie CSV simples para acelerar cadastro via API.
            </p>
            <p className="m-0 mb-[12px] rounded-(--raio) border border-(--brotero-borda) bg-(--brotero-fundo) px-[10px] py-[8px] text-[12px] text-(--brotero-texto-cinza)">
                Exemplo de CSV: coluna única com ISBN (sem cabeçalho obrigatório). Apenas anos do secundário (10, 11, 12)
                devem ser usados no catálogo escolar.
            </p>
            {flash?.success ? (
                <p className="mb-[10px] rounded-(--raio) border border-emerald-200 bg-emerald-50 px-[10px] py-[8px] text-[13px] text-emerald-900">
                    {flash.success}
                </p>
            ) : null}
            {flash?.error ? (
                <p className="mb-[10px] rounded-(--raio) border border-red-200 bg-red-50 px-[10px] py-[8px] text-[13px] text-red-900">
                    {flash.error}
                </p>
            ) : null}
            <form
                className="grid max-w-[680px] gap-[10px]"
                onSubmit={(e) => {
                    e.preventDefault();
                    form.post('/biblioteca/conta/balcao/livros/importar', { forceFormData: true, preserveScroll: true });
                }}
            >
                <textarea
                    value={form.data.isbns_text}
                    onChange={(e) => form.setData('isbns_text', e.target.value)}
                    className="min-h-[200px] rounded-(--raio) border border-(--brotero-borda) bg-(--brotero-branco) px-[10px] py-[9px] text-[14px]"
                    placeholder={'9789720000001\n9789720000002'}
                />
                <input
                    type="file"
                    accept=".csv,.txt,text/csv,text/plain"
                    onChange={(e) => form.setData('csv_file', e.target.files?.[0] ?? null)}
                    className="rounded-(--raio) border border-(--brotero-borda) bg-(--brotero-branco) px-[10px] py-[8px] text-[13px]"
                />
                <div>
                    <button
                        type="submit"
                        disabled={form.processing}
                        className="cursor-pointer rounded-(--raio) border-0 bg-(--brotero-primaria) px-[12px] py-[8px] text-[13px] font-semibold text-white"
                    >
                        {form.processing ? 'A importar...' : 'Importar livros'}
                    </button>
                </div>
                {form.errors.isbns_text ? (
                    <p className="m-0 text-[12px] text-red-800">{form.errors.isbns_text}</p>
                ) : null}
                {form.errors.csv_file ? (
                    <p className="m-0 text-[12px] text-red-800">{form.errors.csv_file}</p>
                ) : null}
            </form>
        </BibliotecaContaLayout>
    );
}
