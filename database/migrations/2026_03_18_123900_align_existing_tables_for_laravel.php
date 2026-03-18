<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $this->addTimestampsIfMissing('books');
        $this->addTimestampsIfMissing('authors');
        $this->addTimestampsIfMissing('categories');
        $this->addTimestampsIfMissing('book_details');
    }

    public function down(): void
    {
        // Não removemos colunas em bases já existentes.
    }

    private function addTimestampsIfMissing(string $table): void
    {
        if (!Schema::hasTable($table)) {
            return;
        }

        $hasCreatedAt = Schema::hasColumn($table, 'created_at');
        $hasUpdatedAt = Schema::hasColumn($table, 'updated_at');

        if ($hasCreatedAt && $hasUpdatedAt) {
            return;
        }

        Schema::table($table, function (Blueprint $t) use ($hasCreatedAt, $hasUpdatedAt) {
            if (!$hasCreatedAt) {
                $t->timestamp('created_at')->nullable();
            }
            if (!$hasUpdatedAt) {
                $t->timestamp('updated_at')->nullable();
            }
        });
    }
};

