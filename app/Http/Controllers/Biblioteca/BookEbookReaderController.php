<?php

namespace App\Http\Controllers\Biblioteca;

use App\Http\Controllers\Controller;
use App\Models\Book;
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

        return $disk->response((string) $book->ebook_path, $filename, [
            'Content-Type' => $mime,
            'Content-Disposition' => 'inline; filename="'.$filename.'"',
        ]);
    }
}
