# Use official Python runtime as a parent image
FROM python:3.13-slim

# Set environment variables first
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    postgresql-client \
    libpq-dev \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Set working directory in container
WORKDIR /app

# Upgrade pip, setuptools, wheel
RUN python -m pip install --upgrade pip setuptools wheel

# Copy requirements file
COPY backend/req.txt /app/requirements.txt

# Install Python dependencies with verbose output
RUN echo "Installing Python dependencies..." && \
    pip install --no-cache-dir -v -r /app/requirements.txt && \
    echo "Dependencies installed successfully"

# Verify fastapi is installed
RUN python -c "import fastapi; print(f'FastAPI version: {fastapi.__version__}')" || exit 1

# Copy backend application code
COPY backend/ /app/

# Expose port
EXPOSE 8000

# Run the application with uvicorn
CMD ["python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
