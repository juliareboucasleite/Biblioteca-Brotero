<?php

namespace App\Support;

use Carbon\Carbon;
use Carbon\CarbonInterface;

final class BirthDateParser
{
    /**
     * Interpreta data de nascimento: DDMMAA / DDMMAAAA corrido, quiosques e input HTML.
     */
    public static function parse(string $input): ?CarbonInterface
    {
        $input = trim($input);

        if ($input === '') {
            return null;
        }

        $digitsOnly = preg_replace('/\D+/', '', $input) ?? '';

        if (strlen($digitsOnly) === 6 && ctype_digit($digitsOnly)) {
            $d = self::parseDdMmYy($digitsOnly);

            if ($d !== null) {
                return $d;
            }
        }

        if (strlen($digitsOnly) === 8 && ctype_digit($digitsOnly)) {
            $d = self::parseDdMmYyyy($digitsOnly);

            if ($d !== null) {
                return $d;
            }
        }

        foreach (['Y-m-d', 'd/m/Y', 'd-m-Y'] as $format) {
            try {
                $d = Carbon::createFromFormat($format, $input);

                if ($d instanceof CarbonInterface && $d->format($format) === $input) {
                    return $d->startOfDay();
                }
            } catch (\Throwable) {
                // tenta próximo formato
            }
        }

        try {
            return Carbon::parse($input)->startOfDay();
        } catch (\Throwable) {
            return null;
        }
    }

    /** DDMMAA (ex.: 190308 → 19/03/2008). */
    private static function parseDdMmYy(string $six): ?CarbonInterface
    {
        try {
            $d = Carbon::createFromFormat('!dmy', $six);
        } catch (\Throwable) {
            return null;
        }

        if (! $d instanceof CarbonInterface) {
            return null;
        }

        return $d->format('dmy') === $six ? $d->startOfDay() : null;
    }

    /** DDMMAAAA (ex.: 19032008 → 19/03/2008). */
    private static function parseDdMmYyyy(string $eight): ?CarbonInterface
    {
        try {
            $d = Carbon::createFromFormat('!dmY', $eight);
        } catch (\Throwable) {
            return null;
        }

        if (! $d instanceof CarbonInterface) {
            return null;
        }

        return $d->format('dmY') === $eight ? $d->startOfDay() : null;
    }
}
