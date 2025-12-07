<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('announcements', function (Blueprint $table) {
            $table->enum('target_type', ['general', 'club'])->default('general')->after('status');
            $table->unsignedBigInteger('club_id')->nullable()->after('target_type');

            $table->foreign('club_id')->references('id')->on('clubs')->onDelete('set null');
        });
    }

    public function down()
    {
        Schema::table('announcements', function (Blueprint $table) {
            $table->dropForeign(['club_id']);
            $table->dropColumn(['target_type', 'club_id']);
        });
    }
};
