# SMS Notification System using Django, Nuxt.js, and TextBee

## 1. Project Description

The **SMS Notification System** is a web-based application that allows users to send SMS messages using a recipient's mobile phone number.

The system uses **Nuxt.js** as the frontend, **Django REST Framework** as the backend, and **TextBee** as the SMS gateway provider. The backend processes and validates SMS requests before forwarding them to TextBee, which sends the messages through a registered Android device with an active SIM card.

The main purpose of this project is to provide a simple and convenient way to send SMS messages through a web application.

## 2. Group Members and Responsibilities

| Group Member | Assigned Responsibility |
|---|---|
| [John Paul M. Toyco] | Backend Development (Django REST Framework), TextBee API Integration|
| [Jannie Ugay] | Frontend Development (Nuxt.js) |
| [Jamaya Reyes] | Testing and Documentation |

## 3. Main Features

- **Send SMS:** Allows users to send SMS messages to mobile phone numbers.
- **Phone Number Validation:** Checks whether the recipient number follows the required international phone number format.
- **Message Validation:** Prevents users from submitting empty messages.
- **TextBee Integration:** Uses the TextBee API to send SMS messages through an Android device.
- **SMS History:** Stores sent SMS requests in the Django database.
- **API Communication:** Provides REST API endpoints for frontend and backend communication.
- **Error Handling:** Displays appropriate messages when validation or SMS sending fails.

## 4. Technologies and Dependencies Used

### Frontend
- Nuxt.js
- Vue.js
- JavaScript
- HTML
- CSS

### Backend
- Python
- Django
- Django REST Framework
- SQLite

### SMS Gateway
- TextBee API
- Android device with an active SIM card

### Python Dependencies

| Package | Purpose |
|---|---|
| Django | Backend web framework |
| djangorestframework | Creating REST APIs |
| requests | Sending HTTP requests to TextBee |
| python-dotenv | Managing environment variables |
| django-cors-headers | Allowing frontend and backend communication |

## 5. Installation and Setup Instructions

### Prerequisites

Before installing the application, make sure you have:

- Python installed
- Node.js and npm installed
- Git installed
- A TextBee account
- An Android phone with an active SIM card
- Internet connection

### A. Clone the Repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
```

Navigate to the project folder:

```bash
cd SMS-PROJECT
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

```bash
venv\Scripts\activate
```

Install the required dependencies:

```bash
pip install -r requirements.txt
```

Create the Django project and application only if they have not already been created:

```bash
python -m django startproject config .
python manage.py startapp sms
```

Run database migrations:

```bash
python manage.py makemigrations
python manage.py migrate
```

### C. Set Up the Nuxt.js Frontend

Open another terminal and navigate to the frontend folder:

```bash
cd sms-frontend
```

Install the frontend dependencies:

```bash
npm install
```

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

### D. Configure Environment Variables

Inside the Django backend folder, create a `.env` file:

```env
SECRET_KEY=your_django_secret_key
DEBUG=True

TEXTBEE_API_KEY=your_textbee_api_key
TEXTBEE_BASE_URL=https://api.textbee.dev/api/v1
```

Replace the placeholder values with your actual credentials.

**Important:** Never upload your `.env` file or expose your TextBee API key on GitHub or in the frontend source code.

## 7. Instructions for Running the Application

Both the Django backend and Nuxt.js frontend must be running.

### A. Run the Django Backend

Open a terminal:

```bash
cd django_sms_backend
```

Activate the virtual environment:

```bash
venv\Scripts\activate
```

Start the Django development server:

```bash
python manage.py runserver
```

The backend will be available at:

```text
http://127.0.0.1:8000/
```

### B. Run the Nuxt.js Frontend

Open another terminal:

```bash
cd sms-frontend
```

Start the Nuxt development server:

```bash
npm run dev
```

The frontend will be available at:

```text
http://localhost:3000/
```

### C. Using the Application

1. Open the frontend in your browser.
2. Enter the recipient's mobile number using international format (example: +639XXXXXXXXX).
3. Enter the SMS message.
4. Click the Send SMS button.
5. Wait for the backend to process the request.
6. Check the response displayed by the application.
7. View the SMS History section to see recorded SMS requests.

## 8. API Endpoints

The Django backend provides the following REST API endpoints:

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/sms/send/` | Sends an SMS through TextBee |
| GET | `/api/sms/history/` | Retrieves SMS history |

### Example POST Request

URL:

```text
http://127.0.0.1:8000/api/sms/send/
```

Request Body:

```json
{
  "recipient": "+639XXXXXXXXX",
  "message": "Hello! This is a test message."
}
```

### Expected Response

```json
{
  "success": true,
  "message": "SMS successfully submitted to TextBee."
}
```

*The actual response also includes the saved SMS record and provider response.*

## 9. Testing Procedures and Results

The application should be tested to ensure that the frontend, backend, database, and TextBee integration work correctly.

| Test Case | Procedure | Expected Result | Actual Result |
|---|---|---|---|
| Valid SMS | Enter a valid phone number and message, then click Send SMS. | SMS request is accepted by TextBee. | [To be completed] |
| Empty Recipient | Leave the recipient field empty. | Validation error is displayed. | [To be completed] |
| Empty Message | Leave the message field empty. | Validation error is displayed. | [To be completed] |
| Invalid Phone Number | Enter an invalid phone number. | Phone number validation error is displayed. | [To be completed] |
| SMS History | Open the SMS History section. | Previously recorded SMS requests are displayed. | [To be completed] |
| Backend Connection | Stop the Django server and try sending an SMS. | Connection error is displayed. | [To be completed] |
| TextBee Connection | Test with an invalid API key or unavailable provider. | SMS sending error is handled. | [To be completed] |

### Testing Tools

- Browser: Testing the Nuxt.js frontend.
- Postman: Testing Django REST API endpoints.
- Django Admin: Checking stored SMS records.
- TextBee Dashboard and Android App: Checking SMS requests and device activity.

### Testing Summary

[Write your actual testing summary here after completing the tests. Include whether SMS sending, validation, SMS history, and frontend-backend communication worked successfully.]

## 10. Known Limitations

The application has the following limitations:

- An Android device with an active SIM card is required to send SMS messages through TextBee.
- The Android device must have an internet connection.
- SMS sending depends on the availability of the TextBee service and mobile network.
- A successful API response means the SMS request was accepted or queued, not necessarily delivered.
- SMS delivery may be delayed because of network conditions.
- The current application uses basic access permissions and should be improved with authentication before public deployment.
- The application currently provides basic SMS sending and history features. Advanced delivery tracking and reporting may be added in future improvements.

## 11. Security Reminders

- Keep the TextBee API key inside the Django `.env` file.
- Do not expose API credentials in frontend code.
- Do not upload `.env` to GitHub.
- Use `.env.example` to show the required environment variable names without exposing actual credentials.
- Add authentication and proper authorization before deploying the application publicly.

## 12. Conclusion

The SMS Notification System demonstrates how a frontend application can communicate with a backend REST API and integrate with an external SMS gateway.

By using Nuxt.js, Django REST Framework, and TextBee, the project provides a simple system for sending SMS messages, validating user inputs, and recording SMS requests in a database.

This project also demonstrates the use of API integration and frontend-backend communication in web application development.
