from django.db import models
from django.contrib.auth.models import BaseUserManager,AbstractBaseUser

class LibraryUserManager(BaseUserManager):
    def create_user(self, email, username, password=None, **extra_fields):
        if not email or not password:
            raise ValueError("The Email and password field must be set")
        email = self.normalize_email(email)
        user = self.model(email=email, username=username, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

class LibraryUser(AbstractBaseUser):
    email = models.EmailField(unique=True)
    dep_code= models.CharField(max_length=150,default="")
    username = models.CharField(max_length=150, unique=True)
    first_name = models.CharField(max_length=150)
    last_name = models.CharField(max_length=150)
    phone_number = models.CharField(max_length=10)
    is_faculty = models.BooleanField(default=False)
    is_admin= models.BooleanField(default=False)
    is_allowed=models.BooleanField(default=True)

    objects = LibraryUserManager()

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['email','first_name','last_name','is_faculty','is_admin','is_allowed']

    def __str__(self):
        return self.email
    
class Departments(models.Model):
    dep_code = models.CharField(unique=True, max_length=150)
    dep_name = models.CharField(max_length=150)
    managers = models.JSONField(default=list)
    subjects = models.JSONField(default=dict)

