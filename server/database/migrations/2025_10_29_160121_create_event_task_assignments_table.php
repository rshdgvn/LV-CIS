<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('event_task_assignments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_task_id')->constrained('event_tasks')->onDelete('cascade');
            $table->foreignId('club_membership_id')->constrained('club_memberships')->onDelete('cascade');
            $table->timestamp('assigned_at')->nullable();
            $table->timestamps();

            $table->unique(['event_task_id', 'club_membership_id'], 'unique_event_task_assignment');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('event_task_assignments');
    }
};
