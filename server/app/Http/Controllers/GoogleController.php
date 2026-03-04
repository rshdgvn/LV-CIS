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
            
            // Decode the state parameter
            $stateData = json_decode(base64_decode($request->input('state')), true);
            $mode = $stateData['mode'] ?? 'login';
            $platform = $stateData['platform'] ?? 'web';

            // Determine the base redirect URL based on the platform
            if ($platform === 'mobile') {
                // This matches the scheme you set in app.json + a path
                $redirectBase = 'lvcismobile://auth/callback'; 
            } else {
                $redirectBase = config('app.frontend_url', env('FRONTEND_URL')) . '/auth/callback';
            }

            // Domain Check
            if (!str_ends_with($googleUser->getEmail(), 'laverdad.edu.ph')) {
                return redirect()->away($redirectBase . "?error=" . urlencode("Only La Verdad emails allowed."));
            }

            // --- SIGNUP FLOW ---
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

                // ... Send Email Verification Logic ...

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
            // Fallback for absolute failure
            $fallbackUrl = 'lvcismobile://auth/callback?error=' . urlencode("Google authentication failed.");
            return redirect()->away($fallbackUrl);
        }
    }
}