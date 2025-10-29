<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('event_task_attachments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_task_id')->constrained('event_tasks')->onDelete('cascade');
            $table->foreignId('uploaded_by')->nullable()->constrained('club_memberships')->onDelete('set null');
            $table->string('file_path');
            $table->string('file_type')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('event_task_attachments');
    }
};
