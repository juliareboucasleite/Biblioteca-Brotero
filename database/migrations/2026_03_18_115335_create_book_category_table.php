<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (Schema::hasTable('book_category')) {
            return;
        }

       Schema::create('book_category', function (Blueprint $table) {
        $table->foreignId('book_id')->constrained()->cascadeOnDelete();
        $table->foreignId('category_id')->constrained()->cascadeOnDelete();
        $table->primary(['book_id', 'category_id']);
    });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('book_category');
    }
};
