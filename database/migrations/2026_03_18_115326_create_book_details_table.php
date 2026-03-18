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
        if (Schema::hasTable('book_details')) {
            return;
        }

        Schema::create('book_details', function (Blueprint $table) {
        $table->id();
        $table->foreignId('book_id')->unique()->constrained()->cascadeOnDelete();
        $table->string('publisher')->nullable();
        $table->string('location')->nullable();
        $table->string('format')->nullable();
        $table->string('dimensions')->nullable();
        $table->timestamps();
    });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('book_details');
    }
};
