<?php

namespace App\Support;

/**
 * Alinha língua vinda da Google Books (ISO 639-1) com os valores usados no catálogo.
 */
final class BookCatalogLanguage
{
    public static function fromGoogleCode(?string $code): ?string
    {
        if ($code === null || $code === '') {
            return null;
        }

        $key = strtolower(substr(trim($code), 0, 2));

        return match ($key) {
            'pt' => 'Português',
            'en' => 'Inglês',
            'fr' => 'Francês',
            'es' => 'Espanhol',
            'de' => 'Alemão',
            'it' => 'Italiano',
            'nl' => 'Holandês',
            default => null,
        };
    }
}
