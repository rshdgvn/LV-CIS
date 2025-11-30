<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('club_memberships', function (Blueprint $table) {
            $table->enum('activity_status', ['active', 'inactive'])
                ->default('active')
                ->after('status');
        });
    }

    public function down()
    {
        Schema::table('club_memberships', function (Blueprint $table) {
            $table->dropColumn('activity_status');
        });
    }
};
