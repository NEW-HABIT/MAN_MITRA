# 🚀 ManMitra — Free Tier Deployment Guide

This guide details how to deploy the entire **ManMitra** application (Django backend, PostgreSQL database, Next.js frontend) using 100% free tier hosting services:

- **Database**: **Supabase** (Free Postgres DB, 500MB storage)
- **Backend (Daphne/ASGI)**: **Render** (Free Python Web Service)
- **Frontend (Next.js)**: **Vercel** (Free Frontend Hosting)

---

## 📂 Table of Contents
1. [Step 1: Set Up Supabase Database](#step-1-set-up-supabase-database)
2. [Step 2: Deploy Backend to Render](#step-2-deploy-backend-to-render)
3. [Step 3: Deploy Frontend to Vercel](#step-3-deploy-frontend-to-vercel)
4. [Step 4: Configure Allowed Hosts & CORS](#step-4-configure-allowed-hosts--cors)
5. [Step 5: Post-Deployment Verification](#step-5-post-deployment-verification)
6. [💡 Troubleshooting & Best Practices](#-troubleshooting--best-practices)

---

## ⚡ Prerequisites
1. A **GitHub** account containing your pushed ManMitra code.
2. A **Google Gemini API Key** (for the AI features).
3. Free accounts on **Supabase**, **Render**, and **Vercel**.

---

## 1️⃣ Step 1: Set Up Supabase Database

Supabase offers a high-performance PostgreSQL instance on their free tier.

1. Sign up/log in to [Supabase](https://supabase.com/).
2. Click **New Project** and select your organization.
3. Configure your project:
   - **Name**: `manmitra-db`
   - **Database Password**: *Set a secure password and save it somewhere safe.*
   - **Region**: Choose a region closest to your users or closest to Render's servers (usually `US East` or `US West`).
4. Click **Create new project** (this takes about 1–2 minutes to provision).
5. Once provisioned, retrieve your connection URI:
   - Go to **Project Settings** (gear icon on bottom left) ➔ **Database**.
   - Scroll down to the **Connection string** section.
   - Click the **URI** tab.
   - Copy the string. It will look like this:
     ```text
     postgresql://postgres:[YOUR-PASSWORD]@db.xxxxxx.supabase.co:5432/postgres
     ```
   - **Important**: Replace `[YOUR-PASSWORD]` with the database password you chose during project creation. If your password has special characters, URL-encode them.

---

## 2️⃣ Step 2: Deploy Backend to Render

Render will host the Django Daphne/ASGI backend container.

1. Sign up/log in to [Render](https://render.com/).
2. Click **New +** (top right) ➔ **Web Service**.
3. Choose **Build and deploy from a Git repository**.
4. Select your **ManMitra** repository.
5. Configure the Web Service settings:
   - **Name**: `manmitra-backend`
   - **Region**: Same region as your Supabase database (e.g., Oregon US-West or Ohio US-East) to minimize latency.
   - **Branch**: `main` (or whichever branch holds your production-ready code).
   - **Language/Runtime**: `Python`
   - **Build Command**: 
     ```bash
     pip install -r backend/requirements/base.txt && python backend/manage.py collectstatic --noinput
     ```
   - **Start Command**:
     ```bash
     cd backend && daphne -b 0.0.0.0 -p $PORT config.asgi:application
     ```
     *(Render sets the `$PORT` environment variable automatically, and Daphne binds to it)*
   - **Instance Type**: Select **Free** ($0/month).
6. Expand the **Advanced** section to add your Environment Variables (listed below).

### 🔑 Environment Variables for Render Backend
Click **Add Environment Variable** for each of the following:

| Key | Value | Description |
| :--- | :--- | :--- |
| `DJANGO_SETTINGS_MODULE` | `config.settings.production` | Instructs Django to use production configurations. |
| `SECRET_KEY` | `your-random-production-secret-key` | A secure, long, random string. |
| `DEBUG` | `False` | Disables debug mode for safety. |
| `DATABASE_URL` | `postgresql://postgres:password@db.xxxxxx.supabase.co:5432/postgres` | Your **Supabase URI** from Step 1. |
| `GEMINI_API_KEY` | `AIzaSy...` | Your Google Gemini API Key. |
| `ALLOWED_HOSTS` | `manmitra-backend.onrender.com` | Your Render domain (which you will get upon creating the service). *You will append your frontend domain here later.* |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:3000` | *We will update this with the Vercel frontend URL once deployed.* |
| `FRONTEND_URL` | `http://localhost:3000` | *We will update this with the Vercel frontend URL once deployed.* |
| `AI_PROVIDER` | `gemini` | AI engine fallback setting. |

7. Click **Create Web Service**. 
   Render will begin building your Python service, installing dependencies, collecting static files, and starting the ASGI Daphne server. Note that because of WhiteNoise, your static assets will be served directly by the container!

---

## 3️⃣ Step 3: Deploy Frontend to Vercel

Vercel provides native, optimized hosting for Next.js applications.

1. Sign up/log in to [Vercel](https://vercel.com/).
2. Click **Add New** ➔ **Project**.
3. Import your **ManMitra** GitHub repository.
4. In the configuration window:
   - **Framework Preset**: `Next.js` (automatically detected).
   - **Root Directory**: Click *Edit* and select the `frontend` folder.
5. Expand the **Environment Variables** section and add:
   - **Key**: `NEXT_PUBLIC_API_URL`
   - **Value**: Your Render backend URL (e.g., `https://manmitra-backend.onrender.com`)
6. Click **Deploy**.
   Vercel will build the frontend and provide you with a deployment URL (e.g., `https://manmitra-frontend.vercel.app`).

---

## 4️⃣ Step 4: Configure Allowed Hosts & CORS

Now that your frontend is live on Vercel and your backend is live on Render, they must be linked together.

1. Copy your Vercel deployment URL (e.g., `https://manmitra-frontend.vercel.app`).
2. Go back to your **Render Dashboard** ➔ Select your `manmitra-backend` Web Service ➔ **Environment**.
3. Update the following environment variables:
   - **`ALLOWED_HOSTS`**: `manmitra-backend.onrender.com,manmitra-frontend.vercel.app` (comma-separated, without spaces or `https://` prefixes).
   - **`CORS_ALLOWED_ORIGINS`**: `https://manmitra-frontend.vercel.app` (include the `https://` prefix, no trailing slash).
   - **`FRONTEND_URL`**: `https://manmitra-frontend.vercel.app`
4. Save the changes. Render will automatically redeploy the backend with the new variables.

---

## 5️⃣ Step 5: Post-Deployment Verification

1. **Database Migrations Check**:
   During the first deployment build, migrations should run automatically. If you need to manually run migrations or create a superuser:
   - Go to **Render Dashboard** ➔ `manmitra-backend` ➔ **Shell** tab on the left menu.
   - Run:
     ```bash
     python backend/manage.py createsuperuser
     ```
     Follow the prompts in the terminal to set up your administrator credentials.
2. **Access Django Admin**:
   Visit `https://manmitra-backend.onrender.com/admin` in your browser. Verify that the login screen appears (styled correctly via WhiteNoise static files) and you can log in using your superuser account.
3. **Verify API Connectivity**:
   Visit `https://manmitra-frontend.vercel.app`. Open your browser's Developer Tools (F12) Console. Verify there are no CORS block errors when interacting with the page.
4. **WebSocket Connection**:
   Test real-time features like chat. Open your network tab and look for WebSocket requests connecting to `wss://manmitra-backend.onrender.com/ws/...`. Since Django Channels uses `InMemoryChannelLayer` and Daphne is hosting the ASGI application on Render, WebSockets will operate smoothly!

---

## 💡 Troubleshooting & Best Practices

### 😴 Render Free Tier Spin-Down
Render's Free Tier web services spin down after 15 minutes of inactivity. When a user visits the site after a period of dormancy, the first request will take about **50 seconds** to boot back up. 
*Tip: You can use a free ping tool (like [Uptime Robot](https://uptimerobot.com/)) to send an HTTP request to `https://manmitra-backend.onrender.com/` every 10–14 minutes, keeping it awake.*

### 🛠️ Supabase Free Tier Inactivity Pause
Supabase pauses free tier projects that receive no API requests or traffic for **7 consecutive days**. If your database stops responding, log in to the Supabase Dashboard and click **Resume Database** on your project home page.

### 📁 Ephemeral Media Uploads
Because Render's free tier instances do not include persistent disks, any user-uploaded files (like custom user profile avatars) saved to the `media/` directory will be deleted whenever the service redeploys or restarts.
*For production media persistence, it is recommended to eventually configure Django to upload files to an external storage service (like AWS S3 or Cloudinary).*
