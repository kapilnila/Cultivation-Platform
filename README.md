👇

🐉 Wuxia Cultivation Platform (Full-Stack)

A full-stack web application inspired by Wuxia cultivation systems.
Users can register, track activities, and manage their cultivation progress through a modern web app powered by Django REST APIs.

🚀 Tech Stack
Backend

Django

Django REST Framework

JWT Authentication (SimpleJWT)

Frontend (in progress / planned)

Next.js / React

Database

SQLite (development)

PostgreSQL (production ready)

✨ Features

User Registration & Login

JWT Authentication (Access + Refresh tokens)

Cultivation Progress Tracking

Activity Tracking APIs

Modular Django App Architecture

Production-ready REST API structure

📂 Project Structure
project/
│
├── users/          → User authentication & profiles
├── cultivation/    → Cultivation progress logic
├── activities/     → Activity tracking APIs
└── config/         → Django project settings

🔗 API Endpoints
Authentication
POST /api/auth/login/       → Login & get JWT tokens
POST /api/auth/refresh/     → Refresh access token

Users
/api/users/

Cultivation
/api/cultivation/

Activities
/api/activities/

⚙️ Local Setup
1️⃣ Clone the repository
git clone https://github.com/kapilnila/Wuxia_prototype.git
cd Wuxia_prototype

2️⃣ Create virtual environment
python -m venv venv


Activate environment:

Windows

venv\Scripts\activate


Mac/Linux

source venv/bin/activate

3️⃣ Install dependencies
pip install -r requirements.txt

4️⃣ Apply migrations
python manage.py migrate

5️⃣ Run server
python manage.py runserver


Server will run at:

http://127.0.0.1:8000/

🔐 Authentication Flow

User logs in → receives Access Token + Refresh Token

Access token used for API requests

Refresh token used to generate new access tokens

📌 Future Improvements

Frontend integration (Next.js)

Deployment (AWS / Vercel / Docker)

Role-based permissions

AI story generation features

👨‍💻 Author

Kapil Nila
