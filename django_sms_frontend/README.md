# SMS Notification System

The frontend uses plain HTML, CSS, and JavaScript. It sends SMS requests to the Django REST API; Django communicates with TextBee and stores SMS transaction records in its database. The browser does not call TextBee directly and does not keep SMS history or API credentials in local storage.

## Run locally

1. In `django_sms_backend`, create a `.env` file using `.env.example` as a guide. Set `SECRET_KEY`, `DEBUG=True`, and `TEXTBEE_API_KEY`; keep the TextBee key in this backend-only file.
2. From `django_sms_backend`, apply migrations and start Django:

   ```powershell
   .\venv\Scripts\python.exe manage.py migrate
   .\venv\Scripts\python.exe manage.py runserver 127.0.0.1:8000
   ```

3. Open `django_sms_frontend\index.html` with VS Code Live Server. Its default port, `5500`, is allowed by the Django CORS settings.
4. Send a test SMS to a valid international number, for example `+639123456789`. A Philippine local number such as `09123456789` is normalized to `+639123456789` before it is sent to Django.
5. Confirm the result in the page and refresh the history table. History comes from `GET /api/sms/history/`; a successful send refreshes it automatically.

The frontend calls:

- `POST http://127.0.0.1:8000/api/sms/send/`
- `GET http://127.0.0.1:8000/api/sms/history/`

The status shown in the history table is the status returned by Django. In particular, `pending` and `dispatched` are not shown as delivered. The backend currently has no delete endpoint, so history deletion is not offered in the UI.

## Test failure paths

- Submit an invalid phone number, an empty message, or a message longer than 160 characters; client-side validation should prevent the request.
- Stop Django and try sending or refreshing history; the page should show a connection error, not a success notification.
- Restart Django and refresh history; records already stored in the database should load.
- A `pending` status means the backend has not reported delivery. Delivery updates require a TextBee status callback/webhook or another backend reconciliation mechanism; none is currently implemented.
