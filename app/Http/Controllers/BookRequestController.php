<?php

namespace App\Http\Controllers;

use App\Models\Book;
use App\Models\BookRequest;
use App\Models\LibraryPatron;
use App\Services\PatronGamificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BookRequestController extends Controller
{
    public function store(Request $request, PatronGamificationService $gamification): JsonResponse
    {
        $payload = $request->validate([
            'book_id' => ['required', 'integer', 'exists:books,id'],
            'request_type' => ['required', 'in:escola,cacifo'],
            'card_number' => ['required', 'regex:/^[0-9]{5}$/'],
            'school_location' => ['nullable', 'string', 'max:255'],
        ]);

        $book = Book::query()->findOrFail($payload['book_id']);

        if (! $book->isAvailableForRequest()) {
            return response()->json([
                'ok' => false,
                'error' => 'Este livro já se encontra requisitado. Tente mais tarde ou active as notificações de favoritos.',
            ], 422);
        }

        $requestType = $payload['request_type'];
        $now = now();
        $pickupDeadline = $now->copy()->addDays(3);
        $returnDeadline = $now->copy()->addMonth();

        $schoolLocation = $requestType === 'escola' ? (string) ($payload['school_location'] ?? '') : null;
        if ($requestType === 'escola' && trim($schoolLocation) === '') {
            return response()->json([
                'ok' => false,
                'error' => 'Escolha a biblioteca/escola para retirada.',
            ], 422);
        }

        $cacifoCode = null;
        if ($requestType === 'cacifo') {
            $cacifoCode = $this->generateUniqueCacifoCode();
        }

        $bookRequest = BookRequest::create([
            'book_id' => $book->id,
            'request_type' => $requestType,
            'book_title' => (string) ($book->title ?? ''),
            'isbn' => $book->isbn,
            'card_number' => (string) $payload['card_number'],
            'school_location' => $schoolLocation,
            'cacifo_code' => $cacifoCode,
            'pickup_deadline' => $pickupDeadline,
            'return_deadline' => $returnDeadline,
            'status' => 'created',
            'fine_amount' => 0,
            'returned_at' => null,
            'fine_applied_at' => null,
        ]);

        $patron = LibraryPatron::query()
            ->where('card_number', (string) $payload['card_number'])
            ->first();
        $gamification->onBookRequested($patron);

        $multaInfo = 'Multa por atraso: 0,50 € por dia completo após a data de devolução.';

        $message = $requestType === 'escola'
            ? "Requisitar na biblioteca escolhida em até 3 dias. Prazo: {$pickupDeadline->format('d/m/Y')}. Leitura: 1 mês (devolução até {$returnDeadline->format('d/m/Y')}). {$multaInfo}"
            : "Código do cacifo: {$cacifoCode}. Levantamento em até 3 dias. Se não for levantado, o cacifo é recolhido e terá que solicitar novamente. Leitura: 1 mês (devolução até {$returnDeadline->format('d/m/Y')}). {$multaInfo}";

        return response()->json([
            'ok' => true,
            'request_id' => $bookRequest->id,
            'request_type' => $requestType,
            'cacifo_code' => $cacifoCode,
            'pickup_deadline' => $pickupDeadline->toDateTimeString(),
            'return_deadline' => $returnDeadline->toDateTimeString(),
            'message' => $message,
        ]);
    }

    private function generateUniqueCacifoCode(): string
    {
        do {
            $code = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        } while (BookRequest::query()->where('cacifo_code', $code)->exists());

        return $code;
    }
}
