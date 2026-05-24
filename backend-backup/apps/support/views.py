from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import SupportTicket, TicketMessage
from .serializers import SupportTicketSerializer, SupportTicketListSerializer, TicketMessageSerializer
from apps.users.permissions import IsAdmin


class TicketListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        return SupportTicketSerializer if self.request.method == 'POST' else SupportTicketListSerializer

    def get_queryset(self):
        return SupportTicket.objects.filter(user=self.request.user)


class TicketDetailView(generics.RetrieveAPIView):
    serializer_class   = SupportTicketSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return SupportTicket.objects.filter(user=self.request.user)


class TicketReplyView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            ticket = SupportTicket.objects.get(pk=pk, user=request.user)
        except SupportTicket.DoesNotExist:
            return Response({'error': 'Ticket not found.'}, status=404)

        message = request.data.get('message', '').strip()
        if not message:
            return Response({'error': 'Message required.'}, status=400)

        msg = TicketMessage.objects.create(ticket=ticket, sender=request.user, message=message)
        return Response(TicketMessageSerializer(msg).data, status=201)


# Admin
class AdminTicketListView(generics.ListAPIView):
    serializer_class   = SupportTicketSerializer
    permission_classes = [IsAdmin]
    queryset           = SupportTicket.objects.all().select_related('user')


class AdminTicketUpdateView(APIView):
    permission_classes = [IsAdmin]

    def patch(self, request, pk):
        try:
            ticket = SupportTicket.objects.get(pk=pk)
        except SupportTicket.DoesNotExist:
            return Response({'error': 'Not found.'}, status=404)

        ticket.status   = request.data.get('status',   ticket.status)
        ticket.priority = request.data.get('priority', ticket.priority)
        ticket.save()

        # Admin reply
        message = request.data.get('message', '').strip()
        if message:
            TicketMessage.objects.create(ticket=ticket, sender=request.user, message=message)

        return Response(SupportTicketSerializer(ticket, context={'request': request}).data)