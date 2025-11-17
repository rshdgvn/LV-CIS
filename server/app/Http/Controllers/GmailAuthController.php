<?php

namespace App\Http\Controllers;

use Google\Client;
use Google\Service\Gmail;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\Request;

class GmailAuthController extends Controller
{
    private function client()
    {
        $client = new Client();
        $client->setAuthConfig(storage_path('app/google/credentials.json'));
        $client->setRedirectUri(env('GOOGLE_REDIRECT_FOR_GMAIL'));
        $client->addScope(Gmail::GMAIL_SEND);
        $client->setAccessType('offline');
        $client->setPrompt('consent');

        return $client;
    }

    public function redirect()
    {
        return redirect()->away($this->client()->createAuthUrl());
    }

    public function callback(Request $request)
    {
        $client = $this->client();
        $token = $client->fetchAccessTokenWithAuthCode($request->code);

        Storage::put('google/token.json', json_encode($token));

        return response()->json([
            "message" => "Gmail API connected! token.json created successfully.",
            "token" => $token
        ]);
    }
}
