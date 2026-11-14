from django.shortcuts import render

# Create your views here. Processes API requests.
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny

from .models import SMSMessage
from .serializers import SMSMessageSerializer
from .services import send_sms, TextBeeAPIError


class SendSMSAPIView(APIView):

    permission_classes = [AllowAny]

    def post(self, request):

        serializer = SMSMessageSerializer(data=request.data)

        if not serializer.is_valid():

            return Response({
                "success": False,
                "message": "Validation failed.",
                "errors": serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)

        sms = serializer.save(status='pending')

        try:

            result = send_sms(
                sms.recipient,
                sms.message
            )

            if not result.get("success", False):

                sms.status = 'failed'
                sms.error_message = "TextBee did not accept the SMS."
                sms.save()

                return Response({
                    "success": False,
                    "message": "TextBee did not accept the SMS."
                }, status=status.HTTP_502_BAD_GATEWAY)

            sms.sms_batch_id = result.get("smsBatchId")
            sms.save()

            return Response({
                "success": True,
                "message": "SMS successfully submitted to TextBee.",
                "data": SMSMessageSerializer(sms).data,
                "provider": result
            }, status=status.HTTP_201_CREATED)

        except TextBeeAPIError:

            sms.status = 'failed'
            sms.error_message = "TextBee API request failed."
            sms.save()

            return Response({
                "success": False,
                "message": "Unable to send SMS through TextBee."
            }, status=status.HTTP_502_BAD_GATEWAY)

        except Exception:

            sms.status = 'failed'
            sms.error_message = "Unexpected sending error."
            sms.save()

            return Response({
                "success": False,
                "message": "An unexpected server error occurred."
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class SMSHistoryAPIView(APIView):

    permission_classes = [AllowAny]

    def get(self, request):

        messages = SMSMessage.objects.all().order_by('-created_at')

        serializer = SMSMessageSerializer(
            messages,
            many=True
        )

        return Response({
            "success": True,
            "count": messages.count(),
            "data": serializer.data
        }, status=status.HTTP_200_OK)