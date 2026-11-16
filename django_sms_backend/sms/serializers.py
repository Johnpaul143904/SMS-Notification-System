# Validates incoming API data. Just Like DTO
from rest_framework import serializers
from .models import SMSMessage
import re


class SMSMessageSerializer(serializers.ModelSerializer):

    class Meta:
        model = SMSMessage

        fields = [
            'id',
            'recipient',
            'message',
            'sms_batch_id',
            'status',
            'error_message',
            'created_at',
            'updated_at',
        ]

        read_only_fields = [
            'id',
            'sms_batch_id',
            'status',
            'error_message',
            'created_at',
            'updated_at',
        ]

    def validate_recipient(self, value):

        value = value.strip() #remove spaces from the beginning and end of the string
        
        #This regex pattern matches international phone numbers that start with a '+' sign, followed by a country code (1-9), and then 7 to 14 digits.
        pattern = r'^\+[1-9]\d{7,14}$'  

        if not re.fullmatch(pattern, value):
            raise serializers.ValidationError(
                "Enter a valid international phone number."
            )

        return value

    def validate_message(self, value):

        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                "Message cannot be empty."
            )

        if len(value) > 160:
            raise serializers.ValidationError(
                "Message cannot exceed 160 characters."
            )

        return value