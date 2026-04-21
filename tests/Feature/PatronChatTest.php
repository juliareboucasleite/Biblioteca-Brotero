<?php

use App\Models\LibraryPatron;
use App\Models\PatronConversation;
use App\Models\PatronConversationMessage;
use function Pest\Laravel\actingAs;
use function Pest\Laravel\get;

it('redirects guests from the messages inbox to the patron login', function (): void {
    get(route('biblioteca.conta.mensagens.index'))
        ->assertRedirect(route('biblioteca.login'));
});

it('creates a pending conversation when opening a chat', function (): void {
    $a = LibraryPatron::factory()->create();
    $b = LibraryPatron::factory()->create();

    actingAs($a, 'patron')
        ->post(route('biblioteca.conta.mensagens.open'), [
            'library_patron_id' => $b->id,
        ])
        ->assertRedirect(route('biblioteca.conta.mensagens.show', PatronConversation::query()->first()));

    $conv = PatronConversation::query()->first();

    expect($conv)->not->toBeNull();
    expect($conv->status)->toBe(PatronConversation::STATUS_PENDING)
        ->and($conv->initiated_by_library_patron_id)->toBe($a->id)
        ->and($conv->members()->count())->toBe(2);
});

it('forbids messaging until the recipient accepts', function (): void {
    $a = LibraryPatron::factory()->create();
    $b = LibraryPatron::factory()->create();
    $conv = PatronConversation::findOrCreateDirect($a, $b);

    actingAs($a, 'patron')
        ->from(route('biblioteca.conta.mensagens.show', $conv))
        ->post(route('biblioteca.conta.mensagens.store', $conv), [
            'body' => 'Olá',
        ])
        ->assertRedirect()
        ->assertSessionHas('error');

    expect(PatronConversationMessage::query()->count())->toBe(0);

    actingAs($b, 'patron')
        ->post(route('biblioteca.conta.mensagens.accept', $conv))
        ->assertRedirect(route('biblioteca.conta.mensagens.show', $conv));

    expect($conv->fresh()->status)->toBe(PatronConversation::STATUS_ACTIVE);

    actingAs($a, 'patron')
        ->post(route('biblioteca.conta.mensagens.store', $conv), [
            'body' => 'Olá',
        ])
        ->assertRedirect();

    expect(PatronConversationMessage::query()->where('patron_conversation_id', $conv->id)->count())->toBe(1);
});

it('allows the recipient to decline and blocks further messaging', function (): void {
    $a = LibraryPatron::factory()->create();
    $b = LibraryPatron::factory()->create();
    $conv = PatronConversation::findOrCreateDirect($a, $b);

    actingAs($b, 'patron')
        ->post(route('biblioteca.conta.mensagens.decline', $conv))
        ->assertRedirect(route('biblioteca.conta.mensagens.index'));

    expect($conv->fresh()->status)->toBe(PatronConversation::STATUS_DECLINED);

    actingAs($a, 'patron')
        ->from(route('biblioteca.conta.mensagens.show', $conv))
        ->post(route('biblioteca.conta.mensagens.store', $conv), [
            'body' => 'Não devia passar',
        ])
        ->assertRedirect()
        ->assertSessionHas('error');
});

it('forbids outsiders from the thread', function (): void {
    $a = LibraryPatron::factory()->create();
    $b = LibraryPatron::factory()->create();
    $c = LibraryPatron::factory()->create();
    $conv = PatronConversation::findOrCreateDirect($a, $b);

    actingAs($b, 'patron')->post(route('biblioteca.conta.mensagens.accept', $conv));

    actingAs($c, 'patron')
        ->get(route('biblioteca.conta.mensagens.show', $conv))
        ->assertForbidden();

    actingAs($c, 'patron')
        ->post(route('biblioteca.conta.mensagens.store', $conv), [
            'body' => 'Intrusion',
        ])
        ->assertForbidden();
});
