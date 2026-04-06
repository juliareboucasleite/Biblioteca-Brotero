<?php

use App\Models\Book;
use App\Models\LibraryPatron;
use App\Models\PatronBlock;
use App\Models\PatronConversation;
use App\Models\PatronPeerBookShare;
use App\Models\PatronPeerReport;

it('forbids opening a chat when blocked', function (): void {
    $a = LibraryPatron::factory()->create();
    $b = LibraryPatron::factory()->create();

    PatronBlock::query()->create([
        'blocker_library_patron_id' => $b->id,
        'blocked_library_patron_id' => $a->id,
    ]);

    $this->actingAs($a, 'patron')
        ->post(route('biblioteca.conta.mensagens.open'), [
            'library_patron_id' => $b->id,
        ])
        ->assertSessionHas('error');
});

it('allows sharing a catalog book after the conversation is active', function (): void {
    $a = LibraryPatron::factory()->create();
    $b = LibraryPatron::factory()->create();
    $conv = PatronConversation::findOrCreateDirect($a, $b);

    $this->actingAs($b, 'patron')->post(route('biblioteca.conta.mensagens.accept', $conv));

    $book = Book::query()->create([
        'title' => 'Livro partilhável',
        'description' => 'X',
    ]);

    $this->actingAs($a, 'patron')
        ->post(route('biblioteca.conta.mensagens.partilhar-livro', $conv), [
            'book_id' => $book->id,
            'note' => 'Leia isto!',
        ])
        ->assertRedirect();

    expect(PatronPeerBookShare::query()->count())->toBe(1);
});

it('stores a peer report', function (): void {
    $a = LibraryPatron::factory()->create();
    $b = LibraryPatron::factory()->create();
    PatronConversation::findOrCreateDirect($a, $b);

    $this->actingAs($a, 'patron')
        ->post(route('biblioteca.conta.leitor.denunciar', $b), [
            'category' => 'spam',
            'details' => 'Mensagens em excesso.',
        ])
        ->assertRedirect();

    expect(PatronPeerReport::query()->count())->toBe(1);
});

it('forbids viewing peer profile without an active conversation', function (): void {
    $a = LibraryPatron::factory()->create();
    $b = LibraryPatron::factory()->create();
    PatronConversation::findOrCreateDirect($a, $b);

    $this->actingAs($a, 'patron')
        ->get(route('biblioteca.conta.leitor.perfil', $b))
        ->assertForbidden();
});

it('allows viewing peer profile with an active conversation', function (): void {
    $a = LibraryPatron::factory()->create();
    $b = LibraryPatron::factory()->create();
    $conv = PatronConversation::findOrCreateDirect($a, $b);

    $this->actingAs($b, 'patron')->post(route('biblioteca.conta.mensagens.accept', $conv));

    $this->actingAs($a, 'patron')
        ->get(route('biblioteca.conta.leitor.perfil', $b))
        ->assertOk();
});
