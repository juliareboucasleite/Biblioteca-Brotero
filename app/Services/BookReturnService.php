<?php

namespace App\Services;

use App\Models\Book;
use App\Models\BookRequest;
use App\Models\LibraryPatron;
use App\Notifications\BookAvailableNotification;
use Illuminate\Support\Facades\DB;

final class BookReturnService
{
    public function __construct(
        private readonly BookFineCalculator $fineCalculator,
        private readonly PatronGamificationService $gamification,
    ) {}

    /**
     * Marca requisição como devolvida, atualiza multa final, pontos e notifica favoritos.
     */
    public function markReturned(BookRequest $request, ?LibraryPatron $actingPatron = null): void
    {
        DB::transaction(function () use ($request, $actingPatron): void {
            if ($request->returned_at !== null) {
                return;
            }

            $this->fineCalculator->persistFine($request);
            $request->refresh();

            $returnDeadline = $request->return_deadline;
            $onTime = $returnDeadline === null || now()->lte($returnDeadline);

            $request->forceFill([
                'status' => 'returned',
                'returned_at' => now(),
            ])->save();

            $patron = $actingPatron;
            if ($patron === null) {
                $patron = LibraryPatron::query()->where('card_number', $request->card_number)->first();
            }

            if ($onTime) {
                $this->gamification->onBookReturnedOnTime($patron);
            }

            if ($request->book_id) {
                $this->notifyFavoritesBookAvailable((int) $request->book_id, $request);
            }
        });
    }

    private function notifyFavoritesBookAvailable(int $bookId, BookRequest $returnedRequest): void
    {
        $book = Book::query()->find($bookId);

        if ($book === null) {
            return;
        }

        $favoritors = LibraryPatron::query()
            ->whereHas('favoriteBooks', static fn ($q) => $q->whereKey($bookId))
            ->where('card_number', '!=', $returnedRequest->card_number)
            ->get();

        foreach ($favoritors as $patron) {
            $patron->notify(new BookAvailableNotification($book, $returnedRequest));
        }
    }
}
