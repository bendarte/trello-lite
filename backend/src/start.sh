#!/bin/bash
set -e

echo "Waiting for database..."
python wait_for_db.py

echo "Starting application..."
exec uvicorn main:app --host 0.0.0.0 --port 8000 --reload 