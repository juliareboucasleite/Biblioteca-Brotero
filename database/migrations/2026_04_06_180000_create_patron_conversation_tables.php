<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('patron_conversations', function (Blueprint $table): void {
            $table->id();
            $table->string('direct_pair_key', 64)->unique();
            $table->timestamps();
        });

        Schema::create('patron_conversation_members', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('patron_conversation_id')->constrained('patron_conversations')->cascadeOnDelete();
            $table->foreignId('library_patron_id')->constrained('library_patrons')->cascadeOnDelete();
            $table->timestamp('last_read_at')->nullable();
            $table->timestamps();

            $table->unique(['patron_conversation_id', 'library_patron_id'], 'patron_conv_member_unique');
        });

        Schema::create('patron_conversation_messages', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('patron_conversation_id')->constrained('patron_conversations')->cascadeOnDelete();
            $table->foreignId('library_patron_id')->constrained('library_patrons')->cascadeOnDelete();
            $table->text('body');
            $table->timestamps();

            $table->index(['patron_conversation_id', 'id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('patron_conversation_messages');
        Schema::dropIfExists('patron_conversation_members');
        Schema::dropIfExists('patron_conversations');
    }
};
