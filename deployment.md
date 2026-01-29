# 🚀 Hosting & Deployment Guide

This guide describes how to deploy the LEARN portal to a production server using Docker.

## 🏗️ Technology Stack
- **Frontend**: React + Vite (Served by Nginx)
- **Backend**: Django (Gunicorn + Whitenoise/Static serving)
- **Database**: PostgreSQL (Dockerized)
- **Orchestration**: Docker Compose

## 📋 Prerequisites
1. **Docker** and **Docker Compose** installed on your server (VPS).
   - [Install Docker on Ubuntu](https://docs.docker.com/engine/install/ubuntu/)
2. A domain name pointed to your server's IP (optional but recommended).

---

## 🚀 Step-by-Step Deployment

### 1. Clone & Prepare
Clone the repository to your server:
```bash
git clone <your-repo-url>
cd vk-learn-ver2
```

### 2. Configuration
The `docker-compose.yml` file defaults to a secure setup, but **you must change the secrets**.

Edit `docker-compose.yml` (or use a `.env` file) and change:
- `SECRET_KEY`: Generate a strong random string.
- `POSTGRES_PASSWORD`: Set a strong database password.
- `DJANGO_ALLOWED_HOSTS`: Add your domain name or server IP (e.g., `vk-portal.com 192.168.1.1`).

### 3. Build & Run
Start the application in the background:
```bash
docker compose up -d --build
```

### 4. Database Setup & Admin User
Once the containers are running, you need to create the first admin user:

```bash
# Copy users.csv to the backend container
docker compose cp users.csv backend:/app/users.csv

# Enter the backend container
docker compose exec backend python manage.py import_users /app/users.csv
```

---

## 🔒 SSL (HTTPS)
For a secure production environment, it is highly recommended to put a reverse proxy in front of the setup.

### Option A: Cloudflare (Easiest)
1. Point your domain to Cloudflare.
2. Set SSL to **Flexible** or **Full**.
3. Access your site via the domain.

### Option B: Nginx Proxy Manager (Recommended Self-Hosted)
1. Install [Nginx Proxy Manager](https://nginxproxymanager.com/).
2. Point it to port `80` of this Docker setup.
3. Generate Let's Encrypt certificates within the UI.

---

## 🧹 Maintenance

### Backups
Data is stored in Docker volumes:
- `postgres_data`: Database files.
- `media_volume`: User uploads and Certificates.

To backup:
```bash
# Backup Database
docker compose exec db pg_dump -U postgres vk_learn > backup_db.sql

# Backup Media
# (Copy /var/lib/docker/volumes/... or use a backup tool)
```

### Auto-Delete Old Certificates
Add a cron job on the host machine to clean up old certificates daily:

```bash
# Open crontab
crontab -e

# Add this line (runs daily at midnight)
0 0 * * * cd /path/to/vk-learn-ver2 && docker compose exec -T backend python manage.py delete_old_certificates
```

## 🛠️ Troubleshooting

- **502 Bad Gateway**: Check if backend is running (`docker compose logs backend`).
- **Static Files Missing**: Ensure `python manage.py collectstatic` ran (it's in the Dockerfile command).
- **Media 404**: Ensure `media_volume` is correctly shared between backend and frontend services.
