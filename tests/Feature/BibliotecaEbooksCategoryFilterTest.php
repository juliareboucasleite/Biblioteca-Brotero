<?php

use App\Models\Book;
use App\Models\Category;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('lista por ficheiro PDF/EPUB quando o filtro é a categoria E-books (id em config)', function (): void {
    $ebooks = Category::query()->create([
        'name' => 'E-books',
        'slug' => 'e-books',
    ]);
    config(['biblioteca_canonical_categories.ebooks_category_id' => $ebooks->id]);

    $romance = Category::query()->create([
        'name' => 'Romance',
        'slug' => 'romance',
    ]);

    $comPdf = Book::query()->create([
        'title' => 'Com PDF',
        'description' => null,
        'ebook_disk' => 'local',
        'ebook_path' => 'ebooks/a.pdf',
        'ebook_mime' => 'application/pdf',
    ]);
    $comPdf->categories()->sync([$romance->id]);

    $sóEtiqueta = Book::query()->create([
        'title' => 'Só etiqueta E-books',
        'description' => null,
    ]);
    $sóEtiqueta->categories()->sync([$ebooks->id]);

    $ids = Book::query()
        ->forCatalogCategory((string) $ebooks->id)
        ->pluck('id')
        ->all();

    expect($ids)->toContain($comPdf->id)->not->toContain($sóEtiqueta->id);
});

it('reconhece categoria E-books pelo slug quando o id não é 64', function (): void {
    config(['biblioteca_canonical_categories.ebooks_category_id' => 99999]);

    $ebooks = Category::query()->create([
        'name' => 'E-books',
        'slug' => 'e-books',
    ]);

    $livro = Book::query()->create([
        'title' => 'Digital',
        'description' => null,
        'ebook_disk' => 'local',
        'ebook_path' => 'ebooks/x.pdf',
        'ebook_mime' => 'application/pdf',
    ]);

    expect(
        Book::query()->forCatalogCategory((string) $ebooks->id)->pluck('id')->all(),
    )->toContain($livro->id);
});
