<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('book_favorites')) {
            return;
        }

        Schema::create('book_favorites', function (Blueprint $table) {
            $table->id();
            $table->foreignId('library_patron_id')->constrained('library_patrons')->cascadeOnDelete();
            $table->foreignId('book_id')->constrained('books')->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['library_patron_id', 'book_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('book_favorites');
    }
};
