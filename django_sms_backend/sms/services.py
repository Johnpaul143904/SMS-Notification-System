# Communicates with TextBee.
import requests
from django.conf import settings


class TextBeeAPIError(Exception):
    pass


def send_sms(recipient, message_body):

    api_key = settings.TEXTBEE_API_KEY
    base_url = settings.TEXTBEE_BASE_URL

    if not api_key:
        raise ValueError("TextBee API key is missing.")

    url = f"{base_url}/gateway/send-sms"

    headers = {
        "x-api-key": api_key,
        "Content-Type": "application/json"
    }

    payload = {
        "recipients": [recipient],
        "message": message_body
    }

    try:

        response = requests.post(
            url,
            headers=headers,
            json=payload,
            timeout=30
        )

        try:
            result = response.json()
        except ValueError:
            result = {}

        if not response.ok:
            raise TextBeeAPIError(
                f"TextBee returned HTTP {response.status_code}."
            )

        return result.get("data", {})

    except requests.RequestException as error:

        raise TextBeeAPIError(
            "Unable to connect to TextBee."
        ) from error