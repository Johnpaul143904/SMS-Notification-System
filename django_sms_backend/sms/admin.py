from django.contrib import admin

# Register your models here.
from .models import SMSMessage


@admin.register(SMSMessage)
class SMSMessageAdmin(admin.ModelAdmin):

    list_display = (
        'id',
        'recipient',
        'sms_batch_id',
        'status',
        'created_at'
    )

    list_filter = ('status', 'created_at')

    search_fields = ('recipient', 'sms_batch_id')

    readonly_fields = (
        'created_at',
        'updated_at'
    )