<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('book_requests', function (Blueprint $table) {
            $table->id();
            $table->string('request_type'); // escola | cacifo

            // Conteudo do pedido (apenas título + ISBN conforme requisito)
            $table->string('book_title');
            $table->string('isbn')->nullable()->index();

            // Cartão (somente números, 5 dígitos)
            $table->char('card_number', 5);

            // Para retirada na escola
            $table->string('school_location')->nullable();

            // Para retirada em cacifo
            $table->string('cacifo_code')->nullable()->unique();

            // Prazos (DATETIME evita default obrigatório do TIMESTAMP)
            $table->dateTime('pickup_deadline');
            $table->dateTime('return_deadline');

            // Estado simplificado (vai permitindo futuras rotinas / comandos)
            $table->string('status')->default('created'); // created | expired | returned
            $table->timestamp('returned_at')->nullable();

            // Multa (5 euros)
            $table->decimal('fine_amount', 8, 2)->default(0);
            $table->timestamp('fine_applied_at')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('book_requests');
    }
};

