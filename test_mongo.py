import dotenv, os, certifi
from pathlib import Path
from pymongo import MongoClient

dotenv.load_dotenv(Path("repository") / ".env")
uri = os.getenv("DATABASE_STRING")
print("Using URI:", uri[:60] + "..." if uri else "None")
try:
    client = MongoClient(uri, tlsCAFile=certifi.where())
    print('Ping result:', client.admin.command('ping'))
except Exception as e:
    print('Connection failed:', repr(e))
