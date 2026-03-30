<?php

/**
 * Configuração do painel de staff (bibliotecários) e notificações de pedidos.
 */
return [

    /**
     * E-mails que recebem aviso de novo pedido pendente (Via notification on-demand).
     *
     * @var list<string>
     */
    'librarian_notify_emails' => array_values(array_filter(array_map(
        static fn (string $e): string => strtolower(trim($e)),
        explode(',', (string) env('BIBLIOTECA_LIBRARIAN_NOTIFY_EMAILS', '')),
    ))),

    /**
     * E-mails de utilizadores (guard web) que podem aceder a /staff/pedidos.
     * Em ambiente local, se estiver vazio, qualquer utilizador autenticado tem acesso.
     *
     * @var list<string>
     */
    'staff_user_emails' => array_values(array_filter(array_map(
        static fn (string $e): string => strtolower(trim($e)),
        explode(',', (string) env('BIBLIOTECA_STAFF_USER_EMAILS', '')),
    ))),

    /**
     * Cartões (5 dígitos) de bibliotecárias/os no quiosque: tratados como perfil com escolha de modo ao entrar.
     * Complementa o campo library_patrons.is_librarian.
     *
     * @var list<string>
     */
    'librarian_card_numbers' => array_values(array_filter(array_map(
        static fn (string $c): string => $c,
        array_map(
            static fn (string $s): string => preg_match('/^[0-9]{5}$/', trim($s)) === 1 ? trim($s) : '',
            explode(',', (string) env('BIBLIOTECA_LIBRARIAN_CARD_NUMBERS', '')),
        ),
    ))),

];
