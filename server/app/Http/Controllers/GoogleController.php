<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Facades\Socialite;
use App\Services\GmailService;

class GoogleController extends Controller
{
    public function redirect(Request $request)
    {
        $state = $request->query('state', 'login'); 

        return Socialite::driver('google')
            ->stateless()
            ->with(['prompt' => 'select_account', 'state' => $state])
            ->redirectUrl(config('app.url') . '/api/auth/google/callback')
            ->redirect();
    }

    public function callback(Request $request)
    {
        $mobileAppUrl = config('app.mobile_url', env('MOBILE_APP_URL'));

        try {
            $googleUser = Socialite::driver('google')->stateless()->user();
            $mode = $request->input('state', 'login');

            if (!str_ends_with($googleUser->getEmail(), 'laverdad.edu.ph')) {
                return redirect()->away($mobileAppUrl . "?error=" . urlencode("Only La Verdad emails allowed."));
            }

            if ($mode === "signup") {
                $existing = User::where('email', $googleUser->getEmail())->first();
                if ($existing) {
                    return redirect()->away($mobileAppUrl . "?error=" . urlencode("Email already registered. Please login."));
                }

                $user = User::create([
                    'first_name' => $googleUser->user['given_name'] ?? 'Student',
                    'last_name'  => $googleUser->user['family_name'] ?? '',
                    'email'      => $googleUser->getEmail(),
                    'avatar'     => $googleUser->getAvatar(),
                    'password'   => bcrypt(str()->random(16)),
                    'role'       => 'user'
                ]);

                $user->member()->create([
                    'course' => 'N/A',
                    'year_level' => 'N/A'
                ]);

                $backendUrl = config('app.url');
                $hash = sha1($user->getEmailForVerification());
                $verificationUrl = "{$backendUrl}/api/email/verify/{$user->id}/{$hash}";

                $htmlBody = view('emails.verify-email', [
                    'name' => $user->first_name,
                    'verificationLink' => $verificationUrl
                ])->render();

                (new GmailService)->send($user->email, "Verify Your Email - LVCIS", $htmlBody);

                return redirect()->away($mobileAppUrl . "?status=signup_success");
            }

            if ($mode === "login") {
                $user = User::where('email', $googleUser->getEmail())->first();

                if (!$user) {
                    return redirect()->away($mobileAppUrl . "?error=" . urlencode("Account not found. Please sign up first."));
                }

                if (!$user->hasVerifiedEmail()) {
                    return redirect()->away($mobileAppUrl . "?error=" . urlencode("Please verify your email first."));
                }

                if ($user->avatar !== $googleUser->getAvatar()) {
                    $user->avatar = $googleUser->getAvatar();
                    $user->save();
                }

                $token = $user->createToken('mobile_auth_token')->plainTextToken;

                return redirect()->away($mobileAppUrl . "?token={$token}");
            }
        } catch (\Exception $e) {
            return redirect()->away($mobileAppUrl . "?error=" . urlencode("Google authentication failed."));
        }
    }
}
