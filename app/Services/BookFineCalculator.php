<?php

namespace App\Services;

use App\Models\BookRequest;
use Carbon\CarbonInterface;

/**
 * Multa por atraso na devolução: 0,50 € por dia completo após return_deadline.
 */
final class BookFineCalculator
{
    public const EUR_PER_DAY = 0.5;

    /**
     * Calcula multa atual (0 se ainda dentro do prazo ou já devolvido).
     */
    public function calculateForRequest(BookRequest $request): float
    {
        if ($request->returned_at !== null) {
            return (float) $request->fine_amount;
        }

        if (! $request->return_deadline instanceof CarbonInterface) {
            return 0.0;
        }

        $deadline = $request->return_deadline->copy()->startOfDay();
        $today = now()->startOfDay();

        if ($today->lte($deadline)) {
            return 0.0;
        }

        $daysLate = (int) $deadline->diffInDays($today);

        return round($daysLate * self::EUR_PER_DAY, 2);
    }

    /**
     * Atualiza fine_amount no registo (e opcionalmente fine_applied_at na primeira vez com multa).
     */
    public function persistFine(BookRequest $request): void
    {
        $fine = $this->calculateForRequest($request);

        if ($fine <= 0) {
            return;
        }

        $request->forceFill([
            'fine_amount' => $fine,
            'fine_applied_at' => $request->fine_applied_at ?? now(),
        ])->save();
    }
}
