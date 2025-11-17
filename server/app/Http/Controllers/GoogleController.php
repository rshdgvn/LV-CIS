<?php

namespace App\Http\Controllers;

use App\Mail\VerifyEmailMail;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Facades\Socialite;
use Illuminate\Auth\Events\Verified;
use Illuminate\Support\Facades\Mail;

class GoogleController extends Controller
{
    public function redirect(Request $request)
    {
        $state = $request->query('state', 'login');

        return Socialite::driver('google')
            ->stateless()
            ->with([
                'prompt' => 'select_account',
                'state'  => $state
            ])
            ->redirectUrl(config('app.url') . '/api/auth/google/callback')
            ->redirect();
    }

    public function callback(Request $request)
    {
        try {
            $googleUser = Socialite::driver('google')
                ->stateless()
                ->user();

            $mode = $request->input('state', 'login');

            if (!str_ends_with($googleUser->getEmail(), '.laverdad.edu.ph')) {
                return redirect()->away(
                    config('app.frontend_url')
                        . "/google/error?message=" . urlencode("Only La Verdad emails allowed.")
                );
            }

            if ($mode === "signup") {

                $existing = User::where('email', $googleUser->getEmail())->first();
                if ($existing) {
                    return redirect()->away(
                        config('app.frontend_url')
                            . "/google/error?message=" . urlencode("This email is already registered. Please login instead.")
                    );
                }

                $user = User::create([
                    'first_name' => $googleUser->user['given_name'] ?? null,
                    'last_name'  => $googleUser->user['family_name'] ?? null,
                    'email'      => $googleUser->getEmail(),
                    'avatar'     => $googleUser->getAvatar(),
                    'password'   => bcrypt(str()->random(16)),
                    'role'       => 'user'
                ]);

                $frontendUrl = config('app.frontend_url');
                $verificationUrl = "{$frontendUrl}/verify-email?id={$user->id}&hash=" . sha1($user->getEmailForVerification());

                Mail::to($user->email)->send(new VerifyEmailMail($user->first_name, $verificationUrl));

                return redirect()->away(
                    config('app.frontend_url') . "/google/signup/success?email_sent=1"
                );
            }

            if ($mode === "login") {

                $user = User::where('email', $googleUser->getEmail())->first();

                if (!$user) {
                    return redirect()->away(
                        config('app.frontend_url')
                            . "/google/error?message=" . urlencode("Account not registered. Please sign up.")
                    );
                }

                if (!$user->hasVerifiedEmail()) {
                    return redirect()->away(
                        config('app.frontend_url')
                            . "/google/error?message=" . urlencode("Please verify your email first.")
                    );
                }

                if ($user->avatar !== $googleUser->getAvatar()) {
                    $user->avatar = $googleUser->getAvatar();
                    $user->save();
                }

                Auth::login($user);
                $token = $user->createToken('auth_token')->plainTextToken;

                return redirect()->away(
                    config('app.frontend_url') . "/google/callback?token={$token}"
                );
            }

            return redirect()->away(
                config('app.frontend_url') . "/google/error?message=" . urlencode("Invalid mode")
            );
        } catch (\Exception $e) {
            return redirect()->away(
                config('app.frontend_url') . "/google/error?message=" . urlencode("Google auth failed")
            );
        }
    }
}
