<?php

use function Pest\Laravel\get;

test('a raiz redirecciona para o catálogo da biblioteca', function () {
    $response = get(route('home'));

    $response->assertRedirect('/biblioteca');
});
