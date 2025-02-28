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
from .databases.service import mongo_DB,fsHandler
from django.db.models import Q
import json
from .permissions import *
from datetime import datetime

MONGO_USERNAME=os.getenv("MONGO_USERNAME")
MONGO_PASSWORD=os.getenv("MONGO_PASSWORD")
FS_DIR=os.getcwd().strip('/')[:-2].join('/')+'/FILES'

# Create your views here.
def index(request):
    return Response("this is an api view")

class logout_user(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    
    def get(self,request):
        try:
            logout(request.user)
            return Response({'message':'logout successfull'},status=status.HTTP_200_OK)
        except:
            return Response({'message':'error logout'},status=status.HTTP_400_BAD_REQUEST)


class refresh_token(APIView):
    def post(self,request):
        refreshToken=request.data.get('refresh_token')
        if not refresh_token:
            return Response({'message':'no refresh token found'},status=status.HTTP_400_BAD_REQUEST)
        else:
            try:
                refresh=RefreshToken(refreshToken)
                if refresh.blacklisted:
                    return Response({"message": "Refresh token is blacklisted"}, status=status.HTTP_400_BAD_REQUEST)
                else:
                    return Response({
                        'refresh_token':str(refresh),
                        'access_token': str(refresh.access_token),
                    }, status=status.HTTP_200_OK)
            except Exception as e:
                return Response({'message':str(e)},status=status.HTTP_400_BAD_REQUEST)
            
def get_csrf_token(request):
    csrf_token = get_token(request)
    response = JsonResponse({'csrf_token': csrf_token})
    return response

class user_type(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    
    def get_permissions(self):
        if self.request.method=='POST':
            return [IsAdmin(),IsActive()]
        
        if self.request.method=='GET':
            return [IsActive()]
        
        return super().get_permissions()

    def get(self,request):
        user=request.user
        if not user.is_allowed:
            return Response({'message':'User banned'},status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response({
                'is_admin':user.is_admin,
                'is_faculty':user.is_faculty,
            },status=status.HTTP_200_OK)
        
    def post(self,request):
        new_details=request.data.get('new_details')
        try:
            user=LibraryUser.objects.filter(id=new_details['id']).first()
            if not user:
                return Response({'message':'user does not exist'},status=status.HTTP_400_BAD_REQUEST)
            user.is_admin=new_details['is_admin']
            user.is_faculty=new_details['is_faculty']
            user.is_allowed=new_details['is_allowed']
            user.save()
            return Response({'message':'user details changed'},status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'message':'Something went wrong :('},status=status.HTTP_400_BAD_REQUEST)
        

class LoginView(APIView):
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        
        if not username or not password:
            return Response({'error': 'Username and password are required.'}, status=status.HTTP_400_BAD_REQUEST)

        # Authenticate the user using Django's authenticate method
        user = authenticate(request, username=username, password=password)
        
        if user is not None:
            # Authentication successful, you can log the user in
            if not user.is_allowed:
                return Response({'message':'user is not allowed'},status=status.HTTP_401_UNAUTHORIZED)
            login(request, user)  # This is optional if you want to keep the session active
            refresh = RefreshToken.for_user(user)
            return Response({
                'refresh_token':str(refresh),
                'access_token': str(refresh.access_token),
            }, status=status.HTTP_200_OK)
        else:
            return Response({"message": "Invalid credentials."}, status=status.HTTP_401_UNAUTHORIZED)
        
class SignupView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated,IsAdmin]
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
            return Response({"details":result},status=status.HTTP_200_OK)
        else:
            return Response({'message':'error'},status=status.HTTP_400_BAD_REQUEST)


class adminuserView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated,IsAdmin]

    def get(self,request):
        querry=request.query_params.get('querry',None)
        if querry:
            print(querry)
            querry=querry.strip()
            users=LibraryUser.objects.filter(
                Q(username__icontains=querry) |
                Q(email__icontains=querry) |
                Q(id__icontains=querry) |
                Q(phone_number__icontains=querry),is_admin=False
            ).values('email','id','first_name','username','phone_number','is_faculty')
            return Response({"users":list(users),"user_count":len(users)},status=status.HTTP_200_OK)
        users=LibraryUser.objects.filter(is_admin=False).values('email','id','first_name','username','phone_number','is_faculty')[int(request.query_params.get('start_c')):int(request.query_params.get('end_c'))]
        user_count=LibraryUser.objects.filter(is_admin=False).aggregate(Count("id"))
        return Response({"users":list(users),"user_count":user_count['id__count']},status=status.HTTP_200_OK)

    def delete(self,request):
        data=request.data
        user=LibraryUser.objects.filter(username=data.get('username')).first()
        if user:
            user.delete()
            return Response({'message':'User deleted'},status=status.HTTP_200_OK)
        else:
            return Response({'message':'User does not exist'},status=status.HTTP_400_BAD_REQUEST)
        
class upload_document(APIView):
    authentication_classes=[JWTAuthentication]
    permission_classes=[IsAuthenticated,IsAdmin_or_Faculty]

    def post(self,request):
        user=request.user
        data=request.POST
        files=request.FILES
        mongo_client=mongo_DB(MONGO_USERNAME,MONGO_PASSWORD)
        data={
            'title':data.get('title'),
            'docType':data.get('documentType'),
            'coverTpye':data.get('coverType'),
            'isPublic':data.get('isPublic'),
            'owner':user.id,
            'comments':[],
            'createDate':datetime.strftime(datetime.now()),
            'category':data.get('category'),
        }
        insert_id=mongo_client.insert(data)
        fshandler=fsHandler(FS_DIR+'/cover')
        print(type(files.get('cover')),type(data.get('cover')))
        fshandler.create_file(data.get('category'),insert_id,list(data.get('cover')),list(files.get('cover')))
        print(FS_DIR)
        return Response({'message':'docs uploaded'},status=status.HTTP_200_OK)