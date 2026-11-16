from django.db import models

# Create your models here. Database structure.
class SMSMessage(models.Model):

    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('dispatched', 'Dispatched'),
        ('sent', 'Sent'),
        ('delivered', 'Delivered'),
        ('failed', 'Failed'),
        ('unknown', 'Unknown'),
    ]

    recipient = models.CharField(max_length=20) #This could store the phone number as the recipient.

    message = models.TextField()

    sms_batch_id = models.CharField(
        max_length=100,
        blank=True,
        null=True
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending'
    )

    error_message = models.TextField(
        blank=True,
        null=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    def __str__(self):
        return f"{self.recipient} - {self.status}"