# Stage 1: Build Frontend Assets
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Stage 2: Python Backend & Runtime Environment
FROM python:3.12-slim
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy backend requirements & install
COPY backend/pyproject.toml backend/
RUN pip install --no-cache-dir uvicorn fastapi sqlalchemy psycopg2-binary pydantic-settings python-multipart python-jose[cryptography] passlib[bcrypt] pyyaml

# Copy backend code
COPY backend/ /app/backend/

# Copy compiled frontend from Stage 1 into backend's reachable path
COPY --from=frontend-builder /app/frontend/dist /app/frontend/dist

WORKDIR /app/backend

# Default Port and Environment
ENV PORT=8000
EXPOSE 8000

CMD ["python", "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
