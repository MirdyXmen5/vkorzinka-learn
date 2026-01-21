# 📘 VK Learn Project Architecture & Learning Guide

This document is designed to help you understand the technologies used in the project, how they interact, and how key features are implemented. It serves as a study guide for the entire stack.

---

## 🏗️ 1. Technology Stack

### 🎨 Frontend (Client Side)
Responsible for what the user sees and interacts with.
- **[React.js (v18)](https://react.dev/)**: The core library for building the user interface using components.
- **[Vite](https://vitejs.dev/)**: A modern build tool. It replaces Webpack/CRA. It's extremely fast and handles "Hot Module Replacement" (instant updates while coding).
- **[Tailwind CSS](https://tailwindcss.com/)**: A utility-first CSS framework. Instead of writing separate `.css` files, we use classes like `flex`, `p-4`, `text-center` directly in HTML.
- **[Axios](https://axios-http.com/)**: A library for making HTTP requests (GET, POST) to the backend. It's better than `fetch` because it handles JSON automatically and allows "interceptors" (see Auth section).
- **[React Router](https://reactrouter.com/)**: Manages navigation (e.g., switching from `/login` to `/courses`) without reloading the page (SPA - Single Page Application).
- **[i18next](https://www.i18next.com/)**: Handles translations (English, Russian, Kazakh).
- **[Plyr](https://github.com/sampotts/plyr)**: A unified, customizable media player for YouTube, Vimeo, and local files.

### ⚙️ Backend (Server Side)
Responsible for logic, database handling, and security.
- **[Django (v5)](https://www.djangoproject.com/)**: High-level Python web framework. It handles the database, URLs, and core logic.
- **[Django Rest Framework (DRF)](https://www.django-rest-framework.org/)**: An extension for Django to build **REST APIs**. It converts database models into JSON data for the React frontend.
- **[SimpleJWT](https://django-rest-framework-simplejwt.readthedocs.io/)**: Handles Authentication using JSON Web Tokens (JWT). Stateless and secure.
- **[ReportLab](https://www.reportlab.com/)**: A Python library used to programmatically generate PDF certificates.

### 💾 Infrastructure & DevOps
- **[Docker](https://www.docker.com/)**: "Containerizes" the application. It ensures the code runs exactly the same on your machine as it does on the server.
- **[Nginx](https://nginx.org/)**: A high-performance web server. In our Docker setup, it:
    1. Serves the React static files (`index.html`, `js`, `css`).
    2. Acts as a **Reverse Proxy**: Forwards `/api/` requests to Django.
- **[PostgreSQL](https://www.postgresql.org/)**: The production-grade relational database (replaced SQLite).

---

## 🔄 2. Architecture & Interaction

This is a **Decoupled Architecture**. The Frontend and Backend are separate applications that communicate via **API**.

```mermaid
graph TD
    User((User))
    Browser[Browser / React App]
    Nginx[Nginx Web Server]
    Django[Django Backend API]
    DB[(PostgreSQL Database)]
    Media[Media Files]

    User -->|Clicks Button| Browser
    Browser -->|HTTP Request (Axios)| Nginx
    Nginx -->|If path starts with /api| Django
    Nginx -->|If path is image/static| Media
    Django -->|Query Data| DB
    Django -->|JSON Response| Nginx
    Nginx -->|JSON Response| Browser
    Browser -->|Update UI| User
```

### How they talk (The "Handshake")
1.  **Request**: React sends a `GET /api/courses/` request. Use `Authorization: Bearer <token>` header if logged in.
2.  **Proxy**: Nginx receives it. Sees `/api/` prefix. Passes it to Django container on port 8000.
3.  **Processing**: Django checks credentials, queries Postgres for courses, serializes them to JSON.
4.  **Response**: Django sends JSON back. React receives it and maps it to components (`<CourseCard />`).

---

## 🔑 3. Key Feature Implementations

### A. Authentication Flow (JWT)
We don't use simple cookies. We use **Access** and **Refresh** tokens.

1.  **Login**:
    *   User enters credentials -> `POST /api/token/`.
    *   Backend checks DB. If correct, returns `access` (lives 60 mins) and `refresh` (lives 1 day) tokens.
    *   Frontend saves them in `localStorage`.
2.  **Auto-Attach Token**:
    *   See `frontend/src/api/axios.js`. An **Interceptor** automatically adds `Authorization: Bearer eyJ...` to every request.
3.  **Silent Refresh** (The "Magic" Part):
    *   If backend returns `401 Unauthorized` (Token expired), the **Response Interceptor** catches it.
    *   It silently sends the `refresh` token to `/api/token/refresh/`.
    *   If successful, it gets a new access token, retries the original failed request, and you never know you were logged out!

### B. Course Enrollment & Retake
*   **Models**: We rely on `UserCourseProgress`. It links a `User` to a `Course`.
*   **Enrollment**: When "Start" is clicked, we create this record.
*   **Retake**:
    *   **Frontend**: `handleRetake` in `CourseDetail.jsx`.
    *   **Backend**: `RetakeCourseView` finds the existing progress record and **resets** `is_completed=False`, `progress=0`. It keeps the record but clears the status.

### C. Certificate Generation
This is purely Python power (`backend/certificates/utils.py`).
1.  **Trigger**: User finishes course -> `POST /api/courses/{id}/complete/`.
2.  **Generation**:
    *   Django calls `_generate_certificate`.
    *   **ReportLab** draws on a canvas: Loads the background image, calculates center position for the name, sets font (supports Cyrillic via `registerFont`), and saves as PDF.
    *   File is saved to `media/certificates/`.
3.  **Delivery**: API returns the URL. Frontend shows a "Download" button.

### D. Image Preview (Lightbox)
Implemented in `CourseDetail.jsx`.
*   **State**: `const [previewImage, setPreviewImage] = useState(null);`
*   **Logic**:
    *   Clicking an image sets the state to the image URL.
    *   A full-screen `div` (`fixed inset-0 z-50`) conditionally renders if `previewImage` is not null.
    *   It uses `backdrop-blur` for the sleek effect.
    *   Clicking the backdrop calls `closePreview` (sets state to null).

---

## 📚 How to Study This Project
1.  **Frontend**: Start with `App.jsx` (Routes). Then look at `pages/CourseDetail.jsx` (it has the most logic: State, API, UI, Video, Modal).
2.  **API Layer**: Look at `api/axios.js`. This is the bridge between Front and Back.
3.  **Backend**:
    *   `urls.py`: The entry point.
    *   `views.py`: The logic (controllers).
    *   `serializers.py`: Converts Python Objects <-> JSON.

Good luck! 🚀
