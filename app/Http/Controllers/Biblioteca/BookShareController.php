<?php

namespace App\Http\Controllers\Biblioteca;

use App\Http\Controllers\Controller;
use App\Models\BookShare;
use App\Models\LibraryPatron;
use App\Support\PatronLabel;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BookShareController extends Controller
{
    public function index(Request $request): Response
    {
        $paginator = BookShare::query()
            ->with(['book.authors', 'libraryPatron'])
            ->latest()
            ->paginate(15);

        $paginator->through(fn (BookShare $share): array => $this->sharePayload($share));

        return Inertia::render('biblioteca/descobertas', [
            'descobertas' => $paginator,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        /** @var LibraryPatron $patron */
        $patron = $request->user('patron');

        $data = $request->validate([
            'book_id' => ['required', 'integer', 'exists:books,id'],
            'message' => ['nullable', 'string', 'max:500'],
        ]);

        $message = isset($data['message']) ? trim($data['message']) : '';
        $message = $message === '' ? null : $message;

        BookShare::query()->updateOrCreate(
            [
                'library_patron_id' => $patron->id,
                'book_id' => (int) $data['book_id'],
            ],
            ['message' => $message],
        );

        return redirect()
            ->back()
            ->with('success', 'A sua recomendação foi guardada na comunidade.');
    }

    public function destroy(Request $request, BookShare $book_share): RedirectResponse
    {
        /** @var LibraryPatron $patron */
        $patron = $request->user('patron');

        if ($book_share->library_patron_id !== $patron->id) {
            abort(403);
        }

        $book_share->delete();

        return redirect()
            ->back()
            ->with('success', 'Recomendação removida.');
    }

    /**
     * @return array{id: string, patron_id: int, message: string|null, created_at: string, patron_label: string, livro: array<string, mixed>}
     */
    private function sharePayload(BookShare $share): array
    {
        $book = $share->book;
        $book->loadMissing(['authors']);

        return [
            'id' => (string) $share->id,
            'patron_id' => (int) $share->library_patron_id,
            'message' => $share->message,
            'created_at' => $share->created_at?->toIso8601String() ?? '',
            'patron_label' => PatronLabel::format($share->libraryPatron),
            'livro' => [
                'id' => (string) $book->id,
                'titulo' => (string) ($book->title ?? ''),
                'autor' => $book->authors?->pluck('name')->filter()->implode(', ') ?: 'Autor desconhecido',
                'desc' => (string) ($book->description ?? ''),
                'capa' => $book->cover_image ? (string) $book->cover_image : null,
                'tem_ebook' => $book->hasEbook() && $book->ebookFormat() !== null,
            ],
        ];
    }
}
