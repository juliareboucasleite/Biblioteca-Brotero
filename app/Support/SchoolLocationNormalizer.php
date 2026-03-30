<?php

namespace App\Support;

/**
 * Corrige artefactos comuns em nomes de escolas (ex.: «?» no lugar de letras acentuadas UTF-8 mal importadas).
 */
final class SchoolLocationNormalizer
{
    /**
     * @var array<string, string>
     */
    private const EXACT = [
        'Escola Secund?ria Avelar Brotero' => 'Escola Secundária Avelar Brotero',
    ];

    /**
     * Padrões a aplicar depois das substituições exactas (ordem relevante).
     *
     * @var array<string, string>
     */
    private const REGEX = [
        '/\bSecund\?ria\b/u' => 'Secundária',
        '/\bB\?sica\b/u' => 'Básica',
        '/\bAnt\?nio\b/u' => 'António',
        '/\bJos\?\b/u' => 'José',
        '/\bEug\?nio\b/u' => 'Eugénio',
        '/\bNuno\s+\?lvares\b/u' => 'Nuno Álvares',
        '/\bEst\?v\?o\b/u' => 'Estêvão',
        '/\bJo\?o\b/u' => 'João',
        '/\bS\?o\b/u' => 'São',
        '/\bn\?\s*º\b/u' => 'n.º',
        '/\bR\?d\?o\b/u' => 'Ródão',
        '/\bDr\?\b/u' => 'Dr.',
    ];

    public static function fix(?string $location): ?string
    {
        if ($location === null) {
            return null;
        }

        $t = trim($location);

        if ($t === '') {
            return null;
        }

        $t = str_replace(array_keys(self::EXACT), array_values(self::EXACT), $t);

        foreach (self::REGEX as $pattern => $replacement) {
            $t = (string) preg_replace($pattern, $replacement, $t);
        }

        $t = trim($t);

        return $t === '' ? null : $t;
    }
}
