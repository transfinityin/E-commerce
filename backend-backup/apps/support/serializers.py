from rest_framework import serializers
from .models import SupportTicket, TicketMessage
from apps.users.serializers import UserSerializer


class TicketMessageSerializer(serializers.ModelSerializer):
    sender = UserSerializer(read_only=True)

    class Meta:
        model  = TicketMessage
        fields = ('id', 'sender', 'message', 'sent_at')
        read_only_fields = ('id', 'sender', 'sent_at')


class SupportTicketSerializer(serializers.ModelSerializer):
    messages = TicketMessageSerializer(many=True, read_only=True)
    user     = UserSerializer(read_only=True)

    class Meta:
        model  = SupportTicket
        fields = ('id', 'user', 'subject', 'status', 'priority', 'messages', 'created_at')
        read_only_fields = ('id', 'user', 'status', 'created_at')

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class SupportTicketListSerializer(serializers.ModelSerializer):
    class Meta:
        model  = SupportTicket
        fields = ('id', 'subject', 'status', 'priority', 'created_at')