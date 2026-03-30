<?php

namespace App\Support;

use App\Models\User;

final class StaffBibliotecaAccess
{
    public static function canAccessStaffPanel(?User $user): bool
    {
        if ($user === null || ! is_string($user->email) || $user->email === '') {
            return false;
        }

        $allowed = config('biblioteca.staff_user_emails', []);

        if ($allowed === []) {
            return app()->isLocal();
        }

        return in_array(strtolower($user->email), $allowed, true);
    }
}
