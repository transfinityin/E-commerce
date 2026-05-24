from django.urls import path
from .views import NotificationListView, MarkReadView, MarkAllReadView, UnreadCountView

urlpatterns = [
    path('',                    NotificationListView.as_view()),
    path('unread-count/',       UnreadCountView.as_view()),
    path('mark-all-read/',      MarkAllReadView.as_view()),
    path('<uuid:pk>/read/',     MarkReadView.as_view()),
]