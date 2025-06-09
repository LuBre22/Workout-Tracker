FROM python:3.11-slim

WORKDIR /app

# Copy backend and frontend code
COPY ./Backend /app/Backend
COPY ./Frontend /app/Frontend

# Copy requirements (create this if you don't have one)
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Expose FastAPI port
EXPOSE 8000

# Start FastAPI app
CMD ["uvicorn", "Backend.Main:app", "--host", "0.0.0.0", "--port", "8000"]