from django.test import TestCase

from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model

User = get_user_model()

class AdminTestCase(APITestCase):
    def setUp(self):
        # Create a test user for JWT-protected endpoints
        self.adminUser = User.objects.create_user(username="testAdmin",
                                             password="adminPass",
                                             email="admin@gmail.com",
                                             first_name="admin",
                                             last_name="member",
                                             phone_number="1234567890",
                                             is_faculty=True,
                                             is_admin=True,
                                             is_allowed=True,
                                             dep_code="CSE")
        self.facultyUser = User.objects.create_user(username="testFaculty",
                                             password="facultyPass",
                                             email="faculty@gmail.com",
                                             first_name="faculty",
                                             last_name="member",
                                             phone_number="1234567890",
                                             is_faculty=True,
                                             is_admin=False,
                                             is_allowed=True,
                                             dep_code="CSE")
        self.studentUser = User.objects.create_user(username="testUser",
                                             password="userPass",
                                             email="user@gmail.com",
                                             first_name="student",
                                             last_name="member",
                                             phone_number="1234567890",
                                             is_faculty=False,
                                             is_admin=False,
                                             is_allowed=True,
                                             dep_code="CSE")
        refresh = RefreshToken.for_user(self.adminUser)
        self.access_token = str(refresh.access_token)

    def auth_client(self):
        """Helper to return client with JWT auth header."""
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.access_token}")

    def test_index(self):
        response = self.client.get('/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_get_csrf(self):
        response = self.client.get('/get_csrf/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_refresh_token(self):
        # Usually needs a refresh token
        response = self.client.post('/refresh_token/', {"refresh": str(RefreshToken.for_user(self.adminUser))})
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_send_query(self):
        response = self.client.post('/send_query/', {"query": "Test"})
        self.assertIn(response.status_code, [status.HTTP_200_OK, status.HTTP_201_CREATED])

    def test_login(self):
        response = self.client.post('/login/', {"username": "testAdmin", "password": "adminPass"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        response = self.client.post('/login/', {"username": "testFaculty", "password": "facultyPass"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        response = self.client.post('/login/', {"username": "testUser", "password": "userPass"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_signup(self):
        response = self.client.post('/signup/', {"username": "newuser", "password": "newpass"})
        self.assertIn(response.status_code, [status.HTTP_200_OK, status.HTTP_201_CREATED])

    def test_upload_csv(self):
        self.auth_client()
        response = self.client.get('/get_sample_csv/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_upload_csv_post(self):
        self.auth_client()
        # Simulate CSV upload (send empty file for now)
        from io import BytesIO
        csv_file = BytesIO(b"col1,col2\nval1,val2")
        csv_file.name = 'test.csv'
        response = self.client.post('/upload_csv/', {'file': csv_file})
        self.assertIn(response.status_code, [status.HTTP_200_OK, status.HTTP_201_CREATED])

    def test_logout(self):
        self.auth_client()
        response = self.client.post('/logout/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_admin_user_views(self):
        self.auth_client()
        self.assertEqual(self.client.get('/search_user/').status_code, status.HTTP_200_OK)
        self.assertEqual(self.client.post('/delete_user/', {"id": 1}).status_code, status.HTTP_200_OK)
        self.assertEqual(self.client.post('/edit_user/', {"id": 1, "username": "edited"}).status_code, status.HTTP_200_OK)
        self.assertEqual(self.client.post('/change_password/', {"id": 1, "password": "newpass"}).status_code, status.HTTP_200_OK)

    def test_total_details(self):
        self.auth_client()
        response = self.client.get('/total_details/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_user_type(self):
        self.auth_client()
        self.assertEqual(self.client.get('/get_user_type/').status_code, status.HTTP_200_OK)
        self.assertEqual(self.client.post('/change_user_type/', {"id": 1, "type": "admin"}).status_code, status.HTTP_200_OK)

    def test_document_views(self):
        self.auth_client()
        self.assertEqual(self.client.get('/search_document/').status_code, status.HTTP_200_OK)
        self.assertEqual(self.client.post('/upload_document/', {"name": "Doc"}).status_code, status.HTTP_200_OK)
        self.assertEqual(self.client.get('/get_document/').status_code, status.HTTP_200_OK)
        self.assertEqual(self.client.get('/download_doc/').status_code, status.HTTP_200_OK)
        self.assertEqual(self.client.post('/update_document/', {"id": 1, "name": "Updated"}).status_code, status.HTTP_200_OK)
        self.assertEqual(self.client.get('/get_faculty_doc/').status_code, status.HTTP_200_OK)
        self.assertEqual(self.client.post('/delete_document/').status_code, status.HTTP_200_OK)

    def test_department_views(self):
        self.auth_client()
        self.assertEqual(self.client.get('/get_department/').status_code, status.HTTP_200_OK)
        self.assertEqual(self.client.post('/add_department/', {"name": "New"}).status_code, status.HTTP_200_OK)
        self.assertEqual(self.client.post('/delete_department/', {"id": 1}).status_code, status.HTTP_200_OK)
        self.assertEqual(self.client.post('/update_department/', {"id": 1, "name": "Updated"}).status_code, status.HTTP_200_OK)

    def test_group_views(self):
        self.auth_client()
        self.assertEqual(self.client.get('/get_groups/').status_code, status.HTTP_200_OK)
        self.assertEqual(self.client.get('/search_group_documents/').status_code, status.HTTP_200_OK)
        self.assertEqual(self.client.get('/get_member_group/').status_code, status.HTTP_200_OK)
        self.assertEqual(self.client.post('/create_group/', {"name": "Test Group"}).status_code, status.HTTP_200_OK)
        self.assertEqual(self.client.post('/edit_group/', {"id": 1, "name": "Edited"}).status_code, status.HTTP_200_OK)
        self.assertEqual(self.client.post('/leave-group/', {"group_id": 1}).status_code, status.HTTP_200_OK)
        self.assertEqual(self.client.post('/delete_group/', {"id": 1}).status_code, status.HTTP_200_OK)
        self.assertEqual(self.client.post('/add_group_documents/', {"group_id": 1, "doc_id": 1}).status_code, status.HTTP_200_OK)

    def test_private_doc_requests(self):
        self.auth_client()
        self.assertEqual(self.client.get('/get_requests/').status_code, status.HTTP_200_OK)
        self.assertEqual(self.client.post('/request_access/', {"doc_id": 1}).status_code, status.HTTP_200_OK)
        self.assertEqual(self.client.post('/approve_document/', {"request_id": 1}).status_code, status.HTTP_200_OK)
        self.assertEqual(self.client.post('/delete_request/', {"request_id": 1}).status_code, status.HTTP_200_OK)

