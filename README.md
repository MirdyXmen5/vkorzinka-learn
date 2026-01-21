# VK Learn Platform

## 🚀 How to Launch the Project

The project consists of two parts: Backend (Django) and Frontend (React). You need to run them in **two separate terminal windows**.

### 1. Backend (Django)
Open your first terminal and run:

```bash
cd backend
# Activate virtual environment (Windows)
.\venv\Scripts\activate
# Run server
python manage.py runserver
```
The server will start at `http://127.0.0.1:8000`.

### 2. Frontend (React)
Open your second terminal and run:

```bash
cd frontend
npm install  # Only needed the first time
npm run dev
```
The application will be available at `http://localhost:5173`.

---

## 🔑 Default Credentials
- **Admin Panel**: Accessible via the "Admin Panel" button in the header (if user is staff).
- **Users**: Use the provided login page.

### 3. Key Features
- **Video Player**: Unified player (Plyr) for YouTube, Vimeo, and MP4 files with mobile optimization.
- **Certificates**: 
  - Auto-generated PDF certificates upon course completion.
  - Users can enter a custom name for the certificate.
  - "Delete Certificate" option to manage profile.
  - "Retake Course" option to reset progress and earn a new certificate.
- **Course Content**:
  - Image Preview (Lightbox) for detailed viewing.
  - Document downloads.

## 🛠️ Troubleshooting
- **Images/Certificates 404**: Ensure the backend is running.
- **Connection Refused**: Check if `npm run dev` is actually running.
- **White Screen on Load**: Check browser console for JSON syntax errors in `locales` folder.
