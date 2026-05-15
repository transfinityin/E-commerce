from django.db import models
import uuid
from django.db import models
from django.conf import settings
from apps.products.models import Product
 
# Create your models here.
# ── Support Ticket ────────────────────────────────────────────
class SupportTicket(models.Model):
    STATUS_CHOICES   = [('open','Open'),('in_progress','In Progress'),('closed','Closed')]
    PRIORITY_CHOICES = [('low','Low'),('medium','Medium'),('high','High')]
 
    id         = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user       = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
                                   related_name='tickets')
    subject    = models.CharField(max_length=255)
    status     = models.CharField(max_length=20, choices=STATUS_CHOICES, default='open')
    priority   = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='medium')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
 
    class Meta:
        db_table = 'support_tickets'
        ordering = ['-created_at']
 
    def __str__(self):
        return f'#{str(self.id)[:8]} — {self.subject}'
 
 
class TicketMessage(models.Model):
    id        = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    ticket    = models.ForeignKey(SupportTicket, on_delete=models.CASCADE, related_name='messages')
    sender    = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    message   = models.TextField()
    sent_at   = models.DateTimeField(auto_now_add=True)
 
    class Meta:
        db_table = 'ticket_messages'
        ordering = ['sent_at']
 
 