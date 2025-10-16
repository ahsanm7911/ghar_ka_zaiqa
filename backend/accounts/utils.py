from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.core.mail import send_mail
from django.urls import reverse
from django.conf import settings

def send_activation_email(user):
    token = default_token_generator.make_token(user)
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    activation_link = f"http://localhost:8000/accounts/activate/{uid}/{token}/"
    send_mail(
        'Activate your account', 
        f"Click the link to verify your account: {activation_link}",
        settings.EMAIL_HOST_USER,
        [user.email], 
        fail_silently=False
    )