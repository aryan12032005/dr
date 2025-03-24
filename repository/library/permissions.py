# myapp/permissions.py
from rest_framework.permissions import BasePermission

class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_admin

class IsFaculty(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_faculty
    
class IsActive(BasePermission):
    def has_permission(self,request,view):
        return request.user.is_active

class IsAdmin_or_Faculty(BasePermission):
    def has_permission(self,request,view):
        return (request.user.is_faculty or request.user.is_admin)
