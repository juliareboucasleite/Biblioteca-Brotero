<?php

use App\Models\Book;
use App\Models\Category;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('lista todos os livros por data de criação quando o filtro é Livros novos (id em config)', function (): void {
    $recent = Category::query()->create([
        'name' => 'Livros novos',
        'slug' => 'livros-novos',
    ]);
    config(['biblioteca_canonical_categories.recent_books_category_id' => $recent->id]);

    $older = Book::query()->create([
        'title' => 'Older',
        'description' => null,
        'created_at' => now()->subDays(10),
        'updated_at' => now()->subDays(10),
    ]);
    $newer = Book::query()->create([
        'title' => 'Newer',
        'description' => null,
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    $ordered = Book::query()
        ->forCatalogCategory((string) $recent->id)
        ->reorder()
        ->orderByDesc('created_at')
        ->orderByDesc('id')
        ->pluck('id')
        ->all();

    expect($ordered)->toContain($older->id)->toContain($newer->id);
    expect($ordered[0])->toBe($newer->id);
});

it('reconhece Livros novos pelo slug quando o id não coincide com a config', function (): void {
    config(['biblioteca_canonical_categories.recent_books_category_id' => 99999]);

    $recent = Category::query()->create([
        'name' => 'Livros novos',
        'slug' => 'livros-novos',
    ]);

    $livro = Book::query()->create([
        'title' => 'Qualquer',
        'description' => null,
    ]);

    $ids = Book::query()
        ->forCatalogCategory((string) $recent->id)
        ->pluck('id')
        ->all();

    expect($ids)->toContain($livro->id);
});
