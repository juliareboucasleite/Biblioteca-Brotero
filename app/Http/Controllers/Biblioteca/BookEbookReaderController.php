<?php

namespace App\Http\Controllers\Biblioteca;

use App\Http\Controllers\Controller;
use App\Models\Book;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\Response as SymfonyResponse;

class BookEbookReaderController extends Controller
{
    public function show(Book $book): Response|RedirectResponse
    {
        if (! $book->hasEbook() || $book->ebookFormat() === null) {
            return redirect()->route('biblioteca.livro.show', $book);
        }

        return Inertia::render('biblioteca/livro-ler', [
            'livro' => [
                'id' => (string) $book->id,
                'titulo' => (string) ($book->title ?? ''),
            ],
            'ebook_format' => $book->ebookFormat(),
            'ebook_url' => route('biblioteca.livro.ebook', $book),
        ]);
    }

    /**
     * Regista uma transferência (baixar ficheiro).
     * Com `Accept: application/json` devolve o novo total; caso contrário redireciona para o ficheiro (formulário HTML).
     */
    public function registarDownload(Request $request, Book $book): JsonResponse|RedirectResponse
    {
        if (! $request->user('patron')) {
            abort(403);
        }

        if (! $book->hasEbook() || $book->ebookFormat() === null) {
            abort(404);
        }

        $book->increment('ebook_downloads_count');
        $book->refresh();

        if ($request->expectsJson() || $request->wantsJson()) {
            return response()->json([
                'ok' => true,
                'ebook_downloads_count' => (int) ($book->ebook_downloads_count ?? 0),
            ]);
        }

        return redirect()->to(
            route('biblioteca.livro.ebook', $book).'?download=1',
        );
    }

    public function stream(Request $request, Book $book): SymfonyResponse
    {
        if (! $request->user('patron')) {
            abort(403);
        }

        if (! $book->hasEbook()) {
            abort(404);
        }

        $diskName = $book->ebook_disk ?: 'local';
        $disk = Storage::disk($diskName);

        if (! $disk->exists((string) $book->ebook_path)) {
            abort(404);
        }

        $ext = $book->ebookFormat() === 'epub' ? 'epub' : 'pdf';
        $filename = Str::slug((string) ($book->title ?? 'livro'), '-').'.'.$ext;
        $mime = (string) ($book->ebook_mime ?: 'application/octet-stream');
        $download = $request->boolean('download');
        $disposition = $download ? 'attachment' : 'inline';

        return $disk->response((string) $book->ebook_path, $filename, [
            'Content-Type' => $mime,
            'Content-Disposition' => $disposition.'; filename="'.$filename.'"',
        ]);
    }
}
