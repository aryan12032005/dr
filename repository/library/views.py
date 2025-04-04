from django.contrib.auth import authenticate,login, logout
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.tokens import RefreshToken,AccessToken
from rest_framework_simplejwt.token_blacklist.models import BlacklistedToken
from django.db.models import Count
from django.middleware.csrf import get_token
from django.http import JsonResponse
from rest_framework.response import Response
from django.http import FileResponse
from rest_framework.views import APIView
from rest_framework import status
from rest_framework.decorators import action
from .serializers import LoginSerializer,LibraryUserSerializer
from .forms import DepartmentsForm
from .models import LibraryUser, Departments
import os
from rest_framework.permissions import IsAuthenticated
from .databases.service import mongo_DB,fsHandler
from django.db.models import Q
from .permissions import *
from datetime import datetime
from dotenv import load_dotenv
import pandas as pd
from io import StringIO


load_dotenv()
MONGO_USERNAME=os.getenv("MONGO_USERNAME")
MONGO_PASSWORD=os.getenv("MONGO_PASSWORD")
FS_DIR="/".join(os.getcwd().split('/')[:-1])+'/FILES'
fs_handler_usual = fsHandler(FS_DIR)
mongo_client_usual=mongo_DB(MONGO_USERNAME,MONGO_PASSWORD)

# Create your views here.
def index(request):
    return Response("this is an api view")

class logout_user(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    
    def get(self,request):
        logout(request)
        return Response({'message':'logout successfull'},status=status.HTTP_200_OK)


class refresh_token(APIView):
    def post(self,request):
        refreshToken=request.data.get('refresh_token')
        if not refreshToken:
            return Response({'message':'no refresh token found'},status=status.HTTP_400_BAD_REQUEST)
        else: 
            try:
                old_refresh=RefreshToken(refreshToken)
                refresh=RefreshToken.for_user(LibraryUser.objects.filter(id=old_refresh.payload.get('user_id')).first())
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

class total_details(APIView):
    authentication_classes=[JWTAuthentication]

    def get_permissions(self):
        if self.request.method=='GET':
            return [IsAdmin(),IsActive()]
        
        return super().get_permissions()
    
    def get(self,request):
        total_users=LibraryUser.objects.count()
        total_docs=mongo_client_usual.get_count()
        return Response({'total_users':total_users,'total_docs':total_docs},status=status.HTTP_200_OK)
        
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
            access_token=request.headers.get('Authorization')
            if not access_token:
                return Response({'message':'No token found'},status=status.HTTP_400_BAD_REQUEST)
            access_token=access_token.split(' ')[1]
            try:
                AccessToken(access_token)
                return Response({
                    'is_admin':user.is_admin,
                    'is_faculty':user.is_faculty,
                },status=status.HTTP_200_OK)
            except:
                return Response({'message':'token expired'},status=status.HTTP_401_UNAUTHORIZED)
        
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
            existing_user=LibraryUser.objects.filter(username=serializer.validated_data['username'],email=serializer.validated_data['email']).first()
            if not existing_user:
                user = serializer.save()
                return Response({'message': 'User created successfully'}, status=status.HTTP_201_CREATED)
            else:
                Response({'message': 'User already registered'}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class uploadCsv(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated,IsAdmin]

    def get(self, request):
        file_path = "/library/databases/sample_template.csv"
        file_path=os.getcwd()+file_path
        if os.path.exists(file_path):
            file = open(file_path, 'rb')  
            response = FileResponse(file, content_type='application/csv')
            response['Content-Disposition'] = f'attachment; filename="{os.path.basename(file_path)}"'
            response.status_code = status.HTTP_200_OK
            return response
        else:
            return Response({"message": "File not found."}, status=status.HTTP_404_NOT_FOUND)
        
    def post(self,request):
        try:
            csv_file=request.FILES.getlist('csvFile')[0]
            file_content = csv_file.read().decode("utf-8")
            file_content=StringIO(file_content)
            df=pd.read_csv(file_content,header=0)
            if request.data.get('is_faculty')==True:
                df['is_faculty']=True
            else:
                df["is_faculty"]=False
            df["is_allowed"]=True
            df["is_admin"]=False
            new_user={}
            existing_users=[]
            for i in df.values:
                for c,j in enumerate(df.columns):
                    new_user[j]=i[c]
                new_user=LibraryUserSerializer(data=new_user)
                if new_user.is_valid():
                    existing_user=LibraryUser.objects.filter(username=new_user.validated_data['username'],email=new_user.validated_data['email']).first()
                    if not existing_user:
                        user = new_user.save()
                        print(f"added user {user.username}")
                    else:
                        existing_users.append(str(new_user.validated_data['username'].value))
                else:
                    existing_users.append(str(new_user['username'].value))
                new_user={}
            print(existing_users)
            if len(existing_users)>0:
                return Response({"message":"Existing or Invalid users","users":existing_users},status=status.HTTP_409_CONFLICT)
            return Response({"message":"Users created Successfully"},status=status.HTTP_200_OK)
        
        except Exception as e:
            print(e)
            return Response({"message":"failed to add users"},status=status.HTTP_400_BAD_REQUEST)

class SearchView(APIView):
    def get(self,request):
        querry=request.query_params.get('querry')
        mongo_client=mongo_DB(username=MONGO_USERNAME,password=MONGO_PASSWORD)
        result=mongo_client.search_document(str(querry))
        if len(result) > 0:
            documents = [
                {
                    'id': str(doc['_id']),
                    'title': doc.get('title', ''),
                    'docType': doc.get('docType', ''),
                    'date': datetime.strptime(doc.get('createDate', 0),'%Y-%m-%d %H:%M:%S.%f').date()
                }
                for doc in result
            ]
            return Response({"documents":documents},status=status.HTTP_200_OK)
        return Response({"message":"no document found"},status=status.HTTP_404_NOT_FOUND)

class getDocDetails(APIView):
    authentication_classes=[JWTAuthentication]
    permission_classes=[IsAuthenticated,IsActive]
    
    def get(self, request):
        doc_id = request.query_params.get('doc_id')
        result = mongo_client_usual.get_doc_by_id(str(doc_id))
        if result:
            document={
                'id': str(result['_id']),
                'title': result.get('title', ''),
                'docType': result.get('docType', ''),
                'comments':result.get('comments',[]),
                'category':result.get('category',''),
                'department':result.get('department',''),
                'subject':result.get('subject',''),
                'createDate': datetime.strptime(result.get('createDate', 0),'%Y-%m-%d %H:%M:%S.%f').date(),
                'coverType':result.get('coverType',''),
                'isPublic':result.get('isPublic')
            }
            if result['docType']=='link':
                document['documentLink']= result.get('documentLink','')
            else:
                coverFile= fs_handler_usual.getCover(result['category'],str(result['_id']))
                document['cover']= coverFile
            return Response({"document": document},status=status.HTTP_200_OK)
        else:
            return Response({"message": "error fetching document"},status=status.HTTP_400_BAD_REQUEST)
    
class GetFacultyDoc(APIView):
    authentication_classes=[JWTAuthentication]
    permission_classes=[IsAdmin_or_Faculty]

    def get(self,request):
        fac_id=request.query_params.get('fac_id')
        mongo_client=mongo_DB(username=MONGO_USERNAME,password=MONGO_PASSWORD)
        result= mongo_client.get_faculty_doc(fac_id)
        if len(result) > 0:
            documents = [
                {
                    'id': str(doc['_id']),
                    'title': doc.get('title', ''),
                    'docType': doc.get('docType', ''),
                    'comments':doc.get('comments',[]),
                    'category':doc.get('category',''),
                    'department':doc.get('department',''),
                    'subject':doc.get('subject',''),
                    'createDate': datetime.strptime(doc.get('createDate', 0),'%Y-%m-%d %H:%M:%S.%f').date()
                }
                for doc in result
            ]
            return Response({"documents":documents},status=status.HTTP_200_OK)
        else:
            return Response({"message":"no documents found"},status=status.HTTP_404_NOT_FOUND)

class downloadDoc(APIView):
    authentication_classes=[JWTAuthentication]
    
    def get_permissions(self):
        if self.request.method=="GET":
            return [IsActive(),IsAuthenticated()]
        if self.request.method == "DELETE":
            return [IsActive(),IsAdmin_or_Faculty()]
        return super().get_permissions()

    def get(self,request):
        user=request.user
        doc_id=request.query_params.get('doc_id',None)
        try:
            if doc_id:
                mongo_client=mongo_DB(username=MONGO_USERNAME,password=MONGO_PASSWORD)
                document=mongo_client.get_doc_by_id(doc_id)
                if not document:
                    raise "no document"
                if document['docType'] == "link":
                    doc_link= document['documentLink']
                    return Response({"message":f"Doc link : {doc_link}","link":True},status=status.HTTP_200_OK)
                
                if document['isPublic']=="true" or user.is_admin==True:
                    fshandler=fsHandler(FS_DIR)
                    zip_file, zip_status = fshandler.getZip(document['category'],str(doc_id))
                    if zip_status:
                        title = document['title']
                        response = FileResponse(zip_file, content_type='application/zip')
                        response['Content-Disposition'] = f'attachment; filename="{title}.zip"'
                        response.status_code = status.HTTP_200_OK
                        return response
                    else:
                        return Response({"message":"Error downlaoding file"},status= status.HTTP_400_BAD_REQUEST)
                else:
                    return Response({"message":"Document is private"},status= status.HTTP_400_BAD_REQUEST)
                    
        except Exception as e:
            print(e)
            return Response({'message':"error downloading document"},status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self,request):
        user = request.user
        doc_id= request.query_params.get('doc_id',None)
        if doc_id:
            mongo_client=mongo_DB(username=MONGO_USERNAME,password=MONGO_PASSWORD)
            document = mongo_client.get_doc_by_id(str(doc_id))
            if not document:
                return Response({'message':"no doument to delete"},status=status.HTTP_400_BAD_REQUEST)
            if document['owner']== user.id or user.is_admin == True:
                delete_status= mongo_client.delete_doc(str(doc_id))
                if delete_status:
                    return Response({"message":"Document deleted Successfull"}, status= status.HTTP_200_OK)
                else:
                    return Response({"message":"Error deleteing document"},status=status.HTTP_400_BAD_REQUEST)
            else:
                return Response({"message":"Unauthorized access"},status=status.HTTP_401_UNAUTHORIZED)
        else:
            return Response({'message':"no doument to delete"},status=status.HTTP_400_BAD_REQUEST)


class adminuserView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated,IsAdmin,IsActive]

    def get(self,request):
        querry=request.query_params.get('querry',None)
        extra_params={}
        is_admin=request.query_params.get('is_admin',None)
        if is_admin:
            extra_params["is_admin"]=is_admin
        is_faculty=request.query_params.get('is_faculty',None)
        if is_faculty:
            extra_params["is_faculty"]=is_faculty
        is_allowed=request.query_params.get('is_allowed',None)
        if is_allowed:
            extra_params["is_allowed"]=is_allowed
        dep_code=request.query_params.get('dep_code',None)
        if dep_code:
            extra_params['dep_code']=dep_code

        if querry:
            querry=querry.strip()
            users=LibraryUser.objects.filter(
                Q(username__icontains=querry) |
                Q(email__icontains=querry) |
                Q(id__icontains=querry) |
                Q(phone_number__icontains=querry),**extra_params
            ).values('email','dep_code','id','first_name','username','phone_number','is_faculty')[int(request.query_params.get('start_c')):int(request.query_params.get('end_c'))]
            user_count=LibraryUser.objects.filter(is_admin=False).aggregate(Count("id"))
            return Response({"users":list(users),"user_count":user_count['id__count']},status=status.HTTP_200_OK)
        users=LibraryUser.objects.filter(**extra_params).values('email','dep_code','id','first_name','username','phone_number','is_allowed')[int(request.query_params.get('start_c')):int(request.query_params.get('end_c'))]
        user_count=LibraryUser.objects.filter(is_admin=False).aggregate(Count("id"))
        return Response({"users":list(users),"user_count":user_count['id__count']},status=status.HTTP_200_OK)
    
    def post(self,request):
        data=request.data
        edit_user=LibraryUser.objects.filter(id=data['id']).first()
        if(edit_user):
            try:
                for key,value in data.items():
                    if key != 'id':
                        setattr(edit_user,key,value)
                edit_user.save()
                return Response({},status=status.HTTP_200_OK)
            except Exception as e:
                return Response({'message':'Error updating user'},status=status.HTTP_400_BAD_REQUEST)
            

    def delete(self,request):
        data=request.data
        user=LibraryUser.objects.filter(username=data.get('username')).first()
        if user:
            user.delete()
            return Response({'message':'User deleted'},status=status.HTTP_200_OK)
        else:
            return Response({'message':'User does not exist'},status=status.HTTP_400_BAD_REQUEST)

class deprtment_view(APIView):
    authentication_classes=[JWTAuthentication]
    permission_classes=[IsAuthenticated]
    
    def get_permissions(self):
        if self.request.method=='POST':
            return [IsAdmin(),IsActive()]
        
        if self.request.method=='GET':
            return [IsActive(),IsAdmin_or_Faculty()]
        
        return super().get_permissions()

    def get(self,request):
        dep_code=request.query_params.get('dep_code',None)
        if dep_code:
            dep_details=Departments.objects.filter(dep_code=dep_code).first()
            responseObj= {"managers":dep_details.managers,"subjects":dep_details.subjects}
        else:
            dep_details=Departments.objects.all().values("dep_name","dep_code")
            responseObj= {"departments":dep_details}
        if dep_details:
            return Response(responseObj,status=status.HTTP_200_OK)
        else:
            return Response({"message":"No dep details found"}, status=status.HTTP_404_NOT_FOUND)
        
    def post(self, request):
        data=request.data
        dep_form=DepartmentsForm(data)
        existing_dep= Departments.objects.filter(dep_code=data.get("dep_code")).first()
        if existing_dep:
            return Response({"message":"Department code already exist"},status=status.HTTP_409_CONFLICT)
        
        if dep_form.is_valid():
            dep_form.save()
            return Response({"message":"Department created successfull"},status=status.HTTP_200_OK)
        else:
            return Response({"message":"Error creating department"},status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self,request):
        pass


class upload_document(APIView):
    authentication_classes=[JWTAuthentication]
    permission_classes=[IsAuthenticated,IsAdmin_or_Faculty,IsActive]

    def post(self,request):
        user=request.user
        data=request.POST
        files=request.FILES
        mongo_client=mongo_DB(username=MONGO_USERNAME,password=MONGO_PASSWORD)

        userData={
            'title':data.get('title'),
            'docType':data.get('documentType'),
            'coverType':data.get('coverType'),
            'isPublic':data.get('isPublic'),
            'owner':user.id,
            'comments':[],
            'createDate':str(datetime.now()),
            'category':data.get('category'),
            'department':data.get("department"),
            "subject":data.get("subject")
        }
        
        if(data.get('coverType')=='link'):
            userData['coverLink']=data.get('coverLink')
        if(data.get('documentType')=='link'):
            userData['documentLink']=data.get('documentLink')

        insert_id=mongo_client.insert(userData)
        fshandler=fsHandler(FS_DIR)

        if(data.get('coverType')!='link'):
            cover_file_names= [i.name for i in files.getlist('cover')]
            fshandler.create_file(data.get('category')+'/cover',insert_id,cover_file_names,files.getlist('cover'))

        if(data.get('documentType')!='link'):
            document_file_names= [i.name for i in files.getlist('documents')]
            fshandler.create_file(data.get('category')+'/documents',insert_id,document_file_names,files.getlist('documents'))

        return Response({'message':'docs uploaded'},status=status.HTTP_200_OK)
    