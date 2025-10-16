from django.core.management.base import BaseCommand
from django.core.mail import send_mail
from django.conf import settings

class Command(BaseCommand):
    help = 'A custom command to test practice code'

    def handle(self, *args, **kwargs):
        print('Initiating practice file...')
        print('Testing email')
        subject = 'Test email from django'
        message = 'This is a test email sent using Django and Gmail'
        from_email = settings.DEFAULT_FROM_EMAIL
        recipient_list = ['adamscore66@gmail.com']

        try:
            send_mail(
                subject=subject,
                message=message, 
                from_email=from_email,
                recipient_list=recipient_list, 
                fail_silently=False
            )
            print('Email sent successfully!')
        except Exception as e:
            print(f"Error sending email: {e}")

