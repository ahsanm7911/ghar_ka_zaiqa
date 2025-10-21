# accounts/serializers.py
from rest_framework import serializers
from .models import CustomUser, Customer, Chef
from django.contrib.auth import authenticate
from .utils import send_activation_email

class RegistrationSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    user_type = serializers.ChoiceField(choices=CustomUser.USER_TYPE_CHOICES)
    full_name = serializers.CharField()  # Common for both
    # Customer-specific
    address = serializers.CharField(required=False, allow_blank=True)
    phone_number = serializers.CharField(required=False, allow_blank=True)
    dietary_preferences = serializers.CharField(required=False, allow_blank=True)
    # Chef-specific
    bio = serializers.CharField(required=False, allow_blank=True)
    specialty = serializers.CharField(required=False, allow_blank=True)
    years_of_experience = serializers.IntegerField(required=False, default=0)
    certification = serializers.CharField(required=False, allow_blank=True)

    def validate(self, data):
        user_type = data.get('user_type')
        if user_type == 'customer':
            if not data.get('full_name'):
                raise serializers.ValidationError("Full name is required for customers.")
        elif user_type == 'chef':
            if not data.get('full_name'):
                raise serializers.ValidationError("Full name is required for chefs.")
        else:
            raise serializers.ValidationError("Invalid user type.")
        return data

    def create(self, validated_data):
        user_type = validated_data.pop('user_type')
        password = validated_data.pop('password')
        full_name = validated_data.pop('full_name')

        user = CustomUser.objects.create_user(
            email=validated_data.pop('email'),
            password=password,
            user_type=user_type
        )

        if user_type == 'customer':
            Customer.objects.create(
                user=user,
                full_name=full_name,
                address=validated_data.get('address'),
                phone_number=validated_data.get('phone_number'),
                dietary_preferences=validated_data.get('dietary_preferences')
            )
        elif user_type == 'chef':
            Chef.objects.create(
                user=user,
                full_name=full_name,
                bio=validated_data.get('bio'),
                specialty=validated_data.get('specialty'),
                years_of_experience=validated_data.get('years_of_experience', 0),
                certification=validated_data.get('certification')
            )
        user.is_active = False
        user.save()
        try:
            send_activation_email(user)
            print(f'Activation email sent to {user.email}')
        except Exception as e:
            print(f'Failed to send activation email: {e}')
        return user

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()

    def validate(self, data):
        email = data.get('email')
        password = data.get('password')

        if email and password:
            user = authenticate(email=email, password=password)

            if user is None:
                try:
                    existing_user = CustomUser.objects.get(email=email)
                    if not existing_user.is_active:
                        raise serializers.ValidationError({'detail': "account not activated or disabled."})
                except CustomUser.DoesNotExist:
                    pass
                raise serializers.ValidationError({'detail': "Invalid email or password."})
        else:
            raise serializers.ValidationError({'detail': "Both email and password are required."})
        
        data['user'] = user
        return data