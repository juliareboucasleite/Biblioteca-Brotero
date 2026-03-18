<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('books') || !Schema::hasColumn('books', 'published_year')) {
            return;
        }

        // Evita dependência do doctrine/dbal usando SQL direto.
        // SMALLINT UNSIGNED cobre anos históricos (ex.: 1881) e também anos futuros.
        try {
            DB::statement('ALTER TABLE `books` MODIFY `published_year` SMALLINT UNSIGNED NULL');
        } catch (\Throwable $e) {
            // Se já estiver no tipo desejado (ou compatível), não falha a migration.
        }
    }

    public function down(): void
    {
        // Não revertendo para YEAR por compatibilidade de dados já enriquecidos.
    }
};

