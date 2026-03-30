<?php

namespace App\Services;

use App\Models\BookRequest;
use App\Models\LibraryPatron;

final class BookRequestApprovalService
{
    public function __construct(
        private readonly PatronGamificationService $gamification,
    ) {}

    /**
     * Ativa o pedido: prazos, cacifo (se aplicável) e pontos só após aprovação.
     */
    public function approve(BookRequest $request): void
    {
        if ($request->status !== 'pending') {
            throw new \InvalidArgumentException('Só pedidos pendentes podem ser aprovados.');
        }

        $now = now();
        $pickupDeadline = $now->copy()->addDays(3);
        $returnDeadline = $now->copy()->addMonth();

        $cacifoCode = $request->cacifo_code;
        if ($request->request_type === 'cacifo') {
            $cacifoCode = $cacifoCode ?? $this->generateUniqueCacifoCode();
        }

        $request->forceFill([
            'status' => 'created',
            'pickup_deadline' => $pickupDeadline,
            'return_deadline' => $returnDeadline,
            'cacifo_code' => $cacifoCode,
            'staff_reviewed_at' => $now,
            'staff_rejection_reason' => null,
        ])->save();

        $patron = LibraryPatron::query()
            ->where('card_number', $request->card_number)
            ->first();
        $this->gamification->onBookRequested($patron);
    }

    public function reject(BookRequest $request, ?string $reason): void
    {
        if ($request->status !== 'pending') {
            throw new \InvalidArgumentException('Só pedidos pendentes podem ser recusados.');
        }

        $request->forceFill([
            'status' => 'rejected',
            'staff_reviewed_at' => now(),
            'staff_rejection_reason' => $reason !== null && trim($reason) !== '' ? trim($reason) : null,
            'pickup_deadline' => null,
            'return_deadline' => null,
        ])->save();
    }

    private function generateUniqueCacifoCode(): string
    {
        do {
            $code = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        } while (BookRequest::query()->where('cacifo_code', $code)->exists());

        return $code;
    }
}
