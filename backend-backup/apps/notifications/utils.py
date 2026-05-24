from django.core.mail import send_mail
from django.conf import settings

def send_notification_email(user, title, message):
    if not user.email:
        return False
    try:
        send_mail(
            subject=f"Transfinity — {title}",
            message=f"Hi {user.name or 'User'},\n\n{message}\n\n— Team Transfinity",
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=False,
        )
        return True
    except Exception as e:
        print(f"❌ Email Error: {e}")
        return False