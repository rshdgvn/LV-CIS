<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Event;
use App\Models\EventDetail;
use App\Models\Club;

class EventSeeder extends Seeder
{
    public function run(): void
    {

        $events = [
            [
                'title' => 'Leadership Training Seminar',
                'purpose' => 'Develop leadership and communication skills.',
                'description' => 'A one-day seminar to enhance leadership potential among student officers.',
                'cover_image' => 'images/events/leadership_training.jpg',
                'photos' => ['images/events/leadership_training_1.jpg'],
                'videos' => [],
                'status' => 'upcoming',
                'details' => [
                    'event_date' => now()->addDays(5)->toDateString(),
                    'event_time' => '08:00',
                    'venue' => 'University Conference Hall',
                    'organizer' => 'Student Affairs Office',
                    'contact_person' => 'Maria Santos',
                    'contact_email' => 'maria.santos@university.edu.ph',
                    'event_mode' => 'face_to_face',
                    'duration' => '1 day',
                ],
            ],
            [
                'title' => 'Environmental Awareness Week',
                'purpose' => 'Promote sustainability and eco-friendly practices.',
                'description' => 'A week-long event featuring clean-up drives, talks, and recycling campaigns.',
                'cover_image' => 'images/events/environmental_awareness.jpg',
                'photos' => ['images/events/environmental_1.jpg', 'images/events/environmental_2.jpg'],
                'videos' => ['videos/environmental_awareness.mp4'],
                'status' => 'upcoming',
                'details' => [
                    'event_date' => now()->addDays(10)->toDateString(),
                    'event_time' => '07:30',
                    'venue' => 'Main Campus Grounds',
                    'organizer' => 'Eco Club',
                    'contact_person' => 'Leo Garcia',
                    'contact_email' => 'leo.garcia@university.edu.ph',
                    'event_mode' => 'hybrid',
                    'duration' => '5 days',
                ],
            ],
            [
                'title' => 'Career Orientation Day',
                'purpose' => 'Prepare students for future career opportunities.',
                'description' => 'Talks from industry professionals and alumni about career readiness.',
                'cover_image' => 'images/events/career_day.jpg',
                'photos' => [],
                'videos' => [],
                'status' => 'upcoming',
                'details' => [
                    'event_date' => now()->addDays(15)->toDateString(),
                    'event_time' => '09:00',
                    'venue' => 'Auditorium A',
                    'organizer' => 'Guidance Office',
                    'contact_person' => 'John Dela Cruz',
                    'contact_email' => 'john.delacruz@university.edu.ph',
                    'event_mode' => 'face_to_face',
                    'duration' => '1 day',
                ],
            ],
            [
                'title' => 'Science and Technology Fair',
                'purpose' => 'Showcase student innovation and research.',
                'description' => 'Students will exhibit projects and experiments demonstrating scientific inquiry.',
                'cover_image' => 'images/events/science_fair.jpg',
                'photos' => ['images/events/science1.jpg'],
                'videos' => ['videos/science_fair.mp4'],
                'status' => 'upcoming',
                'details' => [
                    'event_date' => now()->addDays(20)->toDateString(),
                    'event_time' => '08:30',
                    'venue' => 'STEM Building',
                    'organizer' => 'Science Club',
                    'contact_person' => 'Ella Lim',
                    'contact_email' => 'ella.lim@university.edu.ph',
                    'event_mode' => 'face_to_face',
                    'duration' => '2 days',
                ],
            ],
            [
                'title' => 'Cultural Night 2025',
                'purpose' => 'Celebrate diversity and Filipino culture.',
                'description' => 'Performances, exhibits, and food festival celebrating cultural heritage.',
                'cover_image' => 'images/events/cultural_night.jpg',
                'photos' => ['images/events/cultural1.jpg', 'images/events/cultural2.jpg'],
                'videos' => [],
                'status' => 'upcoming',
                'details' => [
                    'event_date' => now()->addDays(25)->toDateString(),
                    'event_time' => '18:00',
                    'venue' => 'University Quadrangle',
                    'organizer' => 'Cultural Affairs Committee',
                    'contact_person' => 'Rhea Gomez',
                    'contact_email' => 'rhea.gomez@university.edu.ph',
                    'event_mode' => 'face_to_face',
                    'duration' => '1 night',
                ],
            ],
            [
                'title' => 'IT Innovation Summit',
                'purpose' => 'Explore new trends in information technology.',
                'description' => 'Talks and workshops from IT professionals about emerging technologies.',
                'cover_image' => 'images/events/it_summit.jpg',
                'photos' => [],
                'videos' => ['videos/it_summit_intro.mp4'],
                'status' => 'upcoming',
                'details' => [
                    'event_date' => now()->addDays(30)->toDateString(),
                    'event_time' => '09:00',
                    'venue' => 'Computer Science Auditorium',
                    'organizer' => 'IT Society',
                    'contact_person' => 'Patrick Villanueva',
                    'contact_email' => 'patrick.villanueva@university.edu.ph',
                    'event_mode' => 'hybrid',
                    'duration' => '2 days',
                ],
            ],
            [
                'title' => 'Sports Fest 2025',
                'purpose' => 'Encourage fitness and teamwork among students.',
                'description' => 'Annual inter-department sports competition including basketball, volleyball, and track events.',
                'cover_image' => 'images/events/sports_fest.jpg',
                'photos' => ['images/events/sports1.jpg'],
                'videos' => [],
                'status' => 'upcoming',
                'details' => [
                    'event_date' => now()->addDays(35)->toDateString(),
                    'event_time' => '07:00',
                    'venue' => 'University Gymnasium',
                    'organizer' => 'Physical Education Department',
                    'contact_person' => 'Andre Lopez',
                    'contact_email' => 'andre.lopez@university.edu.ph',
                    'event_mode' => 'face_to_face',
                    'duration' => '3 days',
                ],
            ],
            [
                'title' => 'Literary and Arts Festival',
                'purpose' => 'Promote creativity through writing and visual arts.',
                'description' => 'A celebration of literature, painting, poetry, and short films by students.',
                'cover_image' => 'images/events/arts_festival.jpg',
                'photos' => ['images/events/art1.jpg', 'images/events/art2.jpg'],
                'videos' => ['videos/arts_festival.mp4'],
                'status' => 'upcoming',
                'details' => [
                    'event_date' => now()->addDays(40)->toDateString(),
                    'event_time' => '10:00',
                    'venue' => 'Arts Building Lobby',
                    'organizer' => 'Literary Society',
                    'contact_person' => 'Samantha Cruz',
                    'contact_email' => 'samantha.cruz@university.edu.ph',
                    'event_mode' => 'face_to_face',
                    'duration' => '3 days',
                ],
            ],
            [
                'title' => 'Campus Journalism Workshop',
                'purpose' => 'Train aspiring student writers and editors.',
                'description' => 'A workshop series focused on writing, layouting, and editorial standards.',
                'cover_image' => 'images/events/journalism_workshop.jpg',
                'photos' => ['images/events/journalism1.jpg'],
                'videos' => [],
                'status' => 'upcoming',
                'details' => [
                    'event_date' => now()->addDays(45)->toDateString(),
                    'event_time' => '09:00',
                    'venue' => 'Media Center',
                    'organizer' => 'Campus Press Club',
                    'contact_person' => 'Liza Ramos',
                    'contact_email' => 'liza.ramos@university.edu.ph',
                    'event_mode' => 'online',
                    'duration' => '2 days',
                ],
            ],
            [
                'title' => 'Research Colloquium',
                'purpose' => 'Showcase student and faculty research projects.',
                'description' => 'An academic event highlighting innovative studies and presentations across disciplines.',
                'cover_image' => 'images/events/research_colloquium.jpg',
                'photos' => [],
                'videos' => ['videos/research_colloquium.mp4'],
                'status' => 'upcoming',
                'details' => [
                    'event_date' => now()->addDays(50)->toDateString(),
                    'event_time' => '08:30',
                    'venue' => 'Research Hall',
                    'organizer' => 'Research and Development Office',
                    'contact_person' => 'Dr. Henry Ponce',
                    'contact_email' => 'henry.ponce@university.edu.ph',
                    'event_mode' => 'hybrid',
                    'duration' => '2 days',
                ],
            ],
        ];

        foreach ($events as $data) {
            $event = Event::create([
                'club_id' => rand(1, 12),
                'title' => $data['title'],
                'purpose' => $data['purpose'],
                'description' => $data['description'],
                'cover_image' => $data['cover_image'],
                'photos' => $data['photos'],
                'videos' => $data['videos'],
                'status' => $data['status'],
            ]);

            EventDetail::create(array_merge(
                ['event_id' => $event->id],
                $data['details']
            ));
        }
    }
}
