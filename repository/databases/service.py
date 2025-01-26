from pymongo import MongoClient
import sqlite3 as sq

class mongo_DB:
    def __init__(self, username=None, password=None, host=None, port=None, db_name="documents", table_name="library"):
        self.client=MongoClient(host,port)
        self.db=self.client[db_name]
        self.doc=self.db[table_name]

    def insert(self, db_name, table_name, document):
        self.db=self.client[db_name]
        self.doc=self.db[table_name]
        return self.doc.insert_one(document).inserted_id
    
    # def delete_record(self, db_name, table_name, document):
       
        
