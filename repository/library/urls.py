from . import views
from django.urls import path
urlpatterns=[
    path('',views.index),
    path('login/',views.LoginView.as_view()),
    path('get_csrf/',views.get_csrf_token),
    path('signup/',views.SignupView.as_view()),
    path('admin/',views.adminuserView.as_view()),
    path('admin/delete_user/',views.adminuserView.as_view(),name='delete'),
    path('refresh_token/',views.refresh_token.as_view())
]