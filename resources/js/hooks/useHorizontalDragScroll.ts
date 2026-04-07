import { useCallback, useRef, type MouseEvent as ReactMouseEvent } from 'react';

const DRAG_THRESHOLD_PX = 6;

/**
 * Scroll horizontal com arrasto do rato (document mousemove), sem interferir com clique quando não há arrasto.
 * Útil em carrosséis com cards/links no interior.
 */
export function useHorizontalDragScroll() {
    const scrollRef = useRef<HTMLDivElement | null>(null);
    const suppressClickRef = useRef(false);

    const onMouseDown = useCallback((e: ReactMouseEvent<HTMLDivElement>) => {
        if (e.button !== 0) {
            return;
        }

        const el = scrollRef.current;
        if (!el || !el.contains(e.target as Node)) {
            return;
        }

        const originX = e.clientX;
        let lastClientX = e.clientX;
        let dragging = false;

        const onMove = (ev: globalThis.MouseEvent) => {
            if (!dragging) {
                if (Math.abs(ev.clientX - originX) < DRAG_THRESHOLD_PX) {
                    return;
                }

                dragging = true;
            }

            const dx = ev.clientX - lastClientX;

            ev.preventDefault();
            el.scrollLeft -= dx;
            lastClientX = ev.clientX;
        };

        const onUp = () => {
            document.removeEventListener('mousemove', onMove);
            document.removeEventListener('mouseup', onUp);

            if (dragging) {
                suppressClickRef.current = true;
            }
        };

        document.addEventListener('mousemove', onMove, { passive: false });
        document.addEventListener('mouseup', onUp);
    }, []);

    const onClickCapture = useCallback((e: ReactMouseEvent<HTMLDivElement>) => {
        if (!suppressClickRef.current) {
            return;
        }

        if ((e.target as HTMLElement).closest('a[href], button')) {
            e.preventDefault();
            e.stopPropagation();
        }

        suppressClickRef.current = false;
    }, []);

    return { scrollRef, onMouseDown, onClickCapture };
}
