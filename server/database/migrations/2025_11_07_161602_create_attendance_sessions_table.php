<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('attendance_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('club_id')->constrained()->onDelete('cascade');
            $table->foreignId('event_id')->nullable()->constrained()->onDelete('cascade');
            $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null');
            $table->string('title')->nullable();
            $table->text('description')->nullable();
            $table->date('date');
            $table->boolean('is_open')->default(true);
            $table->timestamps();
            $table->unique(['club_id', 'date', 'title']); 
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('attendance_sessions');
    }
};
