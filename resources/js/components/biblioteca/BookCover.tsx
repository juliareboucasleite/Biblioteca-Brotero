import { Search, X } from 'lucide-react';
import { useState } from 'react';
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

type BookCoverProps = {
    coverSrc: string | null;
    titulo: string;
    placeholder: boolean;
};

export function BookCover({ coverSrc, titulo, placeholder }: BookCoverProps) {
    const [capaAmpliadaAberta, setCapaAmpliadaAberta] = useState(false);

    const altCapa = `Capa do livro ${placeholder ? 'Livro' : titulo}`;
    const altCapaAmpliada = `Capa ampliada — ${placeholder ? 'Livro' : titulo}`;

    return (
        <>
            <div className="sticky top-[24px]">
                <div
                    className="relative aspect-2/3 bg-linear-to-br from-[#e8e8e8] to-[#d0d0d0] rounded-[6px] w-full"
                    id="pagina-livro-capa"
                >
                    {coverSrc ? (
                        <>
                            <img
                                className="absolute inset-0 w-full h-full object-cover rounded-[6px]"
                                src={coverSrc}
                                alt={altCapa}
                                loading="lazy"
                                referrerPolicy="no-referrer"
                            />
                            <button
                                type="button"
                                className="absolute bottom-[10px] right-[10px] flex size-10 items-center justify-center rounded-full border border-(--brotero-borda) bg-(--brotero-branco)/95 text-(--brotero-texto) shadow-md hover:bg-(--brotero-branco) transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--brotero-primaria) focus-visible:ring-offset-2"
                                onClick={() => setCapaAmpliadaAberta(true)}
                                aria-label="Ver capa em tamanho maior"
                            >
                                <Search className="size-[18px]" strokeWidth={2.25} aria-hidden />
                            </button>
                        </>
                    ) : null}
                </div>
            </div>

            {coverSrc ? (
                <Dialog open={capaAmpliadaAberta} onOpenChange={setCapaAmpliadaAberta}>
                    <DialogContent
                        hideCloseButton
                        className="border-(--brotero-borda) bg-(--brotero-branco) p-3 sm:max-w-[min(92vw,56rem)] gap-0"
                    >
                        <div className="relative min-w-0">
                            <DialogClose
                                type="button"
                                className="absolute top-0 right-0 z-10 rounded-sm p-1 text-(--brotero-texto) opacity-75 transition-opacity hover:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-(--brotero-primaria) focus-visible:ring-offset-2 bg-transparent border-0 shadow-none"
                                aria-label="Fechar"
                            >
                                <X className="size-6" strokeWidth={2.25} aria-hidden />
                            </DialogClose>
                            <DialogHeader className="sr-only">
                                <DialogTitle className="text-(--brotero-texto)">{altCapaAmpliada}</DialogTitle>
                            </DialogHeader>
                            <img
                                src={coverSrc}
                                alt={altCapaAmpliada}
                                className="max-h-[min(85vh,900px)] w-full object-contain rounded-[6px]"
                                referrerPolicy="no-referrer"
                            />
                        </div>
                    </DialogContent>
                </Dialog>
            ) : null}
        </>
    );
}
