<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\EventDetail;
use Illuminate\Http\Request;
use App\Services\CloudinaryService;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Support\Facades\DB;

class EventController extends Controller
{
    use AuthorizesRequests;

    protected $cloudinary;

    public function __construct(CloudinaryService $cloudinary)
    {
        $this->cloudinary = $cloudinary;
    }

    public function getAllEvents()
    {
        $events = Event::with([
            'detail',
            'club:id,name',
            'club.users:id,first_name,last_name,email'
        ])
            ->latest()
            ->get();

        $events->transform(function ($event) {
            if ($event->club && $event->club->users) {
                $event->club->users->transform(function ($user) {
                    $user->name = trim($user->first_name . ' ' . $user->last_name);
                    return $user;
                });
            }
            return $event;
        });

        return response()->json($events);
    }

    public function getEventById($id)
    {
        $event = Event::with('detail')->findOrFail($id);
        return response()->json($event);
    }

    public function addEvent(Request $request)
    {
        $this->authorize('create', Event::class);

        try {
            $validated = $request->validate([
                'club_id' => 'required|exists:clubs,id',
                'title' => 'required|string|max:255',
                'purpose' => 'required|string',
                'description' => 'required|string',
                'cover_image' => 'nullable|file|image|max:5120',
                'photos.*' => 'nullable|file|image|max:5120',
                'videos.*' => 'nullable|file|mimetypes:video/mp4,video/quicktime|max:20480',
                'status' => 'required|string|in:upcoming,ongoing,completed',

                'event_date' => 'required|date',
                'event_time' => 'required|string',
                'venue' => 'required|string|max:255',
                'organizer' => 'required|string|max:255',
                'contact_person' => 'required|string|max:255',
                'contact_email' => 'required|email',
                'event_mode' => 'required|string|in:online,face_to_face,hybrid',
                'duration' => 'required|string|max:255',
            ]);

            $formattedTime = date('H:i:s', strtotime($validated['event_time']));

            // Use database transaction for data consistency
            DB::beginTransaction();

            try {
                // Upload cover image
                $coverUrl = null;
                if ($request->hasFile('cover_image')) {
                    Log::info('Uploading cover image...');
                    $coverUrl = $this->cloudinary->upload($request->file('cover_image'), 'events/covers');

                    if (!$coverUrl) {
                        throw new \Exception('Failed to upload cover image to Cloudinary');
                    }
                    Log::info('Cover image uploaded successfully', ['url' => $coverUrl]);
                }

                // Upload photos with error handling
                $photoUrls = [];
                if ($request->hasFile('photos')) {
                    $photos = $request->file('photos');
                    Log::info('Uploading photos...', ['count' => count($photos)]);

                    foreach ($photos as $index => $photo) {
                        try {
                            $url = $this->cloudinary->upload($photo, 'events/photos');
                            if ($url) {
                                $photoUrls[] = $url;
                                Log::info("Photo {$index} uploaded", ['url' => $url]);
                            } else {
                                Log::warning("Photo {$index} upload returned null");
                            }
                        } catch (\Exception $e) {
                            Log::error("Failed to upload photo {$index}", [
                                'error' => $e->getMessage(),
                                'file_size' => $photo->getSize(),
                                'mime_type' => $photo->getMimeType()
                            ]);
                            // Continue with other photos instead of failing completely
                        }
                    }

                    if (empty($photoUrls) && count($photos) > 0) {
                        throw new \Exception('All photo uploads failed');
                    }
                }

                // Upload videos with error handling
                $videoUrls = [];
                if ($request->hasFile('videos')) {
                    $videos = $request->file('videos');
                    Log::info('Uploading videos...', ['count' => count($videos)]);

                    foreach ($videos as $index => $video) {
                        try {
                            $url = $this->cloudinary->upload($video, 'events/videos');
                            if ($url) {
                                $videoUrls[] = $url;
                                Log::info("Video {$index} uploaded", ['url' => $url]);
                            } else {
                                Log::warning("Video {$index} upload returned null");
                            }
                        } catch (\Exception $e) {
                            Log::error("Failed to upload video {$index}", [
                                'error' => $e->getMessage(),
                                'file_size' => $video->getSize(),
                                'mime_type' => $video->getMimeType()
                            ]);
                        }
                    }
                }

                // Create event record
                $event = Event::create([
                    'club_id' => $validated['club_id'],
                    'title' => $validated['title'],
                    'purpose' => $validated['purpose'],
                    'description' => $validated['description'],
                    'cover_image' => $coverUrl,
                    'photos' => $photoUrls,
                    'videos' => $videoUrls,
                    'status' => $validated['status'],
                ]);

                // Create event detail
                EventDetail::create([
                    'event_id' => $event->id,
                    'event_date' => $validated['event_date'],
                    'event_time' => $formattedTime,
                    'venue' => $validated['venue'],
                    'organizer' => $validated['organizer'],
                    'contact_person' => $validated['contact_person'],
                    'contact_email' => $validated['contact_email'],
                    'event_mode' => $validated['event_mode'],
                    'duration' => $validated['duration'],
                ]);

                DB::commit();

                return response()->json([
                    'message' => 'Event created successfully.',
                    'event' => $event->load('detail'),
                    'upload_summary' => [
                        'photos_uploaded' => count($photoUrls),
                        'videos_uploaded' => count($videoUrls),
                        'cover_uploaded' => !is_null($coverUrl),
                    ]
                ], 201);
            } catch (\Exception $e) {
                DB::rollBack();
                throw $e;
            }
        } catch (ValidationException $e) {
            return response()->json(['errors' => $e->errors()], 422);
        } catch (\Throwable $e) {
            Log::error('Error creating event: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
            ]);
            return response()->json([
                'message' => 'Failed to create event.',
                'error' => config('app.debug') ? $e->getMessage() : 'An error occurred during event creation.',
            ], 500);
        }
    }

    public function updateEvent(Request $request, $id)
    {
        try {
            $validated = $request->validate([
                'club_id' => 'required|exists:clubs,id',
                'title' => 'required|string|max:255',
                'purpose' => 'required|string',
                'description' => 'required|string',
                'cover_image' => 'sometimes|nullable',
                'photos.*' => 'sometimes|nullable',
                'videos.*' => 'nullable',
                'status' => 'required|string|in:upcoming,ongoing,completed',
                'event_date' => 'required|date',
                'event_time' => 'required|string',
                'venue' => 'required|string|max:255',
                'organizer' => 'required|string|max:255',
                'contact_person' => 'required|string|max:255',
                'contact_email' => 'required|email',
                'event_mode' => 'required|string|in:online,face_to_face,hybrid',
                'duration' => 'required|string|max:255',
            ]);

            $event = Event::findOrFail($id);
            $this->authorize('update', $event);
            $formattedTime = date('H:i:s', strtotime($validated['event_time']));

            DB::beginTransaction();

            try {
                // Handle cover image
                $coverUrl = $event->cover_image;
                if ($request->hasFile('cover_image')) {
                    Log::info('Updating cover image...');
                    $newCoverUrl = $this->cloudinary->upload($request->file('cover_image'), 'events/covers');
                    if ($newCoverUrl) {
                        $coverUrl = $newCoverUrl;
                        Log::info('Cover image updated successfully');
                    } else {
                        Log::warning('Cover image upload returned null, keeping existing');
                    }
                } elseif ($request->filled('existing_cover_image')) {
                    $coverUrl = $request->input('existing_cover_image');
                }

                // Handle photos
                $existingPhotos = $request->input('existing_photos', []);
                if (!is_array($existingPhotos)) {
                    $existingPhotos = is_string($existingPhotos) ? json_decode($existingPhotos, true) : [];
                }
                if (!is_array($existingPhotos)) $existingPhotos = [];

                $newPhotoUrls = [];
                if ($request->hasFile('photos')) {
                    $photos = $request->file('photos');
                    Log::info('Uploading new photos...', ['count' => count($photos)]);

                    foreach ($photos as $index => $photo) {
                        try {
                            $url = $this->cloudinary->upload($photo, 'events/photos');
                            if ($url) {
                                $newPhotoUrls[] = $url;
                                Log::info("New photo {$index} uploaded");
                            }
                        } catch (\Exception $e) {
                            Log::error("Failed to upload new photo {$index}", [
                                'error' => $e->getMessage()
                            ]);
                        }
                    }
                }
                $photoUrls = array_merge($existingPhotos, $newPhotoUrls);

                // Handle videos
                $existingVideos = $request->input('existing_videos', []);
                if (!is_array($existingVideos)) {
                    $existingVideos = is_string($existingVideos) ? json_decode($existingVideos, true) : [];
                }
                if (!is_array($existingVideos)) $existingVideos = [];

                $newVideoUrls = [];
                if ($request->hasFile('videos')) {
                    $videos = $request->file('videos');
                    Log::info('Uploading new videos...', ['count' => count($videos)]);

                    foreach ($videos as $index => $video) {
                        try {
                            $url = $this->cloudinary->upload($video, 'events/videos');
                            if ($url) {
                                $newVideoUrls[] = $url;
                                Log::info("New video {$index} uploaded");
                            }
                        } catch (\Exception $e) {
                            Log::error("Failed to upload new video {$index}", [
                                'error' => $e->getMessage()
                            ]);
                        }
                    }
                }
                $videoUrls = array_merge($existingVideos, $newVideoUrls);

                // Update event
                $event->update([
                    'club_id' => $validated['club_id'],
                    'title' => $validated['title'],
                    'purpose' => $validated['purpose'],
                    'description' => $validated['description'],
                    'cover_image' => $coverUrl,
                    'photos' => $photoUrls,
                    'videos' => $videoUrls,
                    'status' => $validated['status'],
                ]);

                // Update or create event detail
                $eventDetail = $event->detail;
                if ($eventDetail) {
                    $eventDetail->update([
                        'event_date' => $validated['event_date'],
                        'event_time' => $formattedTime,
                        'venue' => $validated['venue'],
                        'organizer' => $validated['organizer'],
                        'contact_person' => $validated['contact_person'],
                        'contact_email' => $validated['contact_email'],
                        'event_mode' => $validated['event_mode'],
                        'duration' => $validated['duration'],
                    ]);
                } else {
                    EventDetail::create([
                        'event_id' => $event->id,
                        'event_date' => $validated['event_date'],
                        'event_time' => $formattedTime,
                        'venue' => $validated['venue'],
                        'organizer' => $validated['organizer'],
                        'contact_person' => $validated['contact_person'],
                        'contact_email' => $validated['contact_email'],
                        'event_mode' => $validated['event_mode'],
                        'duration' => $validated['duration'],
                    ]);
                }

                DB::commit();

                return response()->json([
                    'message' => 'Event updated successfully.',
                    'event' => $event->load('detail'),
                    'upload_summary' => [
                        'new_photos_uploaded' => count($newPhotoUrls),
                        'new_videos_uploaded' => count($newVideoUrls),
                        'total_photos' => count($photoUrls),
                        'total_videos' => count($videoUrls),
                    ]
                ], 200);
            } catch (\Exception $e) {
                DB::rollBack();
                throw $e;
            }
        } catch (ValidationException $e) {
            return response()->json(['errors' => $e->errors()], 422);
        } catch (\Throwable $e) {
            Log::error('Error updating event: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json([
                'message' => 'Failed to update event.',
                'error' => config('app.debug') ? $e->getMessage() : 'An error occurred during event update.',
            ], 500);
        }
    }

    public function deleteEvent($id)
    {
        $event = Event::findOrFail($id);
        $this->authorize('delete', $event);
        $event->detail()->delete();
        $event->delete();

        return response()->json(['message' => 'Event deleted successfully.']);
    }
}
