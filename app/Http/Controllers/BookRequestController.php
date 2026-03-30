<?php

namespace App\Http\Controllers;

use App\Models\Book;
use App\Models\BookRequest;
use App\Notifications\BookRequestPendingStaffNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Notification;

class BookRequestController extends Controller
{
    public function store(Request $request): JsonResponse
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

        $schoolLocation = $requestType === 'escola' ? (string) ($payload['school_location'] ?? '') : null;
        if ($requestType === 'escola' && trim($schoolLocation) === '') {
            return response()->json([
                'ok' => false,
                'error' => 'Escolha a biblioteca/escola para retirada.',
            ], 422);
        }

        $bookRequest = BookRequest::create([
            'book_id' => $book->id,
            'request_type' => $requestType,
            'book_title' => (string) ($book->title ?? ''),
            'isbn' => $book->isbn,
            'card_number' => (string) $payload['card_number'],
            'school_location' => $schoolLocation,
            'cacifo_code' => null,
            'pickup_deadline' => null,
            'return_deadline' => null,
            'status' => 'pending',
            'fine_amount' => 0,
            'returned_at' => null,
            'fine_applied_at' => null,
        ]);

        foreach (config('biblioteca.librarian_notify_emails', []) as $email) {
            if ($email === '') {
                continue;
            }
            Notification::route('mail', $email)->notify(new BookRequestPendingStaffNotification($bookRequest));
        }

        $message = 'O seu pedido foi registado e está pendente de aprovação pela biblioteca. Consulte «Os meus pedidos» após entrar com o cartão; após aprovação, verá aqui o prazo e, se aplicável, o código do cacifo.';

        return response()->json([
            'ok' => true,
            'request_id' => $bookRequest->id,
            'request_type' => $requestType,
            'cacifo_code' => null,
            'pickup_deadline' => null,
            'return_deadline' => null,
            'status' => 'pending',
            'message' => $message,
        ]);
    }
}
