<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Club;
use Cloudinary\Cloudinary;

class ClubSeeder extends Seeder
{
    public function run(): void
    {
        $cloudinary = new Cloudinary(config('cloudinary'));

        $clubsData = [
            [
                'name' => 'Blue Harmony',
                'category' => 'culture_and_performing_arts',
                'description' => 'Create a supportive environment that encourages passion, creativity, and discipline through music and performance.',
                'adviser' => 'Dan Teves',
                'logo' => 'club_logos/blue_harmony_logo.png',
            ],
            [
                'name' => 'Blue Harmusika',
                'category' => 'culture_and_performing_arts',
                'description' => "Develop and enhance members' musical skills, artistic talents, and appreciation for music.",
                'adviser' => 'Dan Teves',
                'logo' => 'club_logos/blue_harmusika_logo.png',
            ],
            [
                'name' => 'La Verdad Dance Troupe',
                'category' => 'culture_and_performing_arts',
                'description' => 'Promote institutional integrity and pride by upholding Biblical moral standards and disciplined artistry.',
                'adviser' => 'Dan Teves',
                'logo' => 'club_logos/la_verdad_dance_troupe_logo.png',
            ],
            [
                'name' => 'La Verdad Production Team',
                'category' => 'culture_and_performing_arts',
                'description' => 'Enhance students’ skills in production and creative media.',
                'adviser' => 'Dan Teves',
                'logo' => 'club_logos/la_verdad_production_team_logo.png',
            ],
            [
                'name' => 'Coro De La Verdad',
                'category' => 'culture_and_performing_arts',
                'description' => 'Reach and sustain the highest levels of vocal performance, choral artistry, and musical education.',
                'adviser' => 'Dan Teves',
                'logo' => 'club_logos/coro_de_la_verdad_logo.png',
            ],
            [
                'name' => "The MaArtee's",
                'category' => 'culture_and_performing_arts',
                'description' => 'Empower young artists to discover their voice, foster meaningful connections, and create art that enriches the community.',
                'adviser' => 'Dan Teves',
                'logo' => 'club_logos/the_maartees_logo.png',
            ],
            [
                'name' => 'La Verdad Front Liners',
                'category' => 'socio_politics',
                'description' => 'Provide ongoing assistance and support to our school so that it can greet and serve students and guests with care.',
                'adviser' => 'Dan Teves',
                'logo' => 'club_logos/la_verdad_front_liners_logo.png',
            ],
            [
                'name' => 'LVCC DRRT',
                'category' => 'socio_politics',
                'description' => 'Promote disaster preparedness, first aid, and rescue skills among students.',
                'adviser' => 'Dan Teves',
                'logo' => 'club_logos/lvcc_drrt_logo.png',
            ],
            [
                'name' => 'AIM',
                'category' => 'academics',
                'description' => 'Empower students by fostering a community dedicated to the exploration and advancement of information technology.',
                'adviser' => 'Dan Teves',
                'logo' => 'club_logos/aim_logo.png',
            ],
            [
                'name' => 'JPIA',
                'category' => 'academics',
                'description' => 'Establish a strong and harmonious relationship among members with genuine commitment to the organization.',
                'adviser' => 'Dan Teves',
                'logo' => 'club_logos/jpia_logo.png',
            ],
            [
                'name' => 'JSWAP',
                'category' => 'academics',
                'description' => 'Cultivate essential skills and knowledge for creating a positive impact on the lives of others.',
                'adviser' => 'Dan Teves',
                'logo' => 'club_logos/jswap_logo.png',
            ],
            [
                'name' => 'Agham-Mazing Pioneer',
                'category' => 'socio_politics',
                'description' => 'Foster scientific thinking and innovation for the betterment of society.',
                'adviser' => 'Dan Teves',
                'logo' => 'club_logos/agham_mazing_pioneer_logo.png',
            ],
        ];

        foreach ($clubsData as $clubData) {
            $localPath = public_path($clubData['logo']);

            if (file_exists($localPath)) {
                try {
                    $upload = $cloudinary->uploadApi()->upload($localPath, [
                        'folder' => 'lv-cis/clubs',
                        'overwrite' => true,
                        'resource_type' => 'image',
                    ]);

                    $clubData['logo'] = $upload['secure_url'] ?? null;
                } catch (\Exception $e) {
                    $this->command->warn("⚠️ Failed to upload {$clubData['name']} logo: " . $e->getMessage());
                    $clubData['logo'] = null;
                }
            } else {
                $this->command->warn("📁 File not found: {$localPath}");
                $clubData['logo'] = null;
            }

            Club::updateOrCreate(['name' => $clubData['name']], $clubData);
        }

    }
}
