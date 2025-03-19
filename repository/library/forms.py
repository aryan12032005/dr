from django import forms
from .models import Departments

class DepartmentsForm(forms.ModelForm):
    class Meta:
        model = Departments
        fields = ['dep_code', 'dep_name', 'managers', 'subjects']
