from django.contrib.auth import authenticate,login, logout
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.tokens import RefreshToken
from django.db.models import Count
from django.middleware.csrf import get_token
from django.http import JsonResponse
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from .serializers import LoginSerializer,LibraryUserSerializer
from .models import LibraryUser
import os
from rest_framework.permissions import IsAuthenticated
from .databases.service import mongo_DB
from functools import wraps

MONGO_USERNAME=os.getenv("MONGO_USERNAME")
MONGO_PASSWORD=os.getenv("MONGO_PASSWORD")

def is_admin(func):
    @wraps(func)
    def _wraped_view(request,*args,**kwargs):
        if request.user.is_admin:
            return func(request,*args,**kwargs)
        else:
            return Response({"error":"You are not authenticated for this api"})

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
            refresh = RefreshToken.for_user(user)
            return Response({
                'token': str(refresh.access_token),
            }, status=status.HTTP_200_OK)
        else:
            return Response({"message": "Invalid credentials."}, status=status.HTTP_401_UNAUTHORIZED)
        
class SignupView(APIView):
    def get(self,request):
        csrf_token = get_token(request)
        response = JsonResponse({'csrf_token': csrf_token})
        return response
    
    def post(self, request):
        serializer = LibraryUserSerializer(data=request.data)
        
        if serializer.is_valid():
            print(serializer.validated_data)
            print(serializer.validated_data['username'],serializer.validated_data['email'])
            existing_user=LibraryUser.objects.filter(username=serializer.validated_data['username'],email=serializer.validated_data['email']).first()
            if not existing_user:
                user = serializer.save()
                return Response({'message': 'User created successfully'}, status=status.HTTP_201_CREATED)
            else:
                Response({'message': 'User already registered'}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class SearchView(APIView):
    def get(self,request):
        querry=request.data.get("querry")
        mongo_client=mongo_DB(MONGO_USERNAME, MONGO_PASSWORD,"localhost",271017, "library","documents")
        result=mongo_client.get_document({"title":querry})
        if result:
            return Response({'message':"success","details":result})
        else:
            return Response({'message':'error'})


class adminuserView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self,request,start_c=0,end_c=50):
        users=LibraryUser.objects.filter(is_admin=False).values('email','id','username','phone_number','is_faculty')[start_c:end_c]
        user_count=LibraryUser.objects.filter(is_admin=False).aggregate(Count("id"))
        print(users)
        print(user_count)
        return Response({"meggase":"success","users":list(users),"user_count":user_count['id__count']})


