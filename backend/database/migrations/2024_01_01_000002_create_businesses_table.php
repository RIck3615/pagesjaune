<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('businesses', function (Blueprint $table) {
            $table->id();
            $table->string('name', 191);
            $table->string('slug', 191)->unique();
            $table->text('description');
            $table->string('email', 191)->nullable();
            $table->string('phone', 20);
            $table->string('website', 191)->nullable();
            $table->string('address', 500);
            $table->string('city', 100);
            $table->string('province', 100);
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();
            $table->string('logo', 191)->nullable();
            $table->json('images')->nullable();
            $table->json('opening_hours')->nullable();
            $table->boolean('is_premium')->default(false);
            $table->boolean('is_verified')->default(false);
            $table->boolean('is_active')->default(true);
            $table->unsignedBigInteger('user_id');
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->index(['city', 'province', 'is_active']);
            $table->index(['latitude', 'longitude']);
            $table->index(['is_premium', 'is_active']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('businesses');
    }
};
