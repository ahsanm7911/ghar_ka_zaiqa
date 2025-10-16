# accounts/urls.py
from django.urls import path
from .views import register_view, login_view, logout_view, activate_account

urlpatterns = [
    path('signup/', register_view, name='signup'),
    path('login/', login_view, name='login'),
    path('logout/', logout_view, name='logout'),
    path('activate/<uidb64>/<token>/', activate_account)
]