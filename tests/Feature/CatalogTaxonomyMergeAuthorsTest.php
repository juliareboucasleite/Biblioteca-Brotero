<?php

use App\Models\Author;
use App\Support\CatalogTaxonomyNormalizer;

test('fundir três variantes kafka com erros de escrita próximos da chave canónica', function () {
    Author::query()->create(['name' => 'Franz Kaffka']);
    Author::query()->create(['name' => 'Franz Kafka']);
    Author::query()->create(['name' => 'Fraz Kafka']);

    expect(Author::query()->count())->toBe(3);

    CatalogTaxonomyNormalizer::mergeAuthors(false);

    expect(Author::query()->count())->toBe(1);
    expect(Author::query()->value('name'))->toBe('Franz Kafka');
});
