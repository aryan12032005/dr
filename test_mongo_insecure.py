import dotenv, os
from pathlib import Path
from pymongo import MongoClient

dotenv.load_dotenv(Path("repository") / ".env")
uri = os.getenv("DATABASE_STRING")
print("Using URI:", uri[:60] + "..." if uri else "None")
try:
    # Debug only: allow invalid certs to test whether TLS protocol negotiation works
    client = MongoClient(uri, tlsAllowInvalidCertificates=True)
    print('Ping result (insecure):', client.admin.command('ping'))
except Exception as e:
    print('Insecure connection failed:', repr(e))
