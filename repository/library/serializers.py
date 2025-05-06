from rest_framework import serializers
from .models import LibraryUser
from django.contrib.auth import authenticate

class LibraryUserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = LibraryUser
        fields = ['id', 'email', 'username', 'first_name', 'last_name', 'phone_number', 'is_faculty', 'is_admin', 'is_allowed', 'password', 'dep_code']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = LibraryUser.objects.create_user(
            email=validated_data['email'],
            username=validated_data['username'],
            password=validated_data['password'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            phone_number=validated_data['phone_number'],
            is_faculty=validated_data['is_faculty'],
            is_admin=validated_data['is_admin'],
            is_allowed=validated_data['is_allowed'],
            dep_code= validated_data['dep_code']
        )
        return user


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        username = data.get('username')
        password = data.get('password')
        user = authenticate(username=username, password=password)

        if not user:
            raise serializers.ValidationError("Invalid credentials")
        return user
