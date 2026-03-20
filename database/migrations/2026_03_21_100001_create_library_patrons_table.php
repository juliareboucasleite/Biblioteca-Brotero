<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('library_patrons', function (Blueprint $table) {
            $table->id();
            $table->char('card_number', 5)->unique();
            $table->date('birth_date');
            $table->string('name')->nullable();
            $table->rememberToken();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('library_patrons');
    }
};
