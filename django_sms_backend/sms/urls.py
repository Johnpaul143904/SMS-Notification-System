# Defines API endpoints.
from django.urls import path
from .views import (
    SendSMSAPIView,
    SMSHistoryAPIView,
    TextBeeWebhookAPIView
)


urlpatterns = [

    path(
        'send/',
        SendSMSAPIView.as_view(),
        name='send-sms'
    ),

    path(
        'history/',
        SMSHistoryAPIView.as_view(),
        name='sms-history'
    ),
    
    path(
        'webhook/',
        TextBeeWebhookAPIView.as_view(),
        name='textbee-webhook'
    )

]