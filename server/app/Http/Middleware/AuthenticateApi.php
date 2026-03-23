<?php

namespace App\Http\Middleware;

use Closure;
use Laravel\Sanctum\PersonalAccessToken;

class AuthenticateApi
{
    public function handle($request, Closure $next)
    {
        $bearerToken = $request->bearerToken();

        if (!$bearerToken) {
            return response()->json([
                'message' => 'No token provided.',
                'error_code' => 'TOKEN_MISSING' 
            ], 401);
        }

        $token = PersonalAccessToken::findToken($bearerToken);

        if (!$token) {
            return response()->json([
                'message' => 'Token is invalid.',
                'error_code' => 'TOKEN_INVALID'
            ], 401);
        }

        if ($token->expires_at && $token->expires_at->isPast()) {
            $token->delete(); 
            return response()->json([
                'message' => 'Token has expired.',
                'error_code' => 'TOKEN_EXPIRED'
            ], 401);
        }

        auth()->setUser($token->tokenable);

        return $next($request);
    }
}