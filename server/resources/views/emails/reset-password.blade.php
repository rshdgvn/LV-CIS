<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Reset Your Password</title>
</head>
<body style="font-family: Arial, sans-serif;">
    <h2>Hello {{ $name }},</h2>
    <p>You recently requested to reset your password. Click the button below to reset it:</p>

    <p style="text-align: center; margin: 20px 0;">
        <a href="{{ $resetLink }}" 
           style="background-color: #2563eb; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            Reset Password
        </a>
    </p>

    <p>If you did not request a password reset, no further action is required.</p>
    <p>Thanks,<br>{{ config('app.name') }} Team</p>
</body>
</html>
