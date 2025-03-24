from . import views
from django.urls import path
urlpatterns=[
    path('',views.index),
    path('login/',views.LoginView.as_view()),
    path('get_csrf/',views.get_csrf_token),
    path('signup/',views.SignupView.as_view()),
    path('admin/',views.adminuserView.as_view()),
    path('admin/delete_user/',views.adminuserView.as_view(),name='delete'),
    path('refresh_token/',views.refresh_token.as_view(),name='post'),
    path('get_user_type/',views.user_type.as_view(),name='get'),
    path('change_user_type/',views.user_type.as_view(),name='post'),
    path('upload-document/',views.upload_document.as_view(),name='post'),
    path('logout/',views.logout_user.as_view(),name='get'),
    path('search_document/',views.SearchView.as_view(),name='get'),
    path('total_details/',views.total_details.as_view(),name='get'),
    path('edit_user/',views.adminuserView.as_view(),name='post'),
    path('upload_csv/',views.uploadCsv.as_view(),name='post'),
    path('get_sample_csv/',views.uploadCsv.as_view(),name='get'),
]