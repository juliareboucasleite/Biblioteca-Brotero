<?php

namespace App\Services;

use App\Models\LibraryPatron;
use Illuminate\Support\Facades\Schema;

final class PatronGamificationService
{
    public const POINTS_REQUEST = 10;

    public const POINTS_ON_TIME_RETURN = 20;

    public function addPoints(?LibraryPatron $patron, int $points): void
    {
        if ($patron === null || $points === 0) {
            return;
        }

        if (! Schema::hasColumn($patron->getTable(), 'points')) {
            return;
        }

        $patron->increment('points', $points);
    }

    public function onBookRequested(?LibraryPatron $patron): void
    {
        $this->addPoints($patron, self::POINTS_REQUEST);
    }

    public function onBookReturnedOnTime(?LibraryPatron $patron): void
    {
        $this->addPoints($patron, self::POINTS_ON_TIME_RETURN);
    }
}
