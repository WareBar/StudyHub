# 📚 StudyHub

> A collaborative learning platform where learners connect, study together, and grow.

---

## 🌟 Overview

StudyHub is a full-stack web application that brings learners together through shared study groups, real-time communication, and structured sessions. Whether you're preparing for exams, learning a new skill, or building study habits — StudyHub gives you the tools to do it together.

---

## ✨ Features

- 🏫 **Study Groups** — Create or join groups organized around topics, courses, or goals
- 💬 **Real-Time Chat** — Group messaging powered by WebSockets for instant communication
- 📹 **Video Rooms** — Built-in video calling for live study sessions
- 📅 **Session Scheduling** — Plan and manage study sessions with availability grids and schedule pickers
- 🔔 **Notifications** — Stay updated on group activity, invites, and session reminders
- 📊 **Analytics & Leaderboards** — Track progress and see how you stack up with your peers
- 🔗 **Resource Sharing** — Share and access study materials within your groups
- 👤 **User Profiles** — Customize your profile and manage your memberships

---

## 🛠️ Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| **Django** | Web framework & REST API |
| **Django REST Framework** | API serialization & views |
| **Django Channels** | WebSocket support for real-time chat & notifications |
| **SQLite** | Development database |

### Frontend
| Technology | Purpose |
|---|---|
| **React + TypeScript** | UI framework |
| **Vite** | Build tool & dev server |
| **Tailwind CSS** | Utility-first styling |
| **shadcn/ui** | Component library |
| **React Query** | Server state management |
| **React Router** | Client-side routing |

---

## 📁 Project Structure

```
StudyHub/
├── backend/
│   ├── User/           # Authentication, user profiles, avatar management
│   ├── study/          # Study groups, sessions, memberships, attendance
│   ├── chat/           # Real-time group chat via WebSockets
│   ├── notification/   # In-app notification system
│   ├── core/           # Shared utilities, mixins, pagination, base models
│   └── backend/        # Django project settings & configuration
│
└── frontend/
    └── src/
        ├── components/ # Reusable UI components (cards, dialogs, navigation)
        ├── pages/      # Route-level page components
        ├── hooks/      # Custom React hooks (study groups, sessions, memberships)
        ├── context/    # Auth and toast context providers
        ├── routes/     # Protected and guest route guards
        ├── types/      # TypeScript interfaces and API types
        └── utils/      # API client and time utilities
```

---

## 🚀 Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+
- npm or yarn

---

### Backend Setup

```bash
# Navigate to the backend directory
cd backend

# Create and activate a virtual environment
python -m venv venv
source venv/bin/activate        # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Apply database migrations
python manage.py migrate

# Create a superuser (optional)
python manage.py createsuperuser

# Start the development server
python manage.py runserver
```

The backend will be available at `http://localhost:8000`.

---

### Frontend Setup

```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will be available at `http://localhost:5173`.

---

## 🔌 Real-Time Features

StudyHub uses **Django Channels** with WebSockets for real-time functionality:

- **Chat** — Messages are pushed instantly to all members of a group
- **Notifications** — Users receive live updates without refreshing the page

Make sure your Django server is running with an ASGI server (e.g., `daphne` or `uvicorn`) in production to support WebSocket connections.

---

## 📐 Database Schema

The database schema is documented in `backend/db.dbml` and can be visualized using [dbdiagram.io](https://dbdiagram.io).

Key models:
- `User` / `Profile` — Extended user model with avatar and profile info
- `StudyGroup` — Core group entity with membership management
- `Membership` — User-to-group relationship with roles and status
- `Session` / `Attendance` — Scheduled study sessions and participant tracking
- `ChatGroup` / `Message` — Real-time messaging entities
- `Notification` — Event-driven notification records

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m "feat: add your feature"`
4. Push to your branch: `git push origin feature/your-feature-name`
5. Open a Pull Request

---

## 📄 License

This project is for educational purposes. See `LICENSE` for details.

---

<div align="center">
  Built with ❤️ for learners, by learners.
</div>