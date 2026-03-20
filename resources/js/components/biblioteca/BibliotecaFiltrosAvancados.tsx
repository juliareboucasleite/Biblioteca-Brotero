import { OPCOES_LINGUA, OPCOES_TIPO_DOCUMENTO } from '@/constants/biblioteca-filtros';
import { LISTA_ESCOLAS } from '@/constants/escolas';

const inputSelectClass =
    'w-full p-[6px_10px] text-[13px] border border-(--brotero-borda) rounded-(--raio) bg-(--brotero-branco) text-(--brotero-texto) focus:outline-none focus:outline-2 focus:outline-(--brotero-primaria) focus:outline-offset-0';

const labelClass = 'block mb-[4px] text-[12px] font-semibold text-(--brotero-texto-cinza)';

export type AutorFiltroOption = { id: string; name: string };

type BibliotecaFiltrosAvancadosProps = {
    /** Destino GET ao submeter (normalmente `/biblioteca` ou `/biblioteca/livros`). */
    formAction: string;
    categoriaSelecionada?: string | null;
    q?: string | null;
    lingua?: string | null;
    autores?: AutorFiltroOption[];
    authorSelecionado?: string | null;
    ano?: string | null;
    /** Se true, a alteração da língua submete o formulário automaticamente. */
    autoSubmitLingua?: boolean;
};

export function BibliotecaFiltrosAvancados({
    formAction,
    categoriaSelecionada,
    q,
    lingua,
    autores = [],
    authorSelecionado,
    ano,
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
            <form className="flex flex-wrap gap-y-[10px] gap-x-[16px] items-end" action={formAction} method="get">
                {categoriaSelecionada && (
                    <input type="hidden" name="categoria" value={categoriaSelecionada} />
                )}
                {q ? <input type="hidden" name="q" value={q} /> : null}
                <div className="min-w-[150px] flex-1 max-w-[220px]">
                    <label htmlFor="filtro-autor" className={labelClass}>
                        Autor
                    </label>
                    <select
                        id="filtro-autor"
                        name="author_id"
                        defaultValue={authorSelecionado ?? ''}
                        className={inputSelectClass}
                    >
                        <option value="">Todos os autores</option>
                        {autores.map((a) => (
                            <option key={a.id} value={a.id}>
                                {a.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="w-[100px] shrink-0">
                    <label htmlFor="filtro-ano" className={labelClass}>
                        Ano
                    </label>
                    <input
                        id="filtro-ano"
                        name="ano"
                        type="number"
                        min={1000}
                        max={3000}
                        placeholder="ex. 2020"
                        defaultValue={ano ?? ''}
                        className={inputSelectClass}
                    />
                </div>
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
                <div className="w-full min-[500px]:w-auto shrink-0">
                    <button
                        type="submit"
                        className="w-full min-[500px]:w-auto px-[16px] py-[8px] rounded-(--raio) bg-(--brotero-primaria) text-white text-[14px] font-semibold border-0 cursor-pointer hover:opacity-95"
                    >
                        Aplicar filtros
                    </button>
                </div>
            </form>
        </section>
    );
}
