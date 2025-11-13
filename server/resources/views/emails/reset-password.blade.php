<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Password Reset - LVCIS</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f3f4f6; margin: 0; padding: 0;">
  <table align="center" cellpadding="0" cellspacing="0" width="100%" 
         style="max-width: 600px; background-color: #ffffff; margin: 40px auto; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
    

    <!-- Email body -->
    <tr>
      <td style="padding: 30px;">
        <h2 style="color: #111827;">Hello {{ $name }},</h2>
        <p style="color: #374151; line-height: 1.6;">
          You recently requested to reset your password for your <strong>LVCIS</strong> account.
          Click the button below to set a new password:
        </p>

        <p style="text-align: center; margin: 30px 0;">
          <a href="{{ $resetLink }}" 
             style="display: inline-block; background-color: #2563eb; color: #ffffff; font-weight: bold; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
            Reset Password
          </a>
        </p>

        <p style="color: #6b7280; line-height: 1.6;">
          If you didn’t request this, you can ignore this email. Your account will remain secure.
        </p>

        <p style="margin-top: 30px; color: #374151;">
          Regards,<br>
          <strong>LVCIS Team</strong>
        </p>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="background-color: #f9fafb; text-align: center; padding: 15px; font-size: 12px; color: #9ca3af;">
        © {{ date('Y') }} LVCIS (La Verdad Club Integrated System). All rights reserved.
      </td>
    </tr>
  </table>
</body>
</html>
