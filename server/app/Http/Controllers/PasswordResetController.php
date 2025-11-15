<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Carbon\Carbon;
use App\Models\User;
use App\Mail\ResetPasswordMail;


class PasswordResetController extends Controller
{
    /**
     * Step 1: Generate and email the reset token
     */
    public function sendResetToken(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json(['message' => 'Email not found.'], 404);
        }

        $cooldown = 30;


        $record = DB::table('password_reset_tokens')
            ->where('email', $request->email)
            ->first();

        if ($record) {
            $createdAt = Carbon::parse($record->created_at); // convert to Carbon
            if ($createdAt->addSeconds($cooldown) > now()) {
                $remaining = $createdAt->diffInSeconds(now());
                return response()->json([
                    'message' => 'Please wait before requesting again.',
                    'cooldown' => $remaining
                ], 429);
            }
        }


        $plainToken = Str::random(64);
        $hashedToken = Hash::make($plainToken);

        DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $request->email],
            [
                'token' => $hashedToken,
                'created_at' => now(),
            ]
        );

        Mail::to($user->email)->send(new ResetPasswordMail($plainToken, $user));

        return response()->json([
            'message' => 'Reset link has been sent successfully!.',
            'cooldown' => $cooldown,
        ]);
    }


    /**
     * Step 2: Verify token and reset password
     */
    public function reset(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'token' => 'required|string',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $record = DB::table('password_reset_tokens')
            ->where('email', $request->email)
            ->first();

        if (!$record || !Hash::check($request->token, $record->token)) {
            return response()->json(['message' => 'Invalid or expired token.'], 400);
        }

        if (Carbon::parse($record->created_at)->addHour()->isPast()) {
            DB::table('password_reset_tokens')->where('email', $request->email)->delete();
            return response()->json(['message' => 'Token has expired.'], 400);
        }

        $user = User::where('email', $request->email)->first();
        if (!$user) {
            return response()->json(['message' => 'User not found.'], 404);
        }

        $user->forceFill([
            'password' => Hash::make($request->password),
        ])->save();

        DB::table('password_reset_tokens')->where('email', $request->email)->delete();

        return response()->json(['message' => 'Password reset successfully.']);
    }
}
