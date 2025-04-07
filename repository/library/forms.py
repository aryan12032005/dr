from django import forms
from .models import Departments, UserQuery

class DepartmentsForm(forms.ModelForm):
    class Meta:
        model = Departments
        fields = ['dep_code', 'dep_name', 'managers', 'subjects']

class UserQueryForm(forms.ModelForm):
    class Meta:
        model = UserQuery
        fields = ['name', 'email', 'query']
