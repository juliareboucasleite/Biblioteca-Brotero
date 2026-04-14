<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('patron_conversation_messages')
            ->select(['id', 'body'])
            ->orderBy('id')
            ->chunkById(200, function ($rows): void {
                foreach ($rows as $row) {
                    $body = (string) ($row->body ?? '');

                    if ($body === '') {
                        continue;
                    }

                    if ($this->isEncrypted($body)) {
                        continue;
                    }

                    DB::table('patron_conversation_messages')
                        ->where('id', $row->id)
                        ->update([
                            'body' => Crypt::encryptString($body),
                        ]);
                }
            });
    }

    public function down(): void
    {
        DB::table('patron_conversation_messages')
            ->select(['id', 'body'])
            ->orderBy('id')
            ->chunkById(200, function ($rows): void {
                foreach ($rows as $row) {
                    $body = (string) ($row->body ?? '');

                    if ($body === '') {
                        continue;
                    }

                    if (! $this->isEncrypted($body)) {
                        continue;
                    }

                    DB::table('patron_conversation_messages')
                        ->where('id', $row->id)
                        ->update([
                            'body' => Crypt::decryptString($body),
                        ]);
                }
            });
    }

    private function isEncrypted(string $value): bool
    {
        try {
            Crypt::decryptString($value);

            return true;
        } catch (\Throwable) {
            return false;
        }
    }
};
