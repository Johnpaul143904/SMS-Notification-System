import hashlib
import hmac
import json
import time

from django.conf import settings
from rest_framework.decorators import api_view

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


class TextBeeWebhookAPIView(APIView):

    permission_classes = [AllowAny]

    def post(self, request):

        # Verify TextBee signature
        secret = settings.TEXTBEE_WEBHOOK_SECRET
        signature = request.headers.get("X-Textbee-Signature", "")

        if not secret or not signature:
            return Response(
                {"success": False, "message": "Missing webhook signature."},
                status=status.HTTP_401_UNAUTHORIZED
            )

        try:
            parts = dict(
                item.strip().split("=", 1)
                for item in signature.split(",")
            )

            timestamp = parts.get("t")
            received_signature = parts.get("v1")

            if not timestamp or not received_signature:
                raise ValueError("Invalid signature format.")

            if abs(time.time() - int(timestamp)) > 300:
                raise ValueError("Expired signature.")

            expected_signature = hmac.new(
                secret.encode(),
                timestamp.encode() + b"." + request.body,
                hashlib.sha256
            ).hexdigest()

            if not hmac.compare_digest(
                expected_signature,
                received_signature
            ):
                raise ValueError("Invalid signature.")

        except (ValueError, TypeError):
            return Response(
                {"success": False, "message": "Invalid webhook signature."},
                status=status.HTTP_401_UNAUTHORIZED
            )

        # Read TextBee event
        try:
            event = json.loads(request.body)
        except json.JSONDecodeError:
            return Response(
                {"success": False, "message": "Invalid JSON."},
                status=status.HTTP_400_BAD_REQUEST
            )

        event_type = event.get("webhookEvent")
        batch_id = event.get("smsBatchId")
        recipient = event.get("recipient")

        status_mapping = {
            "MESSAGE_SENT": "sent",
            "MESSAGE_DELIVERED": "delivered",
            "MESSAGE_FAILED": "failed",
            "UNKNOWN_STATE": "unknown",
        }

        new_status = status_mapping.get(event_type)

        if not new_status:
            return Response({"success": True, "message": "Event ignored."})

        if not batch_id or not recipient:
            return Response(
                {"success": False, "message": "Missing SMS details."},
                status=status.HTTP_400_BAD_REQUEST
            )

        sms = SMSMessage.objects.filter(
            sms_batch_id=batch_id,
            recipient=recipient
        ).first()

        if not sms:
            return Response({
                "success": True,
                "message": "No matching SMS record found."
            })

        # Do not downgrade a final status
        if sms.status not in ["delivered", "failed"]:
            sms.status = new_status

            if new_status == "failed":
                sms.error_message = event.get(
                    "errorMessage",
                    "TextBee reported SMS delivery failure."
                )

            sms.save()

        return Response({
            "success": True,
            "message": "SMS status updated.",
            "status": sms.status
        })
