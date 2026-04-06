<?php

use App\Models\Book;
use App\Models\BookShare;
use App\Models\LibraryPatron;

it('shows the descobertas page for guests', function (): void {
    $this->get(route('biblioteca.descobertas.index'))->assertOk();
});

it('allows a patron to publish a recommendation', function (): void {
    $patron = LibraryPatron::factory()->create();
    $book = Book::query()->create([
        'title' => 'Livro de teste',
        'description' => 'Descrição',
    ]);

    $this->actingAs($patron, 'patron')
        ->post(route('biblioteca.descobertas.store'), [
            'book_id' => $book->id,
            'message' => 'Muito bom para a turma.',
        ])
        ->assertRedirect();

    expect(BookShare::query()->where('book_id', $book->id)->where('library_patron_id', $patron->id)->exists())->toBeTrue();
});

it('forbids removing another patrons share', function (): void {
    $a = LibraryPatron::factory()->create();
    $b = LibraryPatron::factory()->create();
    $book = Book::query()->create(['title' => 'X', 'description' => null]);

    $share = BookShare::query()->create([
        'library_patron_id' => $a->id,
        'book_id' => $book->id,
        'message' => 'ok',
    ]);

    $this->actingAs($b, 'patron')
        ->delete(route('biblioteca.descobertas.destroy', $share))
        ->assertForbidden();
});
