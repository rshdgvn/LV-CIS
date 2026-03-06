<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;
use App\Models\User;
use App\Services\GmailService;

class PasswordResetController extends Controller
{
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
            $createdAt = Carbon::parse($record->created_at);
            if ($createdAt->addSeconds($cooldown) > now()) {
                $remaining = $createdAt->diffInSeconds(now());
                return response()->json([
                    'message' => 'Please wait before requesting again.',
                    'cooldown' => $remaining
                ], 429);
            }
        }

        $resetCode = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        $hashedCode = Hash::make($resetCode);

        DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $request->email],
            [
                'token' => $hashedCode,
                'created_at' => now(),
            ]
        );

        $htmlBody = view('emails.reset-password', [
            'name' => $user->first_name,
            'code' => $resetCode,
        ])->render();

        (new GmailService)->send($user->email, 'Your Password Reset Code', $htmlBody);

        return response()->json([
            'message' => 'Reset code has been sent successfully!',
            'cooldown' => $cooldown,
        ]);
    }
    

    public function verifyCode(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'code' => 'required|digits:6',
        ]);

        $record = DB::table('password_reset_tokens')
            ->where('email', $request->email)
            ->first();

        if (!$record || !Hash::check($request->code, $record->token)) {
            return response()->json(['message' => 'Invalid verification code.'], 400);
        }

        if (Carbon::parse($record->created_at)->addMinutes(15)->isPast()) {
            DB::table('password_reset_tokens')->where('email', $request->email)->delete();
            return response()->json(['message' => 'Verification code has expired. Please request a new one.'], 400);
        }

        return response()->json(['message' => 'Code verified successfully.']);
    }


    public function reset(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'code' => 'required|digits:6', 
            'password' => 'required|string|min:8|confirmed',
        ]);

        $record = DB::table('password_reset_tokens')
            ->where('email', $request->email)
            ->first();

        if (!$record || !Hash::check($request->code, $record->token)) {
            return response()->json(['message' => 'Invalid or expired code.'], 400);
        }

        if (Carbon::parse($record->created_at)->addMinutes(15)->isPast()) {
            DB::table('password_reset_tokens')->where('email', $request->email)->delete();
            return response()->json(['message' => 'Verification code has expired.'], 400);
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