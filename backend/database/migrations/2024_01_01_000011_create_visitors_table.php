<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('visitors', function (Blueprint $table) {
            $table->id();
            $table->string('ip_address', 45);
            $table->string('user_agent')->nullable();
            $table->string('country')->nullable();
            $table->string('city')->nullable();
            $table->timestamp('visited_at');
            $table->timestamps();

            $table->index(['ip_address', 'visited_at']);
            $table->index('visited_at');
        });
    }

    public function down()
    {
        Schema::dropIfExists('visitors');
    }
};
