<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('event_details', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_id')->constrained('events')->onDelete('cascade');
            $table->date('event_date');
            $table->time('event_time');
            $table->string('venue');
            $table->string('organizer');
            $table->string('contact_person');
            $table->string('contact_email')->nullable();
            $table->enum('event_mode', ['face_to_face', 'online', 'hybrid'])->default('face_to_face');
            $table->string('duration');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('event_details');
    }
};
