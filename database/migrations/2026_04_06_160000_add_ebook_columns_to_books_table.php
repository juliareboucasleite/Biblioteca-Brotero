<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('books', function (Blueprint $table): void {
            $table->string('ebook_disk', 32)->nullable()->after('cover_image');
            $table->string('ebook_path')->nullable()->after('ebook_disk');
            $table->string('ebook_mime', 127)->nullable()->after('ebook_path');
        });
    }

    public function down(): void
    {
        Schema::table('books', function (Blueprint $table): void {
            $table->dropColumn(['ebook_disk', 'ebook_path', 'ebook_mime']);
        });
    }
};
