<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class NotificationController extends Controller
{
    /**
     * GET /api/notifications
     * Fetch all notifications for the authenticated user.
     * Includes unread count, and actor avatar from the data payload.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $perPage = $request->query('per_page', 20);

        $notifications = $user->notifications()
            ->paginate($perPage);

        $formatted = $notifications->map(function ($n) {
            return $this->formatNotification($n);
        });

        return response()->json([
            'notifications'  => $formatted,
            'unread_count'   => $user->unreadNotifications()->count(),
            'total'          => $notifications->total(),
            'current_page'   => $notifications->currentPage(),
            'last_page'      => $notifications->lastPage(),
        ]);
    }

    /**
     * GET /api/notifications/unread-count
     * Quick count for badge in nav bar.
     */
    public function unreadCount(Request $request)
    {
        return response()->json([
            'unread_count' => $request->user()->unreadNotifications()->count(),
        ]);
    }

    /**
     * POST /api/notifications/{id}/read
     * Mark a single notification as read.
     */
    public function markAsRead(Request $request, $id)
    {
        $notification = $request->user()
            ->notifications()
            ->where('id', $id)
            ->firstOrFail();

        $notification->markAsRead();

        return response()->json([
            'message'      => 'Notification marked as read.',
            'unread_count' => $request->user()->unreadNotifications()->count(),
        ]);
    }

    /**
     * POST /api/notifications/read-all
     * Mark all notifications as read.
     */
    public function markAllAsRead(Request $request)
    {
        $request->user()->unreadNotifications->markAsRead();

        return response()->json([
            'message'      => 'All notifications marked as read.',
            'unread_count' => 0,
        ]);
    }

    /**
     * DELETE /api/notifications/{id}
     * Delete a single notification.
     */
    public function destroy(Request $request, $id)
    {
        $notification = $request->user()
            ->notifications()
            ->where('id', $id)
            ->firstOrFail();

        $notification->delete();

        return response()->json([
            'message'      => 'Notification deleted.',
            'unread_count' => $request->user()->unreadNotifications()->count(),
        ]);
    }

    /**
     * DELETE /api/notifications
     * Delete all notifications for the user.
     */
    public function destroyAll(Request $request)
    {
        $request->user()->notifications()->delete();

        return response()->json([
            'message'      => 'All notifications cleared.',
            'unread_count' => 0,
        ]);
    }

    // ─────────────────────────────────────────────
    // Private helper: format a notification for the frontend
    // ─────────────────────────────────────────────
    private function formatNotification($notification): array
    {
        $data = $notification->data;

        return [
            'id'           => $notification->id,
            'type'         => $data['type'] ?? 'general',
            'title'        => $data['title'] ?? 'Notification',
            'body'         => $data['body'] ?? '',
            'is_read'      => !is_null($notification->read_at),
            'read_at'      => $notification->read_at,
            'created_at'   => $notification->created_at,
            'time_ago'     => $notification->created_at->diffForHumans(),

            // Actor info (for avatar display in React Native)
            'actor' => [
                'id'     => $data['actor_id'] ?? null,
                'name'   => $data['actor_name'] ?? 'System',
                'avatar' => $data['actor_avatar'] ?? null,
            ],

            // Extra context data (optional, used for deep linking)
            'meta' => array_filter([
                'club_id'      => $data['club_id'] ?? null,
                'club_name'    => $data['club_name'] ?? null,
                'event_id'     => $data['event_id'] ?? null,
                'event_title'  => $data['event_title'] ?? null,
                'task_id'      => $data['task_id'] ?? null,
                'task_title'   => $data['task_title'] ?? null,
                'session_id'   => $data['session_id'] ?? null,
                'status'       => $data['status'] ?? null,
                'new_status'   => $data['new_status'] ?? null,
                'new_role'     => $data['new_role'] ?? null,
            ]),
        ];
    }
}