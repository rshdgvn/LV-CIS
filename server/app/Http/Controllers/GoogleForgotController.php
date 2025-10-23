<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Laravel\Socialite\Facades\Socialite;

class GoogleForgotController extends Controller
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

            if (!str_ends_with($googleUser->getEmail(), '@student.laverdad.edu.ph')) {
                return redirect()->away("http://localhost:5173/reset/error?reason=invalid_email");
            }

            $user = User::where('email', $googleUser->getEmail())->first();

            if (!$user) {
                return redirect()->away("http://localhost:5173/reset/error?reason=user_not_found");
            }

            $token = $user->createToken('password_reset')->plainTextToken;

            return redirect()->away("http://localhost:5173/reset-password?token={$token}&email={$user->email}");
        } catch (\Exception $e) {
            return redirect()->away("http://localhost:5173/reset/error?reason=google_failed");
        }
    }

    public function resetPassword(Request $request)
    {
        $request->validate(['password' => 'required|min:8']);
        $user = $request->user();

        $user->update(['password' => Hash::make($request->password)]);
        return response()->json(['message' => 'Password reset successfully']);
    }
}
