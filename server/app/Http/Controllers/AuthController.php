<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Rules\LaverdadEmail;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use App\Services\GmailService;

class AuthController extends Controller
{
    public function signup(Request $request)
    {
        $validated = $request->validate([
            'first_name'     => ['required', 'string', 'max:255'],
            'last_name'      => ['required', 'string', 'max:255'],
            'email'          => ['required', 'email', 'unique:users,email'],
            'password'       => ['required', 'string', 'min:6'],
            'course'         => ['required', 'string', 'max:255'],
            'year_level'     => ['required', 'string', 'max:255'],
            'mobile_app_url' => ['required', 'url'] 
        ]);

        $user = User::create([
            'first_name' => $validated['first_name'],
            'last_name'  => $validated['last_name'],
            'email'      => $validated['email'],
            'password'   => Hash::make($validated['password']),
            'role'       => 'user'
        ]);

        $backendUrl = config('app.url');
        $hash = sha1($user->getEmailForVerification());

        $redirectParam = urlencode($validated['mobile_app_url']);
        $verificationUrl = "{$backendUrl}/api/email/verify/{$user->id}/{$hash}?redirect_url={$redirectParam}";

        $htmlBody = view('emails.verify-email', [
            'name' => $user->first_name,
            'verificationLink' => $verificationUrl
        ])->render();

        (new GmailService)->send($user->email, "Verify Your Email - LVCIS", $htmlBody);

        return response()->json([
            'message' => 'Account created! Please check your email to verify your account.',
        ], 201);
    }

    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email'    => ['required', 'email'],
            'password' => ['required'],
        ]);

        $user = User::where('email', $credentials['email'])->first();

        if (!$user || !Hash::check($credentials['password'], $user->password)) {
            return response()->json([
                'message' => 'Invalid Email or Password.'
            ], 401);
        }

        if (!$user->hasVerifiedEmail()) {
            return response()->json([
                'message' => 'Please verify your email before logging in.'
            ], 403);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Login successful',
            'user'    => $user,
            'token'   => $token,
        ], 201);
    }

    public function logout(Request $request)
    {
        if ($request->user()) {
            $request->user()->tokens()->delete();
        }

        return response()->json([
            'message' => 'Logged out successfully'
        ]);
    }

    public function verify(Request $request, $id, $hash)
    {
        $user = User::findOrFail($id);

        if (!hash_equals($hash, sha1($user->getEmailForVerification()))) {
            return response("Invalid or expired verification link.", 400);
        }

        if (!$user->hasVerifiedEmail()) {
            $user->markEmailAsVerified();
        }

        $mobileAppUrl = $request->query('redirect_url', config('app.mobile_url', env('MOBILE_APP_URL')));

        $separator = str_contains($mobileAppUrl, '?') ? '&' : '?';

        return redirect($mobileAppUrl . $separator . "verified=true");
    }

    public function resendVerification(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'mobile_app_url' => 'required|url' 
        ]);
        
        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json(['message' => 'Email not found.'], 404);
        }

        $cooldown = 30; // seconds
        $record = DB::table('email_verification_tokens')->where('email', $request->email)->first();

        if ($record) {
            $createdAt = Carbon::parse($record->created_at);
            if ($createdAt->addSeconds($cooldown) > now()) {
                $remaining = $createdAt->addSeconds($cooldown)->diffInSeconds(now());
                return response()->json([
                    'message' => 'Please wait before requesting again.',
                    'cooldown' => $remaining
                ], 429);
            }
        }

        DB::table('email_verification_tokens')->updateOrInsert(
            ['email' => $request->email],
            ['created_at' => now()]
        );

        $frontendUrl = config('app.frontend_url');
        $redirectParam = urlencode($request->mobile_app_url);
        
        $verificationUrl = "{$frontendUrl}/verify-email?id={$user->id}&hash=" . sha1($user->getEmailForVerification()) . "&redirect_url={$redirectParam}";

        $htmlBody = view('emails.verify-email', [
            'name' => $user->first_name,
            'verificationLink' => $verificationUrl
        ])->render();

        (new GmailService)->send($user->email, "Verify Your Email - LVCIS", $htmlBody);

        return response()->json([
            'message' => 'Verification email sent successfully!',
            'cooldown' => $cooldown
        ]);
    }
}