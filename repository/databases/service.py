from pymongo import MongoClient
import sqlite3 as sq

class mongo_DB:
    def __init__(self, username=None, password=None, host=None, port=None, db_name="library", table_name="documents"):
        db_string=f"mongodb://localhost:27017"
        self.client=MongoClient(db_string)
        self.db=self.client[db_name]
        self.doc=self.db[table_name]

    def insert(self, item):
        return self.doc.insert_one(item).inserted_id
    
    def get_document(self, querry):
        item=self.doc.find_one(querry)
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
       
        
