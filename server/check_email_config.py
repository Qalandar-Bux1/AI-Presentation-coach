#!/usr/bin/env python3
"""
Quick script to check if email configuration is set up correctly.
Run this from the server directory: python check_email_config.py
"""

import os
from dotenv import load_dotenv
from utils.path_utils import get_env_path

# Load .env file (dev + packaged safe)
env_path = get_env_path()
load_dotenv(env_path)

print("=" * 60)
print("Email Configuration Checker")
print("=" * 60)
print()

# Check if .env file exists
if not os.path.exists(env_path):
    print("❌ ERROR: .env file not found!")
    print(f"   Expected location: {env_path}")
    print()
    print("📝 SOLUTION:")
    print("   1. Create a file named '.env' in the server/ directory")
    print("   2. Copy the template from server/.env.example")
    print("   3. Fill in your SMTP credentials")
    print()
    exit(1)

print("✅ .env file found")
print()

# Check required variables
required_vars = {
    "SMTP_USERNAME": "Your Gmail address (e.g., your-email@gmail.com)",
    "SMTP_PASSWORD": "Gmail App Password (16 characters, no spaces)",
    "SMTP_SERVER": "SMTP server (default: smtp.gmail.com)",
    "SMTP_PORT": "SMTP port (default: 587)",
    "FRONTEND_URL": "Frontend URL (default: http://localhost:3000)"
}

all_configured = True

for var_name, description in required_vars.items():
    value = os.getenv(var_name)
    
    if var_name in ["SMTP_SERVER", "SMTP_PORT", "FRONTEND_URL"]:
        # These have defaults, so just show what's configured
        default_value = {
            "SMTP_SERVER": "smtp.gmail.com",
            "SMTP_PORT": "587",
            "FRONTEND_URL": "http://localhost:3000"
        }
        if value:
            print(f"✅ {var_name}: {value}")
        else:
            print(f"⚠️  {var_name}: Not set (will use default: {default_value[var_name]})")
    else:
        # These are required
        if value:
            # Mask password for security
            if "PASSWORD" in var_name:
                masked = "*" * min(len(value), 16) + ("..." if len(value) > 16 else "")
                print(f"✅ {var_name}: {masked}")
            else:
                print(f"✅ {var_name}: {value}")
        else:
            print(f"❌ {var_name}: NOT SET")
            print(f"   Required: {description}")
            all_configured = False

print()
print("=" * 60)

if all_configured:
    print("✅ All required email configuration is set!")
    print()
    print("📧 Next steps:")
    print("   1. Make sure you're using a Gmail App Password (not your regular password)")
    print("   2. Restart your Flask server after updating .env")
    print("   3. Test signup to verify emails are being sent")
    print()
    print("🧪 Test your configuration:")
    print("   Visit: http://localhost:5000/auth/test-email-config")
else:
    print("❌ Email configuration is incomplete!")
    print()
    print("📝 To fix this:")
    print("   1. Open server/.env file")
    print("   2. Add the missing variables (see QUICK_EMAIL_SETUP.md for details)")
    print("   3. For Gmail, get an App Password:")
    print("      https://myaccount.google.com/apppasswords")
    print("   4. Restart your Flask server")
    print()
    print("📖 See QUICK_EMAIL_SETUP.md for detailed instructions")

print("=" * 60)

