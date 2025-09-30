#!/bin/bash

# Script để chạy Docker development environment

echo "🚀 Starting Docker Development Environment..."

# Kiểm tra file .env
if [ ! -f .env ]; then
    echo "⚠️  File .env not found. Creating from example.env..."
    cp example.env .env
    echo "✅ Created .env file. Please update the configuration for Docker."
fi

# Tạo thư mục docker nếu chưa có
mkdir -p docker/postgres docker/redis docker/mongodb

echo "📦 Building and starting services..."

# Chạy docker-compose
docker-compose -f docker-compose.dev.yml up --build

echo "🎉 Development environment is ready!"
echo "Backend: http://localhost:3000"
echo "PostgreSQL: localhost:5432"
echo "Redis: localhost:6379"
echo "MongoDB: localhost:27017"
