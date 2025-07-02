from pymongo import MongoClient
import os, shutil
from bson import ObjectId
import zipfile
import base64
import uuid
from ..tasks import delete_zip
import shutil
import dotenv


class mongo_DB:
    def __init__(self, username=None, password=None, host="localhost", port=27017, db_name="Library", table_name="documents"):
        """ takes mongodb credentials and db_name, table_name to initialize a connection to database """

        dotenv.load_dotenv()
        # auth_database="admin"
        # db_string=f"mongodb://{username}:{password}@localhost:{port}/{auth_database}?authSource={auth_database}"
        db_string = os.getenv("DATABASE_STRING")
        self.client=MongoClient(db_string)
        self.db=self.client[db_name]
        self.doc=self.db[table_name]
        self.__sessions={}

    def __start_session(self):
        """ starts a session in database and returns a unique session id """
        session= self.client.start_session()
        session.start_transaction()
        session_id = str(uuid.uuid4())
        self.__sessions[session_id] = session
        return session_id
    
    def commit_transaction(self, session_id:str):
        """ commits te session to database """
        if session_id in self.__sessions.keys():
            session = self.__sessions[session_id]
            session.commit_transaction()
            session.end_session()
            self.__sessions.pop(session_id)
            return True
        else:
            return False
        
    def abort_transaction(self,session_id:str):
        """ aborts the session previously initialized """
        if session_id in self.__sessions:
            session = self.__sessions[session_id]
            session.abort_transaction()
            session.end_session()
            self.__sessions.pop(session_id)
            return True
        else:
            return False


    def get_count(self,db_name="Library",collection="documents"):
        """ returns the total count of items in the collection """
        db=self.client[db_name]
        doc=db[collection]
        return doc.count_documents({})
    
    def insert(self, item):
        """ inserts a new item to connected collection"""
        inserted_id=self.doc.insert_one(item).inserted_id
        return inserted_id
    
    def search_document(self, querry, extra_params:dict={}, dateOrder:int = 0):
        """ search a item in document based on string search querry and other key value pairs if known also provide search order """
        projections= [("score", { "$meta": "textScore" })]
        if dateOrder!=0:
            projections.append(("date", dateOrder))
            
        item=self.doc.find(
            {"$text": {"$search": querry},**extra_params},
            {"score": {"$meta": "textScore"}}
        ).sort(projections).limit(10)
        if item:
            return item.to_list()
        else:
            return None
    
    def find_doc(self,key:str,value:str):
        """ finds all documents with a provided key value pair """
        item = self.doc.find({key:value})
        if item:
            return item.to_list()
        else:
            return None

    def get_faculty_doc(self,fac_id:str):
        """ based on faculty id returns all items owned by that person """
        items=self.doc.find(
            {"owner":int(fac_id)}
        )
        if items:
            return items.to_list()
        else:
            return None
        
    def get_doc_by_id(self,doc_id:str):
        """ returns one document based on specified id string """
        items=self.doc.find_one(
            {"_id":ObjectId(doc_id)}
        )
        if items:
            return items
        else:
            return None
        
    def update_doc(self, id:str, new_value):
        """ updates a document based on id and you can provide new key value pair to be added """
        query = {"_id": ObjectId(id)}
        new_values = {"$set": new_value}
        session_id = self.__start_session()
        result=self.doc.update_one(query,new_values, session=self.__sessions[session_id], upsert=True)
        if result.modified_count > 0:
            return session_id
        else:
            return False
        
    def delete_doc(self,id:str):
        """ deletes a documetn based on doc id"""
        querry={'_id':ObjectId(id)}
        session_id = self.__start_session()
        result=self.doc.delete_one(querry, session=self.__sessions[session_id])
        if result.deleted_count>0:
            return session_id
        else:
            return False
        
    def search_doc_in_group(self, id:str, query:str):
        documents = self.doc.find({
            "_id":ObjectId(id),
            "$text": { "$search": query }
        }, {
            "score": { "$meta" : "textScore" },
            "documents.title": 1 
        })
        if documents:
            return documents.to_list()
        else:
            return None
       

def file_checker(method):
    def wrapper(self, *args, **kwargs):
        original_dir = self.work_dir
        if not self.work_dir:
            return False
        temp_dir=self.work_dir+'/'+kwargs['category']+'/'+str(kwargs["id"])+'/'+kwargs["doc_type"]  
        path_exists = os.path.isdir(temp_dir)
        if path_exists:
            return method(self, *args, **kwargs)
        else:
            for dir in self.alternate_dirs:
                temp_dir=dir+'/'+kwargs['category']+'/'+str(kwargs["id"])+'/'+kwargs["doc_type"]
                if os.path.isdir(temp_dir):
                    self.work_dir = dir
                    result = method(self, *args, **kwargs)
                    self.work_dir = original_dir
                    return result
                else:
                    continue
            return False
    return wrapper

class fsHandler:
    def __init__(self,working_dir):
        os.makedirs(working_dir,exist_ok=True)
        self.work_dir=working_dir
        self.alternate_dirs = os.getenv("alternate_dirs")
    
    def create_file(self,category,id,doc_type,filenames,files):
        empty_threshold = 1024**3  # 1 GB of space threshold
        usage = shutil.disk_usage(self.work_dir)
        original_dir = None
        if not usage.free > empty_threshold:
            original_dir = self.work_dir
            self.work_dir = None
            for dir in self.alternate_dirs:
                if shutil.disk_usage(dir).free > empty_threshold:
                    self.work_dir = dir
                    break
                else:
                    continue
        if not self.work_dir:
            self.work_dir = original_dir
            return False
        
        temp_dir=self.work_dir+'/'+category+'/'+str(id)+'/'+doc_type
        os.makedirs(temp_dir,exist_ok=True)
        try:
            for i,f in enumerate(filenames):
                with open(temp_dir+ '/'+ str(i)+ '_'+  str(f), 'wb+') as new_file:
                    for chunks in files[i]:
                        new_file.write(chunks)
        except:
            return False
        self.work_dir = original_dir
        return temp_dir

    def update_file(self,category,id,doc_type,filenames,files):
        temp_dir=self.work_dir+'/'+category+'/'+str(id)+'/'+doc_type
        if os.path.exists(temp_dir):
            shutil.rmtree(temp_dir)
        else:
            return False
        os.mkdir(temp_dir)
        try:
            for i,f in enumerate(filenames):
                with open(temp_dir+ '/'+ str(i)+ '_'+ str(f), 'wb+') as new_file:
                    for chunks in files[i]:
                        new_file.write(chunks)
        except:
            return False
        return temp_dir
    
    def detele_files(self,category,id,doc_type,filenames = None):
        try:
            if doc_type:
                temp_dir=self.work_dir+'/'+category+'/'+str(id) + '/'+ doc_type
            else:
                temp_dir=self.work_dir+'/'+category+'/'+str(id)
            if filenames and doc_type:
                for f in filenames:
                    os.remove(temp_dir+'/'+f)
            else:
                shutil.rmtree(temp_dir)
        except:
            return False
        return True
    
    def getCover(self, category:str, id:str):
        folder_dir=self.work_dir+"/"+category+"/"+str(id)+'/cover'
        file_name= os.listdir(folder_dir)[0]
        cover = open(folder_dir+"/"+file_name, "rb")
        if cover:
            return base64.b64encode(cover.read()).decode('utf-8')
        else:   
            return None
    
    def getZip(self, category:str, id:str):
        folder_dir=self.work_dir+"/"+category+"/"+str(id)+'/document'
        file_name=id+".zip"
        os.makedirs(self.work_dir+"/ZIP",exist_ok=True)
        zip_path= self.work_dir+"/ZIP/"+file_name
        try:
            with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zip_file:
                for root, _, files in os.walk(folder_dir): 
                    for file in files:
                        file_path = os.path.join(root, file)
                        arcname = os.path.relpath(file_path, folder_dir) 
                        zip_file.write(file_path, arcname)
            zip_file=open(zip_path,"rb")
            delete_zip(zip_path)
            return zip_file, True
        except:
            return None, False
            

