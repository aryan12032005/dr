from pymongo import MongoClient

auth_database="admin"
db_string=f"mongodb://harsh:harsh123@localhost:27017/{auth_database}?authSource={auth_database}"
client=MongoClient(db_string)
db=client['Library']
doc=db['groups']

items=doc.find()
for item in items:
    print(item)


# from pymongo import MongoClient
# auth_database="admin"
# db_string=f"mongodb://harsh:harsh123@localhost:27017/{auth_database}?authSource={auth_database}"
# client=MongoClient(db_string)
# db=client['Library']
# doc=db['documents']

# delete_id= doc.delete_many({})
# print(delete_id)
