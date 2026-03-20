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
            if (! Schema::hasColumn('library_patrons', 'email')) {
                $table->string('email')->nullable();
            }
        });

        Schema::table('library_patrons', function (Blueprint $table): void {
            if (! Schema::hasColumn('library_patrons', 'points')) {
                $table->unsignedInteger('points')->default(0);
            }
        });
    }

    public function down(): void
    {
        if (! Schema::hasTable('library_patrons')) {
            return;
        }

        $cols = array_values(array_filter([
            Schema::hasColumn('library_patrons', 'email') ? 'email' : null,
            Schema::hasColumn('library_patrons', 'points') ? 'points' : null,
        ]));

        if ($cols === []) {
            return;
        }

        Schema::table('library_patrons', function (Blueprint $table) use ($cols): void {
            $table->dropColumn($cols);
        });
    }
};
