<?php

use App\Http\Controllers\Biblioteca\LibraryPatronAuthController;
use App\Models\BookRequest;
use App\Models\LibraryPatron;
use function Pest\Laravel\actingAs;

it('recognizes card scans with formatting noise', function (): void {
    $staff = LibraryPatron::factory()->create([
        'role' => LibraryPatron::ROLE_STAFF,
    ]);

    BookRequest::query()->create([
        'request_type' => 'escola',
        'book_title' => 'Livro A',
        'card_number' => '12345',
        'pickup_deadline' => now()->addDay(),
        'return_deadline' => now()->addDays(15),
        'status' => 'pending',
    ]);

    actingAs($staff, 'patron')
        ->withSession([LibraryPatronAuthController::SESSION_PORTAL_MODE_KEY => 'bibliotecaria'])
        ->from('/biblioteca/conta/balcao')
        ->post('/biblioteca/conta/balcao/scan', [
            'scan_value' => 'cartao 12345',
        ])
        ->assertRedirect('/biblioteca/conta/balcao')
        ->assertSessionHas('success');
});

it('recognizes isbn scans with hyphens', function (): void {
    $staff = LibraryPatron::factory()->create([
        'role' => LibraryPatron::ROLE_STAFF,
    ]);

    BookRequest::query()->create([
        'request_type' => 'escola',
        'book_title' => 'Livro B',
        'card_number' => '54321',
        'isbn' => '978-972-0-12345-6',
        'pickup_deadline' => now()->addDay(),
        'return_deadline' => now()->addDays(15),
        'status' => 'created',
    ]);

    actingAs($staff, 'patron')
        ->withSession([LibraryPatronAuthController::SESSION_PORTAL_MODE_KEY => 'bibliotecaria'])
        ->from('/biblioteca/conta/balcao')
        ->post('/biblioteca/conta/balcao/scan', [
            'scan_value' => 'isbn 9789720123456',
        ])
        ->assertRedirect('/biblioteca/conta/balcao')
        ->assertSessionHas('success');
});

it('recognizes pedido scans with prefix text', function (): void {
    $staff = LibraryPatron::factory()->create([
        'role' => LibraryPatron::ROLE_STAFF,
    ]);

    $request = BookRequest::query()->create([
        'request_type' => 'escola',
        'book_title' => 'Livro C',
        'card_number' => '11111',
        'pickup_deadline' => now()->addDay(),
        'return_deadline' => now()->addDays(15),
        'status' => 'pending',
    ]);

    actingAs($staff, 'patron')
        ->withSession([LibraryPatronAuthController::SESSION_PORTAL_MODE_KEY => 'bibliotecaria'])
        ->from('/biblioteca/conta/balcao')
        ->post('/biblioteca/conta/balcao/scan', [
            'scan_value' => "pedido {$request->id}",
        ])
        ->assertRedirect('/biblioteca/conta/balcao')
        ->assertSessionHas('success');
});
