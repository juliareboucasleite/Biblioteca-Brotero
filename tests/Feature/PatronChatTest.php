-- Active: 1770202365524@@127.0.0.1@3306@biblioteca
<?php

use App\Models\LibraryPatron;
use App\Models\PatronConversation;
use App\Models\PatronConversationMessage;

it('redirects guests from the messages inbox to the patron login', function (): void {
    $this->get(route('biblioteca.conta.mensagens.index'))
        ->assertRedirect(route('biblioteca.login'));
});

it('opens or reuses a direct conversation between two patrons', function (): void {
    $a = LibraryPatron::factory()->create();
    $b = LibraryPatron::factory()->create();

    $this->actingAs($a, 'patron')
        ->post(route('biblioteca.conta.mensagens.open'), [
            'library_patron_id' => $b->id,
        ])
        ->assertRedirect();

    $conv = PatronConversation::query()->first();

    expect($conv)->not->toBeNull();
    expect($conv->members()->count())->toBe(2);

    $this->actingAs($a, 'patron')
        ->post(route('biblioteca.conta.mensagens.open'), [
            'library_patron_id' => $b->id,
        ])
        ->assertRedirect(route('biblioteca.conta.mensagens.show', $conv));

    expect(PatronConversation::query()->count())->toBe(1);
});

it('allows a patron to send a message and forbids outsiders from the thread', function (): void {
    $a = LibraryPatron::factory()->create();
    $b = LibraryPatron::factory()->create();
    $c = LibraryPatron::factory()->create();

    $conv = PatronConversation::findOrCreateDirect($a, $b);

    $this->actingAs($a, 'patron')
        ->post(route('biblioteca.conta.mensagens.store', $conv), [
            'body' => 'Olá! Posso requisitar contigo?',
        ])
        ->assertRedirect();

    expect(PatronConversationMessage::query()->where('patron_conversation_id', $conv->id)->count())->toBe(1);

    $this->actingAs($c, 'patron')
        ->get(route('biblioteca.conta.mensagens.show', $conv))
        ->assertForbidden();

    $this->actingAs($c, 'patron')
        ->post(route('biblioteca.conta.mensagens.store', $conv), [
            'body' => 'Intrusion',
        ])
        ->assertForbidden();
});
