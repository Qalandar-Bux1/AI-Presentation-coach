import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
import logging
from dotenv import load_dotenv

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables from server directory
env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env')
load_dotenv(env_path)

def check_smtp_config():
    """
    Check if SMTP configuration is available
    Returns: (is_configured: bool, error_message: str)
    """
    smtp_username = os.getenv("SMTP_USERNAME")
    smtp_password = os.getenv("SMTP_PASSWORD")
    
    if not smtp_username:
        return False, "SMTP_USERNAME is not configured in environment variables"
    if not smtp_password:
        return False, "SMTP_PASSWORD is not configured in environment variables"
    
    return True, None

def send_verification_email(email, token, username):
    """
    Send email verification link to user
    Returns: (success: bool, error_message: str)
    """
    try:
        # Check SMTP configuration first
        is_configured, config_error = check_smtp_config()
        if not is_configured:
            logger.error(f"SMTP configuration error: {config_error}")
            return False, config_error
        
        # Get email configuration from environment variables
        smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com")
        smtp_port = int(os.getenv("SMTP_PORT", "587"))
        smtp_username = os.getenv("SMTP_USERNAME")
        smtp_password = os.getenv("SMTP_PASSWORD")
        frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
        
        logger.info(f"Attempting to send verification email to: {email}")
        logger.info(f"Using SMTP server: {smtp_server}:{smtp_port}")
        
        # Create verification link
        verification_link = f"{frontend_url}/verify-email?token={token}"
        
        # Create message
        msg = MIMEMultipart()
        msg['From'] = smtp_username
        msg['To'] = email
        msg['Subject'] = "Verify Your Email - AI Presentation Coach"
        
        # Email body
        body = f"""
        <html>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #6366f1;">Welcome to AI Presentation Coach, {username}!</h2>
              <p>Thank you for signing up. Please verify your email address to activate your account.</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="{verification_link}" 
                   style="background: linear-gradient(to right, #6366f1, #8b5cf6); 
                          color: white; 
                          padding: 12px 30px; 
                          text-decoration: none; 
                          border-radius: 8px; 
                          display: inline-block;
                          font-weight: bold;">
                  Verify Email Address
                </a>
              </div>
              <p style="color: #666; font-size: 14px;">Or copy and paste this link into your browser:</p>
              <p style="color: #6366f1; font-size: 12px; word-break: break-all;">{verification_link}</p>
              <p style="color: #666; font-size: 14px; margin-top: 30px;">This link will expire in 24 hours.</p>
              <p style="color: #999; font-size: 12px; margin-top: 30px;">If you didn't create this account, please ignore this email.</p>
            </div>
          </body>
        </html>
        """
        
        msg.attach(MIMEText(body, 'html'))
        
        # Send email with detailed error handling
        try:
            logger.info(f"Connecting to SMTP server {smtp_server}:{smtp_port}...")
            server = smtplib.SMTP(smtp_server, smtp_port, timeout=10)
            
            logger.info("Starting TLS...")
            server.starttls()
            
            logger.info(f"Logging in as {smtp_username}...")
            server.login(smtp_username, smtp_password)
            
            logger.info(f"Sending email to {email}...")
            server.send_message(msg)
            server.quit()
            
            logger.info(f"✅ Verification email sent successfully to {email}")
            return True, None
            
        except smtplib.SMTPAuthenticationError as e:
            error_msg = f"SMTP authentication failed. Please check your SMTP_USERNAME and SMTP_PASSWORD. Error: {str(e)}"
            logger.error(error_msg)
            return False, error_msg
        except smtplib.SMTPConnectError as e:
            error_msg = f"Failed to connect to SMTP server {smtp_server}:{smtp_port}. Error: {str(e)}"
            logger.error(error_msg)
            return False, error_msg
        except smtplib.SMTPException as e:
            error_msg = f"SMTP error occurred: {str(e)}"
            logger.error(error_msg)
            return False, error_msg
        except Exception as e:
            error_msg = f"Unexpected error sending email: {str(e)}"
            logger.error(error_msg, exc_info=True)
            return False, error_msg
            
    except Exception as e:
        error_msg = f"Failed to prepare email: {str(e)}"
        logger.error(error_msg, exc_info=True)
        return False, error_msg


def send_password_reset_email(email, token, username):
    """
    Send password reset link to user
    Returns: (success: bool, error_message: str)
    """
    try:
        # Check SMTP configuration first
        is_configured, config_error = check_smtp_config()
        if not is_configured:
            logger.error(f"SMTP configuration error: {config_error}")
            return False, config_error
        
        # Get email configuration from environment variables
        smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com")
        smtp_port = int(os.getenv("SMTP_PORT", "587"))
        smtp_username = os.getenv("SMTP_USERNAME")
        smtp_password = os.getenv("SMTP_PASSWORD")
        frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
        
        logger.info(f"Attempting to send password reset email to: {email}")
        
        # Create reset link
        reset_link = f"{frontend_url}/reset-password?token={token}"
        
        # Create message
        msg = MIMEMultipart()
        msg['From'] = smtp_username
        msg['To'] = email
        msg['Subject'] = "Reset Your Password - AI Presentation Coach"
        
        # Email body
        body = f"""
        <html>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #6366f1;">Password Reset Request</h2>
              <p>Hello {username},</p>
              <p>We received a request to reset your password. Click the button below to create a new password:</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="{reset_link}" 
                   style="background: linear-gradient(to right, #6366f1, #8b5cf6); 
                          color: white; 
                          padding: 12px 30px; 
                          text-decoration: none; 
                          border-radius: 8px; 
                          display: inline-block;
                          font-weight: bold;">
                  Reset Password
                </a>
              </div>
              <p style="color: #666; font-size: 14px;">Or copy and paste this link into your browser:</p>
              <p style="color: #6366f1; font-size: 12px; word-break: break-all;">{reset_link}</p>
              <p style="color: #666; font-size: 14px; margin-top: 30px;">This link will expire in 1 hour.</p>
              <p style="color: #999; font-size: 12px; margin-top: 30px;">If you didn't request a password reset, please ignore this email. Your password will remain unchanged.</p>
            </div>
          </body>
        </html>
        """
        
        msg.attach(MIMEText(body, 'html'))
        
        # Send email with detailed error handling
        try:
            logger.info(f"Connecting to SMTP server {smtp_server}:{smtp_port}...")
            server = smtplib.SMTP(smtp_server, smtp_port, timeout=10)
            
            logger.info("Starting TLS...")
            server.starttls()
            
            logger.info(f"Logging in as {smtp_username}...")
            server.login(smtp_username, smtp_password)
            
            logger.info(f"Sending email to {email}...")
            server.send_message(msg)
            server.quit()
            
            logger.info(f"✅ Password reset email sent successfully to {email}")
            return True, None
            
        except smtplib.SMTPAuthenticationError as e:
            error_msg = f"SMTP authentication failed. Please check your SMTP_USERNAME and SMTP_PASSWORD. Error: {str(e)}"
            logger.error(error_msg)
            return False, error_msg
        except smtplib.SMTPConnectError as e:
            error_msg = f"Failed to connect to SMTP server {smtp_server}:{smtp_port}. Error: {str(e)}"
            logger.error(error_msg)
            return False, error_msg
        except smtplib.SMTPException as e:
            error_msg = f"SMTP error occurred: {str(e)}"
            logger.error(error_msg)
            return False, error_msg
        except Exception as e:
            error_msg = f"Unexpected error sending email: {str(e)}"
            logger.error(error_msg, exc_info=True)
            return False, error_msg
            
    except Exception as e:
        error_msg = f"Failed to prepare email: {str(e)}"
        logger.error(error_msg, exc_info=True)
        return False, error_msg

