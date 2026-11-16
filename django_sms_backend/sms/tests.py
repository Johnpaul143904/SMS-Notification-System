from unittest.mock import Mock, patch

from django.test import SimpleTestCase, override_settings
from rest_framework.test import APITestCase

from .services import TextBeeAPIError, send_sms


@override_settings(
    TEXTBEE_API_KEY="test-key",
    TEXTBEE_BASE_URL="https://api.textbee.test/api/v1",
)
class SendSMSTests(SimpleTestCase):
    @patch("sms.services.requests.post")
    def test_successful_http_response_is_reported_as_accepted(self, post):
        response = Mock()
        response.ok = True
        response.json.return_value = {"data": {"smsBatchId": "batch-123"}}
        post.return_value = response

        result = send_sms("+639123456789", "Hello")

        self.assertEqual(
            result,
            {"success": True, "smsBatchId": "batch-123"},
        )
        post.assert_called_once()

    @patch("sms.services.requests.post")
    def test_provider_rejection_is_not_reported_as_success(self, post):
        response = Mock()
        response.ok = True
        response.json.return_value = {
            "success": False,
            "data": {"smsBatchId": "batch-123"},
        }
        post.return_value = response

        result = send_sms("+639123456789", "Hello")

        self.assertFalse(result["success"])

    @patch("sms.services.requests.post")
    def test_non_success_http_response_raises_provider_error(self, post):
        response = Mock()
        response.ok = False
        response.status_code = 503
        response.json.return_value = {"message": "Unavailable"}
        post.return_value = response

        with self.assertRaises(TextBeeAPIError):
            send_sms("+639123456789", "Hello")


class SMSAPITests(APITestCase):
    @patch(
        "sms.views.send_sms",
        return_value={"success": True, "smsBatchId": "batch-123"},
    )
    def test_send_endpoint_stores_pending_record_and_history_returns_it(self, send):
        response = self.client.post(
            "/api/sms/send/",
            {"recipient": "+639123456789", "message": "Hello"},
            format="json",
        )

        self.assertEqual(response.status_code, 201)
        self.assertTrue(response.data["success"])
        self.assertEqual(response.data["data"]["status"], "pending")
        self.assertEqual(response.data["data"]["sms_batch_id"], "batch-123")
        send.assert_called_once_with("+639123456789", "Hello")

        history = self.client.get("/api/sms/history/")
        self.assertEqual(history.status_code, 200)
        self.assertEqual(history.data["count"], 1)
        self.assertEqual(history.data["data"][0]["recipient"], "+639123456789")
        self.assertEqual(history.data["data"][0]["status"], "pending")

    @patch("sms.views.send_sms")
    def test_send_endpoint_rejects_messages_over_160_characters(self, send):
        response = self.client.post(
            "/api/sms/send/",
            {"recipient": "+639123456789", "message": "x" * 161},
            format="json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertFalse(response.data["success"])
        send.assert_not_called()

    @patch("sms.views.send_sms", return_value={"success": False})
    def test_provider_rejection_returns_error_and_marks_record_failed(self, send):
        response = self.client.post(
            "/api/sms/send/",
            {"recipient": "+639123456789", "message": "Hello"},
            format="json",
        )

        self.assertEqual(response.status_code, 502)
        self.assertFalse(response.data["success"])
        self.assertEqual(response.data["message"], "TextBee did not accept the SMS.")
        history = self.client.get("/api/sms/history/")
        self.assertEqual(history.data["data"][0]["status"], "failed")
