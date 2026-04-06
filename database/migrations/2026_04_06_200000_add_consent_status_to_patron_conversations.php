<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('patron_conversations', function (Blueprint $table): void {
            $table->string('status', 20)->default('active')->after('direct_pair_key');
            $table->foreignId('initiated_by_library_patron_id')
                ->nullable()
                ->after('status')
                ->constrained('library_patrons')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('patron_conversations', function (Blueprint $table): void {
            $table->dropConstrainedForeignId('initiated_by_library_patron_id');
            $table->dropColumn('status');
        });
    }
};
