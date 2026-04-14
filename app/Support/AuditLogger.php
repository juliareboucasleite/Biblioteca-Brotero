<?php

namespace App\Support;

use App\Models\AuditLog;
use Illuminate\Http\Request;

final class AuditLogger
{
    /**
     * @param  array<string, mixed>|null  $meta
     */
    public static function log(Request $request, string $action, ?string $targetType = null, ?int $targetId = null, ?array $meta = null): void
    {
        $patron = $request->user('patron');
        $staffUser = $request->user('web');

        $actorType = 'system';
        $actorId = null;

        if ($patron !== null) {
            $actorType = 'patron';
            $actorId = (int) $patron->id;
        } elseif ($staffUser !== null) {
            $actorType = 'staff_user';
            $actorId = (int) $staffUser->id;
        }

        AuditLog::query()->create([
            'actor_type' => $actorType,
            'actor_id' => $actorId,
            'action' => $action,
            'target_type' => $targetType,
            'target_id' => $targetId,
            'meta' => $meta,
            'ip_address' => $request->ip(),
            'user_agent' => mb_substr((string) $request->userAgent(), 0, 500),
        ]);
    }
}
