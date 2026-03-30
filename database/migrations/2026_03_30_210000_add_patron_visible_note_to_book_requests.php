<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('book_requests')) {
            return;
        }

        Schema::table('book_requests', function (Blueprint $table): void {
            if (! Schema::hasColumn('book_requests', 'patron_visible_note')) {
                $table->text('patron_visible_note')->nullable();
            }
        });
    }

    public function down(): void
    {
        if (! Schema::hasTable('book_requests')) {
            return;
        }

        Schema::table('book_requests', function (Blueprint $table): void {
            if (Schema::hasColumn('book_requests', 'patron_visible_note')) {
                $table->dropColumn('patron_visible_note');
            }
        });
    }
};
