FROM python:3.12-slim

WORKDIR /app

# Install system dependencies (optional but good for ML libraries)
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application
COPY . .

# Set Hugging Face environment variables
ENV HOST=0.0.0.0
ENV PORT=7860

# Start the application using gunicorn for production
CMD ["gunicorn", "app:app", "--bind", "0.0.0.0:7860", "--timeout", "120"]
