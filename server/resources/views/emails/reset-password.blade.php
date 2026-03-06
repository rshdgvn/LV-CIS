<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Password Reset Code</title>
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; 
            background-color: #f4f7f6; 
            margin: 0; 
            padding: 0; 
        }
        .email-wrapper { width: 100%; background-color: #f4f7f6; padding: 40px 0; }
        .email-content { 
            max-width: 500px; 
            margin: 0 auto; 
            background-color: #ffffff; 
            border-radius: 12px; 
            overflow: hidden; 
            box-shadow: 0 4px 15px rgba(0,0,0,0.05); 
        }
        .header { 
            background-color: #4F46E5; 
            padding: 30px 20px; 
            text-align: center; 
            color: #ffffff; 
        }
        .header h1 { margin: 0; font-size: 24px; font-weight: 600; }
        .body { 
            padding: 30px 20px; 
            color: #374151; 
            line-height: 1.6; 
            font-size: 16px; 
            text-align: center; 
        }
        .code-box { 
            background-color: #F3F4F6; 
            margin: 30px auto; 
            padding: 20px; 
            border-radius: 8px; 
            max-width: 250px; 
            border: 2px dashed #D1D5DB; 
        }
        .code { 
            font-size: 38px; 
            font-weight: bold; 
            color: #111827; 
            letter-spacing: 8px; 
        }
        .footer { 
            background-color: #F9FAFB; 
            padding: 20px; 
            text-align: center; 
            font-size: 13px; 
            color: #6B7280; 
            border-top: 1px solid #E5E7EB; 
        }
    </style>
</head>
<body>
    <div class="email-wrapper">
        <div class="email-content">
            <div class="header">
                <h1>Password Reset</h1>
            </div>
            <div class="body">
                <p>Hi {{ $name }},</p>
                <p>We received a request to reset your password. Please return to the app and enter the 6-digit verification code below:</p>
                
                <div class="code-box">
                    <p class="code">{{ $code }}</p>
                </div>
                
                <p><strong>Note:</strong> For your security, this code will expire in <strong>15 minutes</strong>.</p>
                <p style="font-size: 14px; color: #6B7280; margin-top: 25px;">
                    If you didn't request a password reset, you can safely ignore this email. Your account is secure.
                </p>
            </div>
            <div class="footer">
                <p>&copy; {{ date('Y') }} Your App Name. All rights reserved.</p>
            </div>
        </div>
    </div>
</body>
</html>