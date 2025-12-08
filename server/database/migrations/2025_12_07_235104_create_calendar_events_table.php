<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('calendar_events', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->dateTime('start_time'); 
            $table->dateTime('end_time')->nullable();
            $table->string('theme')->default('blue'); 
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('calendar_events');
    }
};
