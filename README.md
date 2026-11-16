# SMS Notification System Using Django REST Framework and TextBee

## 1. Project Description

The **SMS Notification System** is a web-based application that allows users to send SMS messages using a recipient's mobile phone number.

The system uses **HTML, CSS, and JavaScript** for the frontend, **Django REST Framework** for the backend, and **TextBee** as the SMS gateway provider.

The Django backend processes and validates SMS requests before forwarding them to TextBee. TextBee sends the messages through a registered Android device with an active SIM card.

The system also stores SMS records in a database and provides an API endpoint for retrieving message history. A webhook integration is included to receive SMS status updates from TextBee.

The main purpose of this project is to provide a simple and convenient way to send SMS messages through a web application.

## 2. Group Members and Responsibilities

| Group Member | Assigned Responsibility |
|---|---|
| John Paul M. Toyco | Backend Development (Django REST Framework) and TextBee API Integration |
| Jannie Ugay | Frontend Development (HTML, CSS, and JavaScript) |
| Jamaya Reyes | Testing and Documentation |

## 3. Main Features

- **Send SMS:** Allows users to send SMS messages to mobile phone numbers.
- **Phone Number Validation:** Checks whether the recipient number follows the required international phone number format.
- **Message Validation:** Prevents users from submitting empty messages.
- **TextBee Integration:** Uses the TextBee API to send SMS messages through an Android device.
- **SMS History:** Stores SMS requests and their corresponding information in the Django database.
- **SMS Status Tracking:** Uses TextBee webhooks to receive message status updates.
- **API Communication:** Provides REST API endpoints for frontend and backend communication.
- **Error Handling:** Displays appropriate messages when validation or SMS sending fails.

## 4. Technologies and Dependencies Used

### Frontend
- HTML
- CSS
- JavaScript

### Backend
- Python
- Django
- Django REST Framework
- SQLite

### SMS Gateway
- TextBee API
- TextBee Android Application
- Android device with an active SIM card

### Deployment
- Git and GitHub
- Render

### Python Dependencies

| Package | Purpose |
|---|---|
| Django | Backend web framework |
| djangorestframework | Creating REST APIs |
| requests | Sending HTTP requests to TextBee |
| python-dotenv | Managing environment variables |
| django-cors-headers | Allowing frontend and backend communication |
| gunicorn | Running the Django application in production |

## 5. Installation and Setup Instructions

### Prerequisites

Before installing the application, make sure you have:

- Python installed
- Git installed
- A TextBee account
- An Android phone with an active SIM card
- Internet connection

### A. Clone the Repository

Clone the GitHub repository:

```bash
git clone https://github.com/Johnpaul143904/SMS-Notification-System.git
```

Navigate to the project folder:

```bash
cd SMS-Notification-System
```

### B. Set Up the Django Backend

Navigate to the backend folder:

```bash
cd django_sms_backend
```

Create a virtual environment:

```bash
python -m venv venv
```

Activate the virtual environment on Windows:

```powershell
venv\Scripts\activate
```

Install the required dependencies:

```bash
pip install -r requirements.txt
```

Run database migrations:

```bash
python manage.py migrate
```

### C. Configure Environment Variables

Inside the Django backend folder, create a `.env` file.

Example:

```env
SECRET_KEY=your_django_secret_key
DEBUG=True
ALLOWED_HOSTS=127.0.0.1,localhost

TEXTBEE_API_KEY=your_textbee_api_key
TEXTBEE_BASE_URL=https://api.textbee.dev/api/v1

TEXTBEE_WEBHOOK_SECRET=your_webhook_signing_secret
```

Replace the placeholder values with your actual credentials.

**Important:** Never upload your `.env` file or expose your API key and webhook signing secret on GitHub.

## 6. SMS Provider Configuration (TextBee)

The application uses TextBee as its SMS gateway provider.

### A. Create a TextBee Account

1. Visit https://app.textbee.dev/.
2. Create an account.
3. Verify your email address.
4. Log in to your TextBee dashboard.

### B. Register an Android Device

1. Download the TextBee Android application from https://textbee.dev/download.
2. Open the application.
3. Register your device using the instructions in the TextBee dashboard.
4. Grant the required SMS and other requested permissions.
5. Make sure the Android device has an active SIM card and internet connection.

### C. Generate an API Key

1. Open the TextBee dashboard.
2. Navigate to the API Keys section.
3. Generate an API key.
4. Copy the API key and keep it private.
5. Configure the API key in the Django `.env` file.

### D. Configure TextBee Webhook

The webhook allows TextBee to send SMS status updates to the Django backend.

1. Open the TextBee dashboard.
2. Navigate to the Webhooks section.
3. Create a new webhook.
4. Configure the delivery URL:

```text
https://sms-notification-system.onrender.com/api/sms/webhook/
```

5. Configure the signing secret. It must match the `TEXTBEE_WEBHOOK_SECRET` value in the Render environment variables.
6. Select the following events:

- MESSAGE_SENT
- MESSAGE_DELIVERED
- MESSAGE_FAILED

7. Save the webhook configuration.

The Django webhook endpoint receives the events and updates the corresponding SMS record when a matching message is found.

## 7. Instructions for Running the Application Locally

Both the Django backend and frontend must be running.

### A. Run the Django Backend

Open a terminal:

```powershell
cd "A:\IT 120\TEXTBEE\django_sms_backend"
```

Activate the virtual environment:

```powershell
.\venv\Scripts\activate
```

Start the Django development server:

```powershell
python manage.py runserver
```

The backend will be available at:

```text
http://127.0.0.1:8000/
```

### B. Run the Frontend

Open another terminal and navigate to the project root:

```powershell
cd "A:\IT 120\TEXTBEE"
```

Start the frontend server:

```powershell
py -m http.server 5001 --bind 127.0.0.1 --directory "A:\IT 120\TEXTBEE"
```

Open the frontend in your browser:

```text
http://127.0.0.1:5001/django_sms_frontend/index.html
```

### C. Configure the Frontend API URL

For local development, the frontend should use:

```javascript
const API_BASE_URL = 'http://127.0.0.1:8000/api/sms/';

const SEND_SMS_URL = `${API_BASE_URL}send/`;
const HISTORY_URL = `${API_BASE_URL}history/`;
```

For the deployed application, use:

```javascript
const API_BASE_URL = 'https://sms-notification-system.onrender.com/api/sms/';

const SEND_SMS_URL = `${API_BASE_URL}send/`;
const HISTORY_URL = `${API_BASE_URL}history/`;
```

Use the appropriate API URL depending on whether you are testing locally or using the deployed backend.

### D. Using the Application

1. Open the frontend in your browser.
2. Enter the recipient's mobile number using international format (example: `+639XXXXXXXXX`).
3. Enter the SMS message.
4. Click the Send SMS button.
5. Wait for the backend to process the request.
6. Check the response displayed by the application.
7. View the SMS History section to see recorded SMS requests and their statuses.

## 8. API Endpoints

The Django backend provides the following REST API endpoints:

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/sms/send/` | Sends an SMS through TextBee |
| GET | `/api/sms/history/` | Retrieves SMS history |
| POST | `/api/sms/webhook/` | Receives SMS status updates from TextBee |

### A. Send SMS

Request URL:

```text
http://127.0.0.1:8000/api/sms/send/
```

Request Method:

```text
POST
```

Request Body:

```json
{
  "recipient": "+639XXXXXXXXX",
  "message": "Hello! This is a test message."
}
```

Expected Response:

```json
{
  "success": true,
  "message": "SMS successfully submitted to TextBee.",
  "data": {
    "id": 1,
    "recipient": "+639XXXXXXXXX",
    "message": "Hello! This is a test message.",
    "sms_batch_id": "example_batch_id",
    "status": "pending"
  }
}
```

The actual response also includes the saved SMS record and provider response.

### B. Retrieve SMS History

Request URL:

```text
http://127.0.0.1:8000/api/sms/history/
```

Request Method:

```text
GET
```

This endpoint retrieves the previously recorded SMS requests from the Django database.

### C. Receive SMS Status Updates

Webhook URL:

```text
https://sms-notification-system.onrender.com/api/sms/webhook/
```

Request Method:

```text
POST
```

This endpoint receives webhook events from TextBee and updates the corresponding SMS record based on the reported event.

## 9. Deployment

The Django backend is deployed using Render and connected to the GitHub repository.

### Backend Deployment

Deployment URL:

```text
https://sms-notification-system.onrender.com/
```

The backend deployment uses:

**Build Command:**

```bash
pip install -r requirements.txt
```

**Start Command:**

```bash
python manage.py migrate && gunicorn config.wsgi:application
```

### Environment Variables on Render

Configure the following environment variables in the Render dashboard:

- `SECRET_KEY`
- `DEBUG=False`
- `ALLOWED_HOSTS=sms-notification-system.onrender.com`
- `TEXTBEE_API_KEY`
- `TEXTBEE_BASE_URL`
- `TEXTBEE_WEBHOOK_SECRET`

The frontend communicates with the deployed Django backend using its Render API URL.

## 10. Testing Procedures and Results

The application should be tested to ensure that the frontend, backend, database, and TextBee integration work correctly.

| Test Case | Procedure | Expected Result | Actual Result |
|---|---|---|---|
| Valid SMS | Enter a valid phone number and message, then click Send SMS. | SMS request is accepted by TextBee. | To be completed |
| Empty Recipient | Leave the recipient field empty. | Validation error is displayed. | To be completed |
| Empty Message | Leave the message field empty. | Validation error is displayed. | To be completed |
| Invalid Phone Number | Enter an invalid phone number. | Phone number validation error is displayed. | To be completed |
| SMS History | Open the SMS History section. | Previously recorded SMS requests are displayed. | To be completed |
| Backend Connection | Stop the Django server and try sending an SMS. | Connection error is displayed. | To be completed |
| TextBee Connection | Test with an invalid API key or unavailable provider. | SMS sending error is handled. | To be completed |
| Webhook Integration | Send an SMS and check the webhook delivery logs. | TextBee sends a status update to Django. | To be completed |

### Testing Tools

- **Browser:** Testing the frontend.
- **Postman:** Testing Django REST API endpoints.
- **Django Admin:** Checking stored SMS records.
- **TextBee Dashboard:** Checking API and webhook activity.
- **Android Device:** Checking received SMS messages.
- **Render Dashboard:** Monitoring backend deployment and application logs.

### Testing Summary

Complete this section after performing all tests.

Include whether SMS sending, input validation, SMS history, frontend-backend communication, and webhook status updates worked successfully.

## 11. Known Limitations

The application has the following limitations:

- An Android device with an active SIM card is required to send SMS messages through TextBee.
- The Android device must have an internet connection.
- SMS sending depends on the availability of the TextBee service and mobile network.
- A successful API response means the SMS request was accepted or queued, not necessarily delivered.
- SMS delivery may be delayed because of network conditions.
- Delivery status updates depend on TextBee webhook events and carrier delivery reports.
- Not all mobile networks provide delivery reports.
- The current application uses basic access permissions and should be improved with authentication before public deployment.
- SQLite is currently used for database storage. A persistent production database is recommended for long-term deployment.

## 12. Security Reminders

- Keep the TextBee API key inside the Django `.env` file.
- Do not expose API credentials in frontend code.
- Do not upload `.env` to GitHub.
- Use `.env.example` to show the required environment variable names without exposing actual credentials.
- Keep the webhook signing secret private.
- Use authentication and proper authorization before making the application publicly available.

## 13. Conclusion

The SMS Notification System demonstrates how a frontend application can communicate with a backend REST API and integrate with an external SMS gateway.

By using HTML, CSS, JavaScript, Django REST Framework, and TextBee, the project provides a simple system for sending SMS messages, validating user inputs, and recording SMS requests in a database.

The integration of TextBee webhooks also provides a way to receive message status updates from the SMS provider.

Overall, this project demonstrates practical knowledge of frontend and backend development, REST API integration, database operations, external service communication, and web application deployment.