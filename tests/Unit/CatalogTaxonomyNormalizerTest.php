<?php

use App\Support\CatalogTaxonomyNormalizer;

test('normalizeKey agrupa variantes de iniciais e pontuação', function () {
    $a = CatalogTaxonomyNormalizer::normalizeKey('S. L. Rubinstein');
    $b = CatalogTaxonomyNormalizer::normalizeKey('S.L. Rubinstein');

    expect($a)->not->toBe('');
    expect($a)->toBe($b);
});

test('normalizeKey agrupa acentos e erros de ponto após o primeiro nome', function () {
    $a = CatalogTaxonomyNormalizer::normalizeKey('Tina Vallès');
    $b = CatalogTaxonomyNormalizer::normalizeKey('Tina. Valles');

    expect($a)->not->toBe('');
    expect($a)->toBe($b);
});

test('normalizeDisplayName mantém palavras legíveis', function () {
    expect(CatalogTaxonomyNormalizer::normalizeDisplayName('tina vallès'))
        ->toBe('Tina Vallès');
});

test('normalizeKey não funde por si só grafias kafka com um erro (fusão é por proximidade)', function () {
    expect(CatalogTaxonomyNormalizer::normalizeKey('Franz Kafka'))
        ->not->toBe(CatalogTaxonomyNormalizer::normalizeKey('Franz Kaffka'));

    expect(CatalogTaxonomyNormalizer::normalizeKey('Franz Kafka'))
        ->not->toBe(CatalogTaxonomyNormalizer::normalizeKey('Fraz Kafka'));
});
