<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('current_subscription_id')->nullable()->constrained('user_subscriptions')->onDelete('set null');
            $table->timestamp('subscription_expires_at')->nullable();
            $table->boolean('has_premium_features')->default(false);
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['current_subscription_id']);
            $table->dropColumn(['current_subscription_id', 'subscription_expires_at', 'has_premium_features']);
        });
    }
};
