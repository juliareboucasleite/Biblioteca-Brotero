<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('library_patrons')) {
            return;
        }

        Schema::table('library_patrons', function (Blueprint $table): void {
            if (! Schema::hasColumn('library_patrons', 'role')) {
                $table->string('role', 20)->default('student')->after('is_librarian');
            }
        });

        if (Schema::hasColumn('library_patrons', 'is_librarian')) {
            DB::table('library_patrons')
                ->where('is_librarian', true)
                ->update(['role' => 'staff']);
        }
    }

    public function down(): void
    {
        if (! Schema::hasTable('library_patrons')) {
            return;
        }

        Schema::table('library_patrons', function (Blueprint $table): void {
            if (Schema::hasColumn('library_patrons', 'role')) {
                $table->dropColumn('role');
            }
        });
    }
};
