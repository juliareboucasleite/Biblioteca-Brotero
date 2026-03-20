import { OPCOES_LINGUA, OPCOES_TIPO_DOCUMENTO } from '@/constants/biblioteca-filtros';
import { LISTA_ESCOLAS } from '@/constants/escolas';

const inputSelectClass =
    'w-full p-[6px_10px] text-[13px] border border-(--brotero-borda) rounded-(--raio) bg-(--brotero-branco) text-(--brotero-texto) focus:outline-none focus:outline-2 focus:outline-(--brotero-primaria) focus:outline-offset-0';

const labelClass = 'block mb-[4px] text-[12px] font-semibold text-(--brotero-texto-cinza)';

type BibliotecaFiltrosAvancadosProps = {
    /** Destino GET ao submeter (normalmente `/biblioteca` ou `/biblioteca/livros`). */
    formAction: string;
    categoriaSelecionada?: string | null;
    q?: string | null;
    lingua?: string | null;
    /** Se true, a alteração da língua submete o formulário automaticamente. */
    autoSubmitLingua?: boolean;
};

export function BibliotecaFiltrosAvancados({
    formAction,
    categoriaSelecionada,
    q,
    lingua,
    autoSubmitLingua = false,
}: BibliotecaFiltrosAvancadosProps) {
    return (
        <section className="mb-[20px] bg-(--brotero-branco) border border-(--brotero-borda) rounded-(--raio) p-[16px_18px]">
            <h2 className="m-0 mb-[12px] text-[1.1rem] font-bold text-(--brotero-texto)">
                Filtros e pesquisa avançada
            </h2>
            <p className="m-0 mb-[8px] text-[12px] font-bold text-(--brotero-texto-cinza) uppercase tracking-[0.02em]">
                Filtrar por:
            </p>
            <form className="flex flex-wrap gap-y-[10px] gap-x-[16px]" action={formAction} method="get">
                {categoriaSelecionada && (
                    <input type="hidden" name="categoria" value={categoriaSelecionada} />
                )}
                {q ? <input type="hidden" name="q" value={q} /> : null}
                <div className="min-w-[150px] flex-1 max-w-[200px]">
                    <label htmlFor="filtro-lingua" className={labelClass}>
                        Língua
                    </label>
                    <select
                        id="filtro-lingua"
                        name="lingua"
                        defaultValue={lingua ?? ''}
                        onChange={autoSubmitLingua ? (e) => e.currentTarget.form?.submit() : undefined}
                        className={inputSelectClass}
                    >
                        {OPCOES_LINGUA.map((o) => (
                            <option key={o.value || 'all'} value={o.value}>
                                {o.label}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="min-w-[150px] flex-1 max-w-[200px]">
                    <label htmlFor="filtro-tipo" className={labelClass}>
                        Tipo de documento
                    </label>
                    <select id="filtro-tipo" name="tipo-documento" className={inputSelectClass}>
                        {OPCOES_TIPO_DOCUMENTO.map((label) => (
                            <option key={label}>{label}</option>
                        ))}
                    </select>
                </div>
                <div className="min-w-[150px] flex-1 max-w-[200px]">
                    <label htmlFor="filtro-escola" className={labelClass}>
                        Base das escolas
                    </label>
                    <select id="filtro-escola" name="escola" className={inputSelectClass}>
                        <option>Todas as escolas</option>
                        {LISTA_ESCOLAS.map((escola) => (
                            <option key={escola}>{escola}</option>
                        ))}
                    </select>
                </div>
            </form>
        </section>
    );
}
