from . import views
from django.urls import path

urlpatterns=[
    path('',views.index),
    path('get_csrf/',views.get_csrf_token),
    path('refresh_token/',views.refresh_token.as_view()),
    path('send_query/', views.QueryView.as_view()),
    path('login/',views.LoginView.as_view()),
    path('signup/',views.SignupView.as_view()),
    path('get_sample_csv/',views.uploadCsv.as_view()),
    path('upload_csv/',views.uploadCsv.as_view()),
    path('logout/',views.logout_user.as_view()),

    path('search_user/',views.adminuserView.as_view()),
    path('delete_user/',views.adminuserView.as_view()),
    path('edit_user/',views.adminuserView.as_view()),

    path('total_details/',views.total_details.as_view()),
    path('get_user_type/',views.user_type.as_view()),
    path('change_user_type/',views.user_type.as_view()),

    path('search_document/',views.SearchView.as_view()),
    path('upload_document/',views.upload_document.as_view()),
    path('get_document/',views.getDocDetails.as_view()),
    path('download_doc/',views.downloadDoc.as_view()),
    path('update_document/',views.getDocDetails.as_view()),
    path('get_faculty_doc/',views.GetFacultyDoc.as_view(),name="get_faculty_doc"),
    path('delete_document/',views.downloadDoc.as_view(),name="delete_document"),
    
    path('get_department/',views.deprtment_view.as_view()),
    path('add_department/',views.deprtment_view.as_view()),

    path('get_groups/',views.GroupView.as_view()),
    path('get_member_group/',views.MemberGroupView.as_view()),
    path('create_group/',views.GroupView.as_view()),
    path('delete_group/',views.GroupView.as_view()),
    path('add_group_documents/',views.GroupDocumentView.as_view()),
]