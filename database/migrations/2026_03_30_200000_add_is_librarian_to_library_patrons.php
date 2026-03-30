<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('library_patrons')) {
            return;
        }

        Schema::table('library_patrons', function (Blueprint $table): void {
            if (! Schema::hasColumn('library_patrons', 'is_librarian')) {
                $table->boolean('is_librarian')->default(false);
            }
        });
    }

    public function down(): void
    {
        if (! Schema::hasTable('library_patrons')) {
            return;
        }

        Schema::table('library_patrons', function (Blueprint $table): void {
            if (Schema::hasColumn('library_patrons', 'is_librarian')) {
                $table->dropColumn('is_librarian');
            }
        });
    }
};
