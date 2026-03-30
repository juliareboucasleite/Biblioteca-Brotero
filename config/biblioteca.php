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

];
