<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('books')) {
            return;
        }

        Schema::create('books', function (Blueprint $table) {
        $table->id();
        $table->string('title');
        $table->text('description')->nullable();
        $table->string('isbn')->nullable()->unique();
        $table->year('published_year')->nullable();
        $table->integer('pages')->nullable();
        $table->string('cover_image')->nullable();
        $table->string('language')->nullable();
        $table->timestamps();
});
    }

    public function down(): void
    {
        Schema::dropIfExists('books');
    }
};