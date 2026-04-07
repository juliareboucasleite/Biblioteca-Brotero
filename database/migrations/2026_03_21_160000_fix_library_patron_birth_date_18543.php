<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Corrige data guardada incorretamente (ex.: 2008-19-03 em vez de 2008-03-19)
     * para o leitor com cartão 18543 (19/03/2008).
     */
    public function up(): void
    {
        DB::table('library_patrons')
            ->where('card_number', '18543')
            ->update(['birth_date' => '2008-03-19']);
    }

    public function down(): void
    {
        // Não é possível recuperar o valor errado anterior de forma fiável.
    }
};
