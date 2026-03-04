<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Laravel\Socialite\Facades\Socialite;
use App\Services\GmailService;

class GoogleController extends Controller
{
    public function redirect(Request $request)
    {
        $mode = $request->query('mode', 'login');
        $platform = $request->query('platform', 'web'); 

        // Encode both variables into the state parameter
        $state = base64_encode(json_encode(['mode' => $mode, 'platform' => $platform]));

        return Socialite::driver('google')
            ->stateless()
            ->with(['prompt' => 'select_account', 'state' => $state])
            ->redirect();
    }

    public function callback(Request $request)
    {
        try {
            $googleUser = Socialite::driver('google')->stateless()->user();
            
            $stateData = json_decode(base64_decode($request->input('state')), true);
            $mode = $stateData['mode'] ?? 'login';
            $platform = $stateData['platform'] ?? 'web';

            if ($platform === 'mobile') {
                $redirectBase = 'lvcismobile://auth/callback'; 
            } else {
                $redirectBase = config('app.frontend_url', env('FRONTEND_URL')) . '/auth/callback';
            }

            if (!str_ends_with($googleUser->getEmail(), 'laverdad.edu.ph')) {
                return redirect()->away($redirectBase . "?error=" . urlencode("Only La Verdad emails allowed."));
            }

            if ($mode === "signup") {
                $existing = User::where('email', $googleUser->getEmail())->first();
                if ($existing) {
                    return redirect()->away($redirectBase . "?error=" . urlencode("Email already registered. Please login."));
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

                return redirect()->away($redirectBase . "?status=signup_success");
            }

            // --- LOGIN FLOW ---
            if ($mode === "login") {
                $user = User::where('email', $googleUser->getEmail())->first();

                if (!$user) {
                    return redirect()->away($redirectBase . "?error=" . urlencode("Account not found. Please sign up."));
                }
                if (!$user->hasVerifiedEmail()) {
                    return redirect()->away($redirectBase . "?error=" . urlencode("Please verify your email first."));
                }

                if ($user->avatar !== $googleUser->getAvatar()) {
                    $user->avatar = $googleUser->getAvatar();
                    $user->save();
                }

                $token = $user->createToken('auth_token')->plainTextToken;

                return redirect()->away($redirectBase . "?token={$token}");
            }

            return redirect()->away($redirectBase . "?error=" . urlencode("Invalid mode."));

        } catch (\Exception $e) {
            $fallbackUrl = 'lvcismobile://auth/callback?error=' . urlencode("Google authentication failed.");
            return redirect()->away($fallbackUrl);
        }
    }
}