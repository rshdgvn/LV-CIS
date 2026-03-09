<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Email Address</title>
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
        .btn-wrapper {
            margin: 30px 0 20px 0;
        }
        .btn {
            display: inline-block;
            background-color: #4F46E5;
            color: #ffffff !important;
            text-decoration: none;
            padding: 14px 28px;
            border-radius: 8px;
            font-size: 16px;
            font-weight: bold;
            box-shadow: 0 2px 4px rgba(79, 70, 229, 0.3);
        }
        .fallback-text {
            font-size: 13px;
            color: #6B7280;
            margin-top: 30px;
            word-break: break-all;
            text-align: left;
            background-color: #F9FAFB;
            padding: 15px;
            border-radius: 6px;
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
                <h1>Verify Your Email</h1>
            </div>
            <div class="body">
                <p>Hi {{ $name ?? 'there' }},</p>
                <p>Welcome to LVCIS! We're excited to have you on board. Please click the button below to verify your email address and activate your account.</p>
                
                <div class="btn-wrapper">
                    <a href="{{ $url }}" class="btn">Verify Email Address</a>
                </div>
                
                <p><strong>Note:</strong> For your security, this verification link will expire in <strong>60 minutes</strong>.</p>
                
                <p style="font-size: 14px; color: #6B7280; margin-top: 25px;">
                    If you didn't create an account, you can safely ignore this email.
                </p>

                <div class="fallback-text">
                    If you're having trouble clicking the "Verify Email Address" button, copy and paste the URL below into your web browser:
                    <br><br>
                    <a href="{{ $url }}" style="color: #4F46E5;">{{ $url }}</a>
                </div>
            </div>
            <div class="footer">
                <p>&copy; {{ date('Y') }} LVCIS. All rights reserved.</p>
            </div>
        </div>
    </div>
</body>
</html>