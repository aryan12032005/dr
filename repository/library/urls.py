from . import views
from django.urls import path
urlpatterns=[
    path('',views.index),
    path('login/',views.LoginView.as_view()),
    path('signup/',views.SignupView.as_view())
]