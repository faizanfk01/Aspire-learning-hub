FROM python:3.11-slim

WORKDIR /app

# Install dependencies in a separate layer so rebuilds skip this step when
# requirements.txt hasn't changed.
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Run as a non-root user — least-privilege execution reduces blast radius if
# a dependency is ever compromised.
RUN adduser --disabled-password --gecos "" appuser \
    && chown -R appuser:appuser /app
USER appuser

EXPOSE 10000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "10000"]
