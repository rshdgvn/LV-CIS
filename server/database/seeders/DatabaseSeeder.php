<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            AdminSeeder::class,
            ClubSeeder::class,
            ClubMembershipSeeder::class,
            EventSeeder::class,
            EventTaskSeeder::class,
            EventTaskAssignmentSeeder::class,
        ]);
    }
}
