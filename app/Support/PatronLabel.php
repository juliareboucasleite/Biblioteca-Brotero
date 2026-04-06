<?php

namespace App\Support;

use App\Models\LibraryPatron;

final class PatronLabel
{
    public static function format(?LibraryPatron $patron): string
    {
        if ($patron === null) {
            return 'Leitor';
        }

        $name = trim((string) ($patron->name ?? ''));

        if ($name !== '') {
            return $name;
        }

        $card = (string) $patron->card_number;

        if (strlen($card) >= 2) {
            return 'Leitor ····'.substr($card, -2);
        }

        return 'Leitor';
    }
}
