# Hướng dẫn chạy ứng dụng NestJS với Docker cho Development

## Cấu hình Docker cho Development

Dự án đã được cấu hình để chạy `npm run start:dev` trong Docker container.

### Files đã tạo:

1. **Dockerfile.dev** - Dockerfile cho development
2. **docker-compose.dev.yml** - Docker Compose cho development
3. **DOCKER_DEV.md** - File hướng dẫn này

### Cách sử dụng:

#### 1. Cấu hình biến môi trường
Copy file `example.env` thành `.env` và cập nhật các giá trị cho phù hợp với Docker:

```bash
cp example.env .env
```

Trong file `.env`, cập nhật các giá trị sau:
```
# Database hosts cho Docker
SQL_HOST=postgresql
REDIS_HOST=redis
MONGODB_HOST=mongodb

# Ports (có thể giữ nguyên nếu không conflict)
SQL_PORT=5432
REDIS_PORT=6379
MONGODB_PORT=27017
```

#### 2. Chạy ứng dụng với Docker

```bash
# Chạy tất cả services (database + backend)
docker-compose -f docker-compose.dev.yml up

# Hoặc chạy trong background
docker-compose -f docker-compose.dev.yml up -d

# Chỉ chạy databases (để chạy backend local)
docker-compose -f docker-compose.dev.yml up postgresql redis mongodb
```

#### 3. Các lệnh hữu ích

```bash
# Xem logs của backend
docker-compose -f docker-compose.dev.yml logs -f backend

# Dừng tất cả services
docker-compose -f docker-compose.dev.yml down

# Rebuild và chạy lại
docker-compose -f docker-compose.dev.yml up --build

# Vào container backend
docker-compose -f docker-compose.dev.yml exec backend sh

# Chạy lệnh npm trong container
docker-compose -f docker-compose.dev.yml exec backend npm run test
```

### Cấu trúc services:

- **backend**: NestJS application chạy `npm run start:dev`
- **postgresql**: PostgreSQL database
- **redis**: Redis cache
- **mongodb**: MongoDB database

### Volume mapping:

- Source code được mount vào `/app` trong container
- `node_modules` được exclude để tránh conflict
- Database data được lưu trong `./docker/` folder

### Ports:

- Backend: `http://localhost:3000`
- PostgreSQL: `localhost:5432`
- Redis: `localhost:6379`
- MongoDB: `localhost:27017`

### Lưu ý:

1. Đảm bảo ports không bị conflict với services khác
2. File `.env` cần được cấu hình đúng với Docker network
3. Database data sẽ được lưu trong folder `./docker/`
4. Hot reload sẽ hoạt động nhờ volume mapping
