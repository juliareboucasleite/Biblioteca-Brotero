<?php

test('a raiz redirecciona para o catálogo da biblioteca', function () {
    $response = $this->get(route('home'));

    $response->assertRedirect('/biblioteca');
});
