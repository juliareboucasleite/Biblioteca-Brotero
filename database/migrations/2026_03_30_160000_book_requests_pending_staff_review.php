<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('book_requests', function (Blueprint $table) {
            $table->dateTime('pickup_deadline')->nullable()->change();
            $table->dateTime('return_deadline')->nullable()->change();
            $table->text('staff_rejection_reason')->nullable()->after('status');
            $table->timestamp('staff_reviewed_at')->nullable()->after('staff_rejection_reason');
        });
    }

    public function down(): void
    {
        Schema::table('book_requests', function (Blueprint $table) {
            $table->dropColumn(['staff_rejection_reason', 'staff_reviewed_at']);
        });
    }
};
