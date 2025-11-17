<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('gmail_tokens', function (Blueprint $table) {
            $table->id();
            $table->string('identifier')->default('system')->unique();
            $table->text('access_token');
            $table->text('refresh_token');
            $table->string('scope')->nullable();
            $table->string('token_type')->default('Bearer');
            $table->integer('expires_in')->default(3599);
            $table->timestamp('token_created_at')->nullable();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('gmail_tokens');
    }
};
