import requests

# Login
r = requests.post('http://localhost:8000/login/', json={
    'username': 'mamta-kaushik',
    'password': 'Admin@123'
}, timeout=10)
print("Login status:", r.status_code)
if r.status_code != 200:
    print("Login failed:", r.text)
    exit()

token = r.json()['access_token']
print("Got token")

# Test upload
try:
    r2 = requests.post('http://localhost:8000/upload_document/', 
        data={
            'title': 'Test Document',
            'coverType': 'link',
            'documentType': 'link',
            'isPublic': 'true',
            'coverLink': 'http://example.com/cover.jpg',
            'documentLink': 'http://example.com/doc.pdf',
            'category': 'test',
            'department': 'CS',
            'subject': 'other',
            'authors': 'Test Author',
            'hsnNumber': 'HSN999'
        }, 
        headers={'Authorization': f'Bearer {token}'},
        timeout=30
    )
    print("Upload status:", r2.status_code)
    print("Upload response:", r2.text)
except requests.exceptions.Timeout:
    print("Request timed out!")
except Exception as e:
    print(f"Error: {e}")
