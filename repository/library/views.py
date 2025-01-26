from django.shortcuts import render,HttpResponse,redirect
from django.contrib.auth import authenticate,login
from django.contrib.auth.models import User
from django.middleware.csrf import get_token
from django.http import JsonResponse
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from django.views.decorators.csrf import csrf_protect
from . serializers import LoginSerializer,LibraryUserSerializer

# Create your views here.
def index(request):
    return Response("this is an api view")

class LoginView(APIView):
    def get(self, request):
        # Get CSRF token and set it in the response
        csrf_token = get_token(request)
        response = JsonResponse({'csrf_token': csrf_token})
        return response

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        
        if not username or not password:
            return Response({'error': 'Username and password are required.'}, status=status.HTTP_400_BAD_REQUEST)

        # Authenticate the user using Django's authenticate method
        user = authenticate(request, username=username, password=password)
        
        if user is not None:
            # Authentication successful, you can log the user in
            login(request, user)  # This is optional if you want to keep the session active
            return Response({"message": "Login successful!"}, status=status.HTTP_200_OK)
        else:
            return Response({"error": "Invalid credentials."}, status=status.HTTP_401_UNAUTHORIZED)
        
class SignupView(APIView):
    def get(self,request):
        csrf_token = get_token(request)
        response = JsonResponse({'csrf_token': csrf_token})
        return response
    
    def post(self, request):
        serializer = LibraryUserSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({'message': 'User created successfully', 'user': serializer.data}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
