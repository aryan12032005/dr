from pymongo import MongoClient
import os
class mongo_DB:
    def __init__(self, username=None, password=None, host="localhost", port=27017, db_name="Library", table_name="documents"):
        auth_database="admin"
        db_string=f"mongodb://{username}:{password}@localhost:{port}/{auth_database}?authSource={auth_database}"
        self.client=MongoClient(db_string)
        self.db=self.client[db_name]
        self.doc=self.db[table_name]

    def get_count(self,db_name="Library",collection="documents"):
        db=self.client[db_name]
        doc=db[collection]
        return doc.count_documents({})
    
    def insert(self, item):
        inserted_id=self.doc.insert_one(item).inserted_id
        return inserted_id
    
    def get_document(self, querry):
        item=self.doc.find(
            {"$text": {"$search": querry}},
            {"score": {"$meta": "textScore"}}
        ).sort([("score", {"$meta": "textScore"})]).limit(10)
        if item:
            return item
        else:
            return None
        
    def update_doc(self,id, new_value):
        query = {"id": id}
        new_values = {"$set": new_value}
        result=self.doc.update_one(query,new_values)
        if result:
            return result.upserted_id
        else:
            return None
        
    def delete_doc(self,id):
        querry={'id':id}
        result=self.doc.delete_one(querry)
        return result.deleted_count
       
        
class fsHandler:
    def __init__(self,working_dir):
        os.makedirs(working_dir,exist_ok=True)
        self.work_dir=working_dir
    
    def create_file(self,category,id,filenames,files):
        temp_dir=self.work_dir+'/'+category+'/'+str(id)
        os.makedirs(temp_dir,exist_ok=True)
        try:
            for i,f in enumerate(filenames):
                with open(temp_dir+ '/'+ str(i)+ '_'+  str(f), 'wb+') as new_file:
                    for chunks in files[i]:
                        new_file.write(chunks)
        except:
            return False
        return temp_dir

    def update_file(self,category,id,filenames,files):
        temp_dir=self.work_dir+'/'+category+'/'+str(id)
        try:
            for i,f in enumerate(filenames):
                with open(temp_dir+ '/'+ str(f), 'wb+') as new_file:
                    for chunks in files[i]:
                        new_file.write(chunks)
        except:
            return False
        return temp_dir
    
    def detele_files(self,category,id,filenames):
        temp_dir=self.work_dir+'/'+category+'/'+str(id)
        try:
            for f in filenames:
                os.remove(temp_dir+'/'+f)
        except:
            return 0
        return True