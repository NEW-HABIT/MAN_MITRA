#!/usr/bin/env bash
# ManMitra — Render Build Script (Backend)
# Runs during every Render deploy before the server starts.
set -e

pip install -r requirements/production.txt
python manage.py collectstatic --noinput
python manage.py migrate --noinput
python create_superuser.py
