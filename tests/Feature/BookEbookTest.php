<?php

use App\Models\Book;
use App\Models\LibraryPatron;
use Illuminate\Support\Facades\Storage;

it('redirects guests from the ebook stream to the patron login', function (): void {
    Storage::fake('local');

    $book = Book::query()->create([
        'title' => 'Com e-book',
        'description' => null,
        'ebook_disk' => 'local',
        'ebook_path' => 'ebooks/x.pdf',
        'ebook_mime' => 'application/pdf',
    ]);

    Storage::disk('local')->put('ebooks/x.pdf', '%PDF fake');

    $this->get(route('biblioteca.livro.ebook', $book))->assertRedirect(route('biblioteca.login'));
});

it('allows an authenticated patron to stream an ebook', function (): void {
    Storage::fake('local');

    $patron = LibraryPatron::factory()->create();
    $book = Book::query()->create([
        'title' => 'Livro PDF',
        'description' => null,
        'ebook_disk' => 'local',
        'ebook_path' => 'ebooks/doc.pdf',
        'ebook_mime' => 'application/pdf',
    ]);

    Storage::disk('local')->put('ebooks/doc.pdf', '%PDF-1.4 fake');

    $res = $this->actingAs($patron, 'patron')->get(route('biblioteca.livro.ebook', $book));

    $res->assertOk();
    expect((string) $res->headers->get('content-type'))->toContain('application/pdf');
});

it('redirects reader page when the book has no recognised ebook format', function (): void {
    $patron = LibraryPatron::factory()->create();
    $book = Book::query()->create([
        'title' => 'Sem formato',
        'description' => null,
        'ebook_disk' => 'local',
        'ebook_path' => 'ebooks/x.bin',
        'ebook_mime' => 'application/octet-stream',
    ]);

    $this->actingAs($patron, 'patron')
        ->get(route('biblioteca.livro.ler', $book))
        ->assertRedirect(route('biblioteca.livro.show', $book));
});
