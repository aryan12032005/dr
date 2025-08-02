from django import forms
from .models import Departments, UserQuery , FacultyDocumentRequests, DocumentDeleteRequests, DocumentCategories

class DepartmentsForm(forms.ModelForm):
    class Meta:
        model = Departments
        fields = ['dep_code', 'dep_name', 'managers', 'subjects']

class UserQueryForm(forms.ModelForm):
    class Meta:
        model = UserQuery
        fields = ['name', 'email', 'query']

class RequestedDocForm(forms.ModelForm):
    class Meta:
        model = FacultyDocumentRequests
        fields = ['doc_id', 'fac_id', 'requester_id']

class DeleteDocumentForm(forms.ModelForm):
    class Meta:
        model = DocumentDeleteRequests
        fields = ['doc_id', 'fac_id', 'reason']

class CategoryForm(forms.ModelForm):
    class Meta:
        model = DocumentCategories
        fields = ['name', 'code']
