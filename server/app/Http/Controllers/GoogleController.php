<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Facades\Socialite;

class GoogleController extends Controller
{
    public function redirectToGoogle()
    {
        return Socialite::driver('google')
            ->with(['prompt' => 'select_account'])
            ->stateless()
            ->redirect();
    }

    public function handleGoogleCallback()
    {
        try {
            $googleUser = Socialite::driver('google')->stateless()->user();

            if (!str_ends_with($googleUser->getEmail(), '.laverdad.edu.ph')) {
                $msg = urlencode('Only La Verdad work emails allowed');
                return redirect()->away(config('app.frontend_url') . "/google/error?message={$msg}");
            }

            $fullName = $googleUser->getName();
            $nameParts = explode(' ', $fullName, 2);

            $firstName = $nameParts[0] ?? '';
            $lastName = $nameParts[1] ?? '';

            $user = User::firstOrCreate(
                ['email' => $googleUser->getEmail()],
                [
                    'first_name' => $firstName,
                    'last_name'  => $lastName,
                    'password'   => bcrypt(str()->random(16)), 
                    'role'       => 'user',
                    'google_id'  => $googleUser->getId(),
                    'avatar'     => $googleUser->getAvatar(),
                ]
            );

            if ($user->avatar !== $googleUser->getAvatar()) {
                $user->avatar = $googleUser->getAvatar();
                $user->save();
            }

            Auth::login($user);

            $token = $user->createToken('auth_token')->plainTextToken;

            return redirect()->away(config('app.frontend_url') . "/google/callback?token={$token}");
        } catch (\Exception $e) {
            $msg = urlencode('Google login failed');
            return redirect()->away(config('app.frontend_url') . "/google/error?message={$msg}");
        }
    }
}
