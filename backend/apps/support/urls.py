from django.urls import path
from .views import (
    TicketListCreateView, TicketDetailView, TicketReplyView,
    AdminTicketListView, AdminTicketUpdateView,
)

urlpatterns = [
    path('',                    TicketListCreateView.as_view()),
    path('<uuid:pk>/',          TicketDetailView.as_view()),
    path('<uuid:pk>/reply/',    TicketReplyView.as_view()),
    path('admin/',              AdminTicketListView.as_view()),
    path('admin/<uuid:pk>/',    AdminTicketUpdateView.as_view()),
]