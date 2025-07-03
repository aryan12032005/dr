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
from .forms import DepartmentsForm, UserQueryForm, RequestedDocForm
from .models import LibraryUser, Departments, FacultyDocumentRequests
import os
from rest_framework.permissions import IsAuthenticated, AllowAny
from .databases.service import mongo_DB,fsHandler
from django.db.models import Q
from .permissions import *
from datetime import datetime
from dotenv import load_dotenv
import pandas as pd
from io import StringIO
import json
import difflib

load_dotenv()
MONGO_USERNAME=os.getenv("MONGO_USERNAME")
MONGO_PASSWORD=os.getenv("MONGO_PASSWORD")
FS_DIR="/".join(os.getcwd().split('/')[:-1])+'/FILES'
fs_handler_usual = fsHandler(FS_DIR)
mongo_client_usual=mongo_DB(MONGO_USERNAME,MONGO_PASSWORD)

# Create your views here.
def index(request):
    return Response("Umm, well you know me:) feed me...")

class logout_user(APIView):
    """ Log out a user using refresh token """
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    
    def post(self,request):
        """
        Post request to logout a user 

        Args:
            request['refresh_token'] (str): Refresh token of user to be loged out.

        Returns:
            message (str): Respone of logout.
        """
        try:
            refresh_token = request.data['refresh_token']
            token = RefreshToken(refresh_token)
            logout(request)
            token.blacklist()
        except Exception as e:
            print(e)
            return Response({"message":"invalid request"}, status= status.HTTP_400_BAD_REQUEST)
        return Response({'message':'logout successfull'},status=status.HTTP_200_OK)


class refresh_token(APIView):
    """ Refresh an access token provided by user """
    def post(self,request):
        """
        Refresh a token for users.

        Args:
            request.data['refresh_token'] (str): Refresh Token of user.

        Returns:
            refresh_token (str): New Refresh Token for user.
            access_token (str): New Access token for user.
            message (str); Error message in case of something wrong.
        """
        refreshToken=request.data.get('refresh_token')
        if not refreshToken:
            return Response({'message':'no refresh token found'},status=status.HTTP_400_BAD_REQUEST)
        else: 
            try:
                old_refresh=RefreshToken(refreshToken)
                refresh=RefreshToken.for_user(LibraryUser.objects.filter(id=old_refresh.payload.get('user_id')).first())
                old_refresh.blacklist()
                return Response({
                    'refresh_token':str(refresh),
                    'access_token': str(refresh.access_token),
                }, status=status.HTTP_200_OK)
            except Exception as e:
                return Response({'message':str(e)},status=status.HTTP_400_BAD_REQUEST)
            
def get_csrf_token(request):
    """
    Provide a csrf_token for POST requests

    Args:
        request (obj): User request.
    
    Returns:
        csrf_token (str): csrf_token for POST requests.
    """
    csrf_token = get_token(request)
    response = JsonResponse({'csrf_token': csrf_token})
    return response

class total_details(APIView):
    """ Top level key details about the data """
    authentication_classes=[JWTAuthentication]

    def get_permissions(self):
        """ Permissions """
        if self.request.method=='GET':
            return [IsAdmin(),IsActive(),IsAuthenticated()]
        
        return super().get_permissions()
    
    def get(self,request):
        """
        Returns count of users and total documents

        Args:

        Returns:
            total_users (int): Total users in the system.
            total_docs (int): Total number of documents in system.
        """
        total_users=LibraryUser.objects.count()
        total_docs=mongo_client_usual.get_count()
        return Response({'total_users':total_users,'total_docs':total_docs},status=status.HTTP_200_OK)
    
class QueryView(APIView):
    authentication_classes=[JWTAuthentication]

    def get_permissions(self):
        if self.request.method == "GET":
            return [IsActive(), IsAuthenticated(), IsAdmin()]
        if self.request.method == "POST":
            return []
        if self.request.method == "DELETE":
            return [IsActive(), IsAuthenticated(), IsAdmin()]
    
    def post(self,request):
        data= request.POST
        queryForm = UserQueryForm(data)
        if queryForm.is_valid():
            queryForm.save()
            return Response({'message':'Querry submitted'}, status = status.HTTP_200_OK)
        else:
            return Response({'message': 'error submit Querry'},status=status.HTTP_400_BAD_REQUEST)
        
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
                    'user_id':user.id
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
            dep_code = request.data.get('dep_code')
            if dep_code:
                df['dep_code'] = dep_code
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
                    else:
                        existing_users.append(str(new_user.validated_data['username'].value))
                else:
                    existing_users.append(str(new_user['username'].value))
                new_user={}
            if len(existing_users)>0:
                return Response({"message":"Existing or Invalid users","users":existing_users},status=status.HTTP_409_CONFLICT)
            return Response({"message":"Users created Successfully"},status=status.HTTP_200_OK)
        
        except Exception as e:
            return Response({"message":"failed to add users"},status=status.HTTP_400_BAD_REQUEST)

class SearchView(APIView):
    def get(self,request):
        querry=request.query_params.get('querry')
        extra_params={}
        docType = request.query_params.get('docType',None) 
        if docType:
            extra_params['docType']=docType
        dep_code = request.query_params.get('department',None)
        if dep_code:
            extra_params['department']=dep_code
        order = request.query_params.get('order',0)

        mongo_client=mongo_DB(username=MONGO_USERNAME,password=MONGO_PASSWORD)

        result=mongo_client.search_document(str(querry), extra_params=extra_params, dateOrder= int(order))
        if len(result) > 0:
            documents = []
            for doc in result:
                documents.append({
                    'id': str(doc['_id']),
                    'title': doc.get('title', ''),
                    'docType': doc.get('docType', ''),
                    'owner': doc.get('owner',''),
                    'date': datetime.strptime(doc.get('createDate', 0),'%Y-%m-%d %H:%M:%S.%f').date()
                })
            return Response({"documents":documents},status=status.HTTP_200_OK)
        return Response({"message":"no document found"},status=status.HTTP_404_NOT_FOUND)


class getDocDetails(APIView):
    authentication_classes=[JWTAuthentication]  

    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        if self.request.method =='POST':
            return [IsAdmin_or_Faculty(),IsAuthenticated(), IsActive()]
        return super().get_permissions()
    
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
                'authors':result.get('authors'),
                'hsnNumber':result.get('hsnNumber'),
                'subject':result.get('subject',''),
                'createDate': datetime.strptime(result.get('createDate', 0),'%Y-%m-%d %H:%M:%S.%f').date(),
                'coverType':result.get('coverType',''),
                'isPublic':result.get('isPublic')
            }
            if result['coverType']=='link':
                document['coverLink']= result.get('coverLink','')
            else:
                coverFile= fs_handler_usual.getCover(category=result['category'],id=str(result['_id']))   
                document['cover']= coverFile
            return Response({"document": document},status=status.HTTP_200_OK)
        else:
            return Response({"message": "error fetching document"},status=status.HTTP_400_BAD_REQUEST)
        
    def post(self,request):
        doc_id = request.query_params.get("doc_id",None)
        data = request.POST.dict()
        files = request.FILES
        user = request.user
        if doc_id:
            update_id=None
            try:
                new_data = {
                    'coverType' : data.get('coverType'),
                    'isPublic' : data.get('isPublic'),
                    'title' : data.get('title')
                }
                mongo_client = mongo_DB(MONGO_USERNAME, MONGO_PASSWORD)
                existing_doc = mongo_client.get_doc_by_id(str(doc_id))
                if(not existing_doc.get('isPublic') == data.get('isPublic')):
                    new_data['allowed_users']= []
                owner = existing_doc.get('owner')
                category = existing_doc.get('category')
                if not owner == user.id and not user.is_admin == True:
                    return Response({'message':'Document does not belong to user'}, status = status.HTTP_400_BAD_REQUEST)
                if data.get('coverType') == 'link':
                    new_data['coverLink'] = data.get('coverLink')
                    update_id = mongo_client.update_doc(str(doc_id), data)
                    if update_id:
                        if not existing_doc.get('coverType') == 'link':
                            fs_handler = fsHandler(FS_DIR)
                            fs_handler.detele_files(category=category, id=str(doc_id),doc_type='cover')
                        mongo_client.commit_transaction(update_id)
                    else:
                        mongo_client.abort_transaction(update_id)
                        return Response({'message':'cannot update document'}, status= status.HTTP_400_BAD_REQUEST)
                else:
                    update_id = mongo_client.update_doc(str(doc_id), data)
                    if update_id:
                        update_path = False
                        if files.getlist('cover') == []:
                            update_path = True
                        else:
                            fs_handler = fsHandler(FS_DIR)
                            cover_file_names= [i.name for i in files.getlist('cover')]
                            update_path = fs_handler.update_file(category=category, id=str(doc_id),doc_type='cover', filenames=cover_file_names, files=files.getlist('cover'))
                        if update_path:
                            mongo_client.commit_transaction(update_id)
                            mongo_client.commit_transaction(mongo_client.update_doc(str(update_id),{"cover_path",update_path}))
                        else:
                            mongo_client.abort_transaction(update_id)
                            return Response({'message':'cannot update document'}, status= status.HTTP_400_BAD_REQUEST)

                return Response({'message':'updated document'}, status= status.HTTP_200_OK)
            except Exception as e:
                if update_id:
                    mongo_client.abort_transaction(update_id)
                return Response({'message':'cannot update document'}, status= status.HTTP_400_BAD_REQUEST)

    
class GetFacultyDoc(APIView):
    authentication_classes=[JWTAuthentication]
    permission_classes=[IsAdmin_or_Faculty]

    def get(self,request):
        fac_id=request.query_params.get('fac_id')
        if not (fac_id == request.user.id or request.user.is_admin == True):
            return Response({"message":"faculty id not match"}, status = status.HTTP_400_BAD_REQUEST)
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
                
                if document['isPublic']=="true" or user.is_admin==True or document['owner']==request.user.id or (user.id in document['allowed_users']):
                    if document['docType'] == "link":
                        doc_link= document['documentLink']
                        return Response({"message":f"Doc link : {doc_link}","link":True},status=status.HTTP_200_OK)
                    fshandler=fsHandler(FS_DIR)
                    zip_file, zip_status = fshandler.getZip(category=document['category'],id=str(doc_id))
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
                session_id = mongo_client.delete_doc(str(doc_id))
                if session_id:
                    if not document['docType'] == 'link' or not document['coverType'] == 'link':
                        fs_handler  = fsHandler(FS_DIR)
                        delete_status = fs_handler.detele_files(category=document['category'],id=str(doc_id),doc_type=None)
                    else:
                        delete_status=True
                    if delete_status:
                        mongo_client.commit_transaction(session_id)
                    else:
                        mongo_client.abort_transaction(session_id)
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

    def get_permissions(self):
        if self.request.method == "GET":
            return [IsAuthenticated(), IsAdmin_or_Faculty(), IsActive()]
        if self.request.method == "POST" or self.request.method == "PUT":
            return [IsAuthenticated(), IsAdmin(), IsActive()]
        if self.request.method == "DELETE":
            return [IsAuthenticated(), IsAdmin(), IsActive()]
        
        return super().get_permissions()

    def get(self,request):
        querry=request.query_params.get('querry',None)
        extra_params={}
        user_id = request.query_params.get('user_id',None)
        if user_id:
            extra_params['id']= int(user_id)
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
        fetch_fields = ['email','dep_code','id','first_name','username','phone_number','is_allowed']

        if request.user.is_faculty==True and request.user.is_admin==False:
            extra_params['is_allowed']= True
            fetch_fields = ['dep_code','id','first_name','username']
        if querry:
            querry=querry.strip()
            if request.user.is_admin == True:
                users=LibraryUser.objects.filter(
                    Q(first_name__icontains=querry) |
                    Q(username__icontains=querry) |
                    Q(email__icontains=querry) |
                    Q(id__icontains=querry) |
                    Q(phone_number__icontains=querry),**extra_params
                ).values(*fetch_fields)[int(request.query_params.get('start_c')):int(request.query_params.get('end_c'))]
            else:
                users=LibraryUser.objects.filter(
                    Q(first_name__icontains=querry) |
                    Q(username__icontains=querry) |
                    Q(email__icontains=querry),**extra_params
                ).values(*fetch_fields)[int(request.query_params.get('start_c')):int(request.query_params.get('end_c'))]
            user_count=LibraryUser.objects.filter(is_admin=False).aggregate(Count("id"))
            return Response({"users":list(users),"user_count":user_count['id__count']},status=status.HTTP_200_OK)
        users=LibraryUser.objects.filter(**extra_params).values(*fetch_fields)[int(request.query_params.get('start_c')):int(request.query_params.get('end_c'))]
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
    
    def put(self,request):
        data = request.data
        try:
            edit_user = LibraryUser.objects.filter(id = data['id']).first()
            edit_user.set_password(data['password'])
            edit_user.save()
            return Response({'message':'Passwrod  update successfull'},status=status.HTTP_200_OK)
        except:
            return Response({'message':'Error creating user'},status = status.HTTP_400_BAD_REQUEST)
        
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
    
    def get_permissions(self):
        if self.request.method=='POST' or self.request.method=='PUT' or self.request.method == "DELETE":
            return [IsAdmin(),IsActive(),IsAuthenticated()]
        
        if self.request.method=='GET':
            return [AllowAny()]
        
        return super().get_permissions()

    def get(self,request):
        dep_code=request.query_params.get('dep_code',None)
        if dep_code:
            dep_details=Departments.objects.filter(dep_code=dep_code).first()
            if dep_details:
                responseObj= {"dep_code":dep_details.dep_code,"dep_name":dep_details.dep_name,"managers":dep_details.managers,"subjects":dep_details.subjects}
        else:
            dep_details=Departments.objects.all().values("dep_name","dep_code","subjects")
            if dep_details:
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
        dep_code = request.query_params.get('dep_code')
        existing_dep= Departments.objects.filter(dep_code=dep_code).first()
        if not existing_dep:
            return Response({'message':'no department to delete'}, status = status.HTTP_400_BAD_REQUEST)
        existing_dep.delete()
        return Response({'message':'department deleted'},status=status.HTTP_200_OK)

    def put(self,request):
        dep_code = request.query_params.get('dep_code')
        if dep_code:
            data = request.POST
            existing_dep = Departments.objects.filter(dep_code = dep_code).first()
            if existing_dep:
                try:
                    existing_dep.dep_name = data.get('dep_name', existing_dep.dep_name)
                    existing_dep.managers = json.loads(data.get('managers', '[]'))
                    existing_dep.subjects = json.loads(data.get('subjects', '[]'))
                    existing_dep.save()
                except json.JSONDecodeError:
                    return Response({'message':'invalid input formats'},status= status.HTTP_400_BAD_REQUEST)
            else:
                return Response({'message':'Invalid dep_code'},status= status.HTTP_400_BAD_REQUEST)
            return Response({'message':'department edit successfull'}, status = status.HTTP_200_OK)
        else:
            return Response({'message':'please provide dep_code'},status=status.HTTP_400_BAD_REQUEST)

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
            'allowed_user':[],
            'createDate':str(datetime.now()),
            'category':data.get('category'),
            'department':data.get("department"),
            "subject":data.get("subject"),
            'authors':data.get('authors'),
            'hsnNumber':data.get('hsnNumber')
        }
        
        try:
            if(data.get('coverType')=='link'):
                userData['coverLink']=data.get('coverLink')
            if(data.get('documentType')=='link'):
                userData['documentLink']=data.get('documentLink')
            existing_doc = mongo_client.find_doc('hsnNumber',userData['hsnNumber'])
            if existing_doc:
                return Response({'message':'Document with HSN Number already exist'},status=status.HTTP_409_CONFLICT)

            existing_doc = mongo_client.find_doc('title',userData['title'])
            if existing_doc and existing_doc[0]['authors']==userData['authors']:
                return Response({'message':'Document already exist'},status= status.HTTP_409_CONFLICT)
            insert_id=mongo_client.insert(userData) 
            fshandler=fsHandler(FS_DIR)
            cover_path = None
            document_path = None
            if(data.get('coverType')!='link'):
                cover_file_names= [i.name for i in files.getlist('cover')]
                cover_path = fshandler.create_file(data.get('category'), insert_id, 'cover', cover_file_names, files.getlist('cover'))
            if(data.get('documentType')!='link'):
                document_file_names= [i.name for i in files.getlist('documents')]
                document_path = fshandler.create_file(data.get('category'), insert_id, 'document', document_file_names, files.getlist('documents'))
            if not cover_path or not document_path:
                return Response({'message':'cannot upload documents'},status=status.HTTP_400_BAD_REQUEST)
            
            mongo_client.commit_transaction(mongo_client.update_doc(str(insert_id),{"cover_path":cover_path,"document_path":document_path}))
        except Exception as e:
            return Response({'message':'Error uploading doc'},status=status.HTTP_400_BAD_REQUEST)

        return Response({'message':'docs uploaded'},status=status.HTTP_200_OK)
    
class GroupView(APIView):
    authentication_classes=[JWTAuthentication]

    def get_permissions(self):
        if self.request.method == "GET":
            return [IsActive(), IsAuthenticated()]
        
        if self.request.method == 'POST':
            return [IsAuthenticated(), IsActive(), IsAdmin_or_Faculty()]
        return super().get_permissions()

    def get(self,request):
        user = request.user 
        group_id = request.query_params.get('group_id')
        if group_id:
            mongo_client = mongo_DB(MONGO_USERNAME, MONGO_PASSWORD, db_name="Library", table_name="groups")
            group_details= mongo_client.get_doc_by_id(str(group_id))
            if group_details:
                group_details['id'] = str(group_details['_id'])
                group_details.pop('_id',None)
                return Response({'group_details':group_details},status=status.HTTP_200_OK)
            else:
                return Response({"message":"No groups found"},status=status.HTTP_400_BAD_REQUEST)
        
        if user.is_faculty == True:
            mongo_client = mongo_DB(MONGO_USERNAME, MONGO_PASSWORD, db_name="Library", table_name="groups")
            groups= mongo_client.get_faculty_doc(str(user.id))
            if groups:
                for grp in groups:
                    grp['id'] = str(grp['_id'])
                    grp.pop('_id', None)
                return Response({'groups':groups},status=status.HTTP_200_OK)
            else:
                return Response({"message":"No groups found"},status=status.HTTP_400_BAD_REQUEST)
        return Response({"message":'error fetching groups'},status=status.HTTP_400_BAD_REQUEST)
            
    def post(self,request):
        user = request.user
        group_details = request.data
        if group_details == None:
            return Response({'message':'no group to be added'},status=status.HTTP_400_BAD_REQUEST)
        group_details['owner']= user.id
        mongo_client = mongo_DB(username=MONGO_USERNAME, password=MONGO_PASSWORD, db_name="Library", table_name="groups")
        group_id= mongo_client.insert(group_details)
        try:
            for member in group_details['members']:
                user = LibraryUser.objects.filter(username= str(member['username'])).first()
                user.groups.append(str(group_id))
                user.save()
            return Response({'message':'group created successfull'},status=status.HTTP_200_OK)
        except Exception as e:
            existing_group= mongo_client.get_doc_by_id(str(group_id))
            if existing_group:
                delete_id=mongo_client.delete_doc(str(group_id))
                if delete_id:
                    mongo_client.commit_transaction(delete_id)
                else:
                    mongo_client.abort_transaction(delete_id)
            return Response({'message':'error creating group'},status=status.HTTP_400_BAD_REQUEST)
        
    def delete(self, request):
        group_id = request.query_params.get('group_id',None)
        if not group_id:
            return Response({'message':'please provide group id'},status=status.HTTP_400_BAD_REQUEST)
        mongo_client = mongo_DB(MONGO_USERNAME, MONGO_PASSWORD, db_name="Library", table_name="groups")
        existing_group = mongo_client.get_doc_by_id(str(group_id))
        if existing_group:
            delete_id = mongo_client.delete_doc(str(group_id))
            delete_status=False
            for member in existing_group['members']:
                try:
                    member_details = LibraryUser.objects.filter(username = member['username']).first()
                    member_details.groups.remove(str(group_id))
                    member_details.save()
                except:
                    continue
            if delete_id:
                delete_status= mongo_client.commit_transaction(delete_id)
            else:
                delete_status = mongo_client.abort_transaction(delete_id)
            if delete_status:
                return Response({'message':'group deleted successfull'},status=status.HTTP_200_OK)
            else:
                return Response({'message':'error deleting group'}, status=status.HTTP_400_BAD_REQUEST)
    
    def put(self,request):
        group_id = request.query_params.get('group_id')
        if not group_id:
            return Response({'message':'Please provide group Id'},status=status.HTTP_400_BAD_REQUEST)
        data = request.data
        mongo_client = mongo_DB(MONGO_USERNAME, MONGO_PASSWORD, db_name="Library", table_name="groups")
        existing_group = mongo_client.get_doc_by_id(str(group_id))
        if existing_group:
            existing_members = existing_group['members']
            new_members = data['members']
            new_members_set = {frozenset(member.items()) for member in new_members}
            existing_members_set = {frozenset(member.items()) for member in existing_members}
            deleted_memebrs = [dict(s) for s in existing_members_set - new_members_set]
            new_members = [dict(s) for s in new_members_set - existing_members_set]
            update_id = mongo_client.update_doc(str(group_id),data)
            for member in new_members:
                try:
                    existing_member = LibraryUser.objects.filter(id= str(member['id'])).first()
                    existing_member.groups.append(str(group_id))
                    existing_member.save()
                except:
                    continue                
            for member in deleted_memebrs:
                try:
                    existing_member = LibraryUser.objects.filter(id= str(member['id'])).first()
                    if(group_id in existing_member.groups):
                        existing_member.groups.remove(str(group_id))
                    existing_member.save()
                except:
                    continue
            if update_id:
                mongo_client.commit_transaction(update_id)
                return Response({'message':'Group edited successfully'},status=status.HTTP_200_OK)
            else:
                mongo_client.abort_transaction(update_id)
                return Response({'message':'error updating group'},status=status.HTTP_400_BAD_REQUEST)
            

            



class GroupDocumentView(APIView):
    authentication_classes=[JWTAuthentication]

    def get_permissions(self):
        if self.request.method =='GET':
            return [IsActive(), IsAuthenticated()]
        if self.request.method == "POST":
            return [IsActive(), IsAdmin_or_Faculty(), IsAuthenticated()]
        return super().get_permissions()

    def get(self,request):
        group_id = request.query_params.get('group_id')
        query = request.query_params.get('query')
        if not group_id or not query:
            return Response({"message":"invalid request"},status=status.HTTP_400_BAD_REQUEST)
        mongo_client = mongo_DB(MONGO_USERNAME, MONGO_PASSWORD, table_name="groups")
        documents = mongo_client.search_doc_in_group(str(group_id), str(query))
        if documents:
            return Response({"documents":documents},status=status.HTTP_200_OK)
        else:
            return Response({'message':"no documents found"},status= status.HTTP_400_BAD_REQUEST)

    def post(self,request):
        group_id = request.query_params.get('group_id', None)
        documents = request.data
        user = request.user
        if not group_id:
            return Response({'message':'please provide group id'},status=status.HTTP_400_BAD_REQUEST)
        mongo_client = mongo_DB(MONGO_USERNAME, MONGO_PASSWORD, db_name="Library", table_name="groups")
        existing_group = mongo_client.get_doc_by_id(str(group_id))

        if not user.is_admin == True and not existing_group['owner'] == user.id: # if user is not a admin or not owner of group return error
            return Response({'message': "Invalid request"}, status=status.HTTP_400_BAD_REQUEST)
        
        existing_docs = [doc['id'] for doc in existing_group['documents']] # get the ids of documents in exsting group
        new_docs = [doc['id'] for doc in documents] # get ids of new documents
        existing_group['documents'] = [doc for doc in existing_group['documents'] if doc['id'] in new_docs]  # remove the documents from existing documents

        for doc in documents: # add new documents to group documents
            if not doc['id'] in existing_docs:
                existing_group['documents'].append(doc)
                
        update_id=mongo_client.update_doc(str(group_id), {'documents': existing_group['documents']}) # update the documents in mongodb
        if update_id:
            mongo_client.commit_transaction(update_id)
        else:
            mongo_client.abort_transaction(update_id)
        return Response({'message': 'documents added'}, status=status.HTTP_200_OK)
    
class MemberGroupView(APIView):
    """This class provides endpoints for group members"""
    authentication_classes=[JWTAuthentication]

    def get_permissions(self):
        if self.request.method == "GET":
            return [IsActive(),IsAuthenticated()]
        if self.request.method == "delete":
            return [IsActive(), IsAuthenticated()]
        return super().get_permissions()
    
    def get(self,request):
        """ Provides a list of ids of groups that user is joined in """ 
        user = request.user
        member_id = user.id
        query = request.query_params.get('query')
        print(query)
        my_groups = LibraryUser.objects.filter(id=member_id).values("groups")[:20]
        if query != None:
            mongo_db = mongo_DB(MONGO_USERNAME, MONGO_PASSWORD, db_name="Library", table_name="groups")
            documents = [mongo_db.get_doc_by_id(str(doc_id)) for doc_id in list(my_groups)[0]['groups']]
            print(documents)
            matches = None
            if documents:
                matches = [(str(doc['_id']), difflib.SequenceMatcher(None, query, doc['group_name']).ratio()) for doc in documents]
                matches.sort(key=lambda x: x[1], reverse=True)
                matches = [match[0] for match in matches if match[1]>0.5]
            if matches!=None:
                return Response({"groups":matches},status=status.HTTP_200_OK)
        elif my_groups:
            return Response({"groups":list(my_groups)[0]['groups']},status=status.HTTP_200_OK)
        else:
            return Response({'message':"No groups found"},status=status.HTTP_400_BAD_REQUEST)
        
    def delete(self, request):
        user = request.user
        group_id = request.query_params.get('group_id')
        mongo_db = mongo_DB(MONGO_USERNAME, MONGO_PASSWORD, db_name="Library", table_name="groups")
        existing_group = mongo_db.get_doc_by_id(str(group_id))
        if existing_group:
            for member in existing_group['members']:
                if user.id == member['id']:
                    if(member in existing_group['members']):
                        existing_group['members'].remove(member)
                    print(existing_group)
                    update_id = mongo_db.update_doc(group_id,{"members":existing_group['members']})
                    if update_id:
                        current_user = LibraryUser.objects.filter(id=user.id).first()
                        print(current_user)
                        if group_id in current_user.groups:
                            current_user.groups.remove(str(group_id))
                        current_user.save()
                        mongo_db.commit_transaction(update_id)
                        return Response({'message':'Group left successfull.'},status=status.HTTP_200_OK)
        return Response({'message':'Error leaving group'},status=status.HTTP_400_BAD_REQUEST)

        
class PrivateDocRequests(APIView):
    authentication_classes=[JWTAuthentication]
    permission_classes=[IsActive,IsAuthenticated]

    def get(self,request):
        requester_id = request.query_params.get('requester_id',None)
        faculty_id = request.query_params.get('fac_id',None)
        user = request.user
        if requester_id:
            if user.id == int(requester_id):
                user_requests = FacultyDocumentRequests.objects.filter(requester_id=int(requester_id))
                responseOBJ = [req['doc_id'] for req in user_requests]
                return Response({'requests':responseOBJ},status=status.HTTP_200_OK)
            else:
                return Response({'message':'invalid request'},status=status.HTTP_400_BAD_REQUEST)
        elif faculty_id:
            if user.id == int(faculty_id) or request.user.is_admin == True:
                user_requests = FacultyDocumentRequests.objects.filter(fac_id=int(faculty_id)).values('doc_id','fac_id','requester_id')
                return Response({'requests':user_requests},status=status.HTTP_200_OK)
            else:
                return Response({'message':'invalid request'},status=status.HTTP_400_BAD_REQUEST)
    
    def post(self,request):
        data = request.data
        user = request.user
        new_req={'doc_id':None}
        if data.get('doc_id',None):
            existing_doc = mongo_client_usual.get_doc_by_id(str(data.get('doc_id')))
            if existing_doc:
                new_req = {
                    'doc_id':data.get('doc_id',None),
                    'fac_id':existing_doc['owner'],
                    'requester_id': user.id,
                }
        for key,value in new_req.items():
            if value is None:
                return Response({'message':'invalid request'},status = status.HTTP_400_BAD_REQUEST)
        existing_request = FacultyDocumentRequests.objects.filter(requester_id=new_req['requester_id'], doc_id= new_req['doc_id']).first()
        if existing_request:
            return Response({'message':'Request already created'},status=status.HTTP_409_CONFLICT)
        
        new_req = RequestedDocForm(new_req)
        if new_req.is_valid():
            new_req.save()
            return Response({'message':'request submited'},status=status.HTTP_200_OK)
        
    def put(self,request):
        data = request.data
        user =request.user
        mongo_client = mongo_DB(MONGO_USERNAME,MONGO_PASSWORD)
        requested_doc = mongo_client.get_doc_by_id(str(data['doc_id']))
        if requested_doc:
            if requested_doc['owner']==user.id or user.is_admin==True:
                if 'allowed_user' in requested_doc.keys():
                    allowed_user = requested_doc['allowed_users']
                else:
                    allowed_user=[]
                allowed_user= list(allowed_user)
                allowed_user.append(data['requester_id'])
                update_id = mongo_client.update_doc(str(data['doc_id']),{'allowed_users':allowed_user})
                if update_id:
                    mongo_client.commit_transaction(update_id)
                else:
                    mongo_client.abort_transaction(update_id)
                doc_request=FacultyDocumentRequests.objects.filter(doc_id = data['doc_id'], requester_id = data['requester_id']).first()
                doc_request.delete()
                return Response({'message':'access provided'},status=status.HTTP_200_OK)
            else:
                return Response({'message':'invalid request'},status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response({'message':'invalid request'},status=status.HTTP_400_BAD_REQUEST)
        
    def delete(self,request):
        doc_id = request.query_params.get('doc_id',None)
        requester_id = request.query_params.get('requester_id',None)
        if doc_id and requester_id:
            existing_req = FacultyDocumentRequests.objects.filter(doc_id=doc_id, requester_id=requester_id).first()
            if not existing_req:
                return Response({'message':'please provide valid request details'},status= status.HTTP_400_BAD_REQUEST)
            if existing_req.requester_id==requester_id or existing_req.fac_id== request.user.id:
                existing_req.delete()
                return Response({'message':'request deleted'},status=status.HTTP_200_OK)
            else:
                return Response({'message':'request does not belong to you'},status= status.HTTP_400_BAD_REQUEST)
        else:
            return Response({'message':'please provide valid request details'},status= status.HTTP_400_BAD_REQUEST)