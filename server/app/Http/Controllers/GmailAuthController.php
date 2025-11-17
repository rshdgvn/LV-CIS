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

        // Use config() instead of env()
        $client->setClientId(config('google.client_id'));
        $client->setClientSecret(config('google.client_secret'));
        $client->setRedirectUri(config('google.redirect_for_gmail'));

        $client->addScope(Gmail::GMAIL_SEND);
        $client->setAccessType('offline');
        $client->setPrompt('consent');

        return $client;
    }

    public function redirect()
    {
        $authUrl = $this->client()->createAuthUrl();
        return redirect()->away($authUrl);
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
