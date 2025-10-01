## Description

A.I-Soft Backend SQL

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## PostgreSQL

### Docker compose
#### 1. Cấu hình .env
```
SQL_TYPE=postgres
SQL_HOST=localhost
SQL_PORT=5432
SQL_USER=user_name
SQL_PASSWORD=mypassword
SQL_DB=sample_db
SQL_SCHEMA=myschema
```
#### 2. Tạo container

```bash
docker compose up -d postgresql
```
### Thủ công
#### 1. Tạo database
```sql
CREATE DATABASE sample_db;
```
#### 2. Tạo user
```sql
CREATE USER user_name WITH ENCRYPTED PASSWORD 'mypassword';
GRANT ALL PRIVILEGES ON DATABASE sample_db TO user_name;
```
#### 3. Đăng nhập
```bash
psql -U user_name --password
```

#### 4. Tạo schema
```sql
CREATE SCHEMA myschema
```

#### 5. Cấu hình .env
```
SQL_TYPE=postgres
SQL_HOST=localhost
SQL_PORT=5432
SQL_USER=user_name
SQL_PASSWORD=mypassword
SQL_DB=sample_db
SQL_SCHEMA=myschema
```

## Sequelize
### Migration
#### 1. Cài đặt `sequelize-cli`:
```bash
npm i -g sequelize-cli
```

#### 2. Tạo model kèm theo file migration tạo database:

```bash
sequelize-cli model:generate --name User --attributes _id:string,username:string,password:string,email:string,firstname:string,lastname:string,fullname:string,gender:string,dob:string,systemRole:string
```
Sau khi tạo xong, vào file migration sửa lại tên database, PK _id và bổ sung các loại dữ liệu cho các trường thông tin.
#### 3. Tạo migration mới:
```bash
sequelize-cli migration:create --name update-user-password  
```
Tên migration là nội dung thay đổi CSDL.
#### 4. Migrate
```bash
sequelize-cli db:migrate
```