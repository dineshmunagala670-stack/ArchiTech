FROM python:3.9-slim AS builder
FROM python:3.9-slim AS runtime
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . /
CMD [