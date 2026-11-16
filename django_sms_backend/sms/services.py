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


    #Brings additional HTTP request, and we can put the API key in the headers for authentication.
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
        except ValueError as error:
            raise TextBeeAPIError(
                "TextBee returned an invalid JSON response."
            ) from error

        if not response.ok:
            raise TextBeeAPIError(
                f"TextBee returned HTTP {response.status_code}."
            )

        if not isinstance(result, dict):
            raise TextBeeAPIError("TextBee returned an unexpected response.")

        provider_data = result.get("data", result)
        if not isinstance(provider_data, dict):
            raise TextBeeAPIError("TextBee returned an unexpected response.")

        provider_success = provider_data.get(
            "success",
            result.get("success", True),
        )
        return {**provider_data, "success": provider_success}

    except requests.RequestException as error:

        raise TextBeeAPIError(
            "Unable to connect to TextBee."
        ) from error